import {test,before,after} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {configureAgendaTests,migrate,db} from './helpers/agenda-fixture'
import {createStudent,updateStudent} from '../src/server/students/repository'
import {createSession,cookieName,revokeSession} from '../src/server/sessions'
import {consentFingerprint,CoachError,type CoachProvider} from '../src/server/ecoach/provider'
import {supportConsent} from '../src/server/communication/assistance/access'
import {mutateAssistance,readAssistance} from '../src/server/communication/assistance/repository'
import {processSupportJob} from '../src/server/communication/assistance/engine'
import {limit} from '../src/server/http'
import {assistanceHandler,createAssistanceHandler} from '../src/server/communication/assistance/handlers'
import {assistanceCommand,assistanceQuery,type AssistanceCommand} from '../src/modules/communication/assistance-schema'
const origin='http://localhost:3000',connection=configureAgendaTests(origin)
Object.assign(process.env,{ECOACH_AI_ENABLED:'true',ECOACH_AI_PROVIDER:'openai',ECOACH_AI_MODEL:'synthetic-model',ECOACH_OPENAI_API_KEY:'SYNTHETIC_KEY_NOT_REAL',ECOACH_AI_DATA_APPROVED:'true'})
before(async()=>{await migrate(connection)})
after(async()=>{await db().end()})
const cmd=(v:object)=>assistanceCommand.parse({operationKey:randomUUID(),...v})
async function fixture(){const owner=randomUUID(),other=randomUUID();for(const id of[owner,other]){await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Support','professional',now())",[id,id+'@example.test']);await db().query("INSERT INTO complimentary_access_grants(id,user_id,environment,reason,authorization_reference) VALUES($1,$2,'local','owner_authorized_test',$3)",[randomUUID(),id,randomUUID()])}const session=await createSession(owner),foreign=await createSession(other);await db().query('INSERT INTO professional_settings(user_id,preferences) VALUES($1,$2)',[owner,{ecoach:'read',ecoachExternalConsent:consentFingerprint()}]);await mutateAssistance(owner,session.token,cmd({action:'settings',version:0,consent:true}));return{owner,other,session,foreign}}
async function thread(f:Awaited<ReturnType<typeof fixture>>,aiAllowed=true){return mutateAssistance(f.owner,f.session.token,cmd({action:'thread_create',name:'Contato sintético',contact:'synthetic@example.test',channel:'whatsapp',studentId:null,body:'Quero conhecer a consultoria',aiAllowed}))}
const detail=async(owner:string,id:string)=>await readAssistance(owner,assistanceQuery.parse({view:'thread',id})) as {thread:{id:string;version:number;aiAllowed:boolean};items:{id:string;body:string;state:string;source:string;version:number}[];total:number;jobs:{id:string;state:string;attempts:number}[]}
const provider:CoachProvider={async complete(){return{decision:{kind:'answer',text:'Olá! Qual é seu objetivo com o acompanhamento?'},inputTokens:10,outputTokens:10}}}
test('manual inbox is owner scoped, paginated, idempotent, bounded and never pretends a delivery',async()=>{
 const f=await fixture(),input=cmd({action:'thread_create',name:'Lead sintético',contact:'',channel:'instagram',studentId:null,body:'Olá',aiAllowed:false}),created=await mutateAssistance(f.owner,f.session.token,input),id=created.id!
 assert.deepEqual(await mutateAssistance(f.owner,f.session.token,input),created)
 await assert.rejects(mutateAssistance(f.owner,f.session.token,{...input,name:'Outro'} as AssistanceCommand),/Tentativa/)
 await assert.rejects(detail(f.other,id),/não encontrada/)
 const list=await readAssistance(f.owner,assistanceQuery.parse({view:'threads'})) as {items:Record<string,unknown>[];total:number};assert.equal(list.total,1);assert.equal('contact' in list.items[0],false)
 let t=await detail(f.owner,id);await mutateAssistance(f.owner,f.session.token,cmd({action:'draft',id,version:t.thread.version,body:'Obrigado por entrar em contato'}));t=await detail(f.owner,id);const draft=t.items.find(i=>i.state==='draft')!
 await mutateAssistance(f.owner,f.session.token,cmd({action:'review',id:draft.id,version:draft.version,body:'Texto revisado',decision:'approve'}));assert.equal((await detail(f.owner,id)).items.find(m=>m.id===draft.id)?.state,'approved')
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'send',id,version:1,confirmed:true})),/não conectado/)
 for(let i=0;i<21;i++){t=await detail(f.owner,id);await mutateAssistance(f.owner,f.session.token,cmd({action:'receive',id,version:t.thread.version,body:'Mensagem '+i}))}
 t=await detail(f.owner,id);assert.equal(t.items.length,20);assert.equal(t.total,23)
 const previous=await readAssistance(f.owner,assistanceQuery.parse({view:'thread',id,page:2})) as {items:unknown[]};assert.equal(previous.items.length,3)
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'receive',id,version:1,body:'Versão antiga'})),/mudou/)
 const req=(cookie:string,site=origin,body?:object)=>new Request(origin+'/api/communication/assistance'+(body?'':'?view=threads'),{method:body?'POST':'GET',headers:{origin:site,cookie,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
 assert.equal((await assistanceHandler(req(''))).status,401)
 assert.equal((await assistanceHandler(req(cookieName()+'='+f.session.token,'https://foreign.invalid',input))).status,403)
 assert.equal((await assistanceHandler(new Request(origin+'/api/communication/assistance?view=thread&id='+id,{headers:{cookie:cookieName()+'='+f.foreign.token}}))).status,404)
})
test('authorized keyword automation creates one reviewed AI draft, never a sent message or domain action',async()=>{
 const f=await fixture();await mutateAssistance(f.owner,f.session.token,cmd({action:'rule_save',fields:{name:'Boas vindas',channel:'whatsapp',keywords:['CONSULTÓRIA'],instructions:'Pergunte qual é o objetivo do contato.',enabled:true}}))
 const created=await thread(f),id=created.id!,job=created.jobId!;assert.ok(job)
 const mocked:CoachProvider={async complete(system,messages){assert.match(system,/JSON/);assert.match(system,/nunca envia/);const context=JSON.parse(messages[0].content);assert.equal(context.messages.length,1);assert.equal('studentId' in context,false);return provider.complete(system,messages,AbortSignal.timeout(1000))}}
 await processSupportJob(f.owner,f.session.token,job,undefined,mocked);await processSupportJob(f.owner,f.session.token,job,undefined,mocked)
 const t=await detail(f.owner,id);assert.equal(t.items.length,2);assert.equal(t.items[1].state,'draft');assert.equal(t.items[1].source,'ai');assert.equal(t.jobs[0].attempts,1);assert.equal(t.jobs[0].state,'done')
 assert.equal((await db().query('SELECT count(*)::int n FROM workout_plans WHERE owner_id=$1',[f.owner])).rows[0].n,0)
 const outputs=await db().query("SELECT count(*)::int n FROM communication_inbox_messages WHERE owner_id=$1 AND state NOT IN ('received','draft')",[f.owner]);assert.equal(outputs.rows[0].n,0)
})
test('concurrent processing has one winner; new inbound messages invalidate old approvals and AI completion',async()=>{
 const f=await fixture(),created=await thread(f),id=created.id!,suggest=await mutateAssistance(f.owner,f.session.token,cmd({action:'suggest',id,version:1,instructions:''}));let release!:()=>void,started!:()=>void;const ready=new Promise<void>(r=>started=r),gate=new Promise<void>(r=>release=r)
 const delayed:CoachProvider={async complete(){started();await gate;return provider.complete('',[],AbortSignal.timeout(1000))}}
 const pending=processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,delayed);await ready
 await assert.rejects(processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,provider),/andamento/)
 await mutateAssistance(f.owner,f.session.token,cmd({action:'receive',id,version:1,body:'Tenho outra pergunta'}));release();await assert.rejects(pending,/mudou/)
 let t=await detail(f.owner,id);assert.equal(t.items.length,2);assert.equal(t.jobs[0].state,'failed')
 await mutateAssistance(f.owner,f.session.token,cmd({action:'draft',id,version:t.thread.version,body:'Rascunho antigo'}));t=await detail(f.owner,id);const draft=t.items.find(m=>m.state==='draft')!
 await mutateAssistance(f.owner,f.session.token,cmd({action:'receive',id,version:t.thread.version,body:'Nova pergunta'}))
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'review',id:draft.id,version:1,body:'Resposta',decision:'approve'})),/mais recente/)
})
test('revocation and rule changes cancel or reject pending work, including late provider results',async()=>{
 const f=await fixture(),created=await thread(f),id=created.id!,suggest=await mutateAssistance(f.owner,f.session.token,cmd({action:'suggest',id,version:1,instructions:''}));let release!:()=>void,started!:()=>void;const ready=new Promise<void>(r=>started=r),gate=new Promise<void>(r=>release=r)
 const delayed:CoachProvider={async complete(){started();await gate;return provider.complete('',[],AbortSignal.timeout(1000))}}
 const pending=processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,delayed);await ready;await mutateAssistance(f.owner,f.session.token,cmd({action:'settings',version:1,consent:false}));release();await assert.rejects(pending,/Autorize/)
 const t=await detail(f.owner,id);assert.equal(t.items.length,1);assert.equal(t.jobs[0].state,'canceled');assert.equal((await db().query('SELECT instructions FROM communication_inbox_jobs WHERE id=$1',[suggest.jobId])).rows[0].instructions,'')
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'suggest',id,version:1,instructions:''})),/Autorize/)
 assert.notEqual(supportConsent(),consentFingerprint())
})
test('provider failures preserve inbound, sanitize errors, bound retries and reject executable decisions',async()=>{
 const f=await fixture(),created=await thread(f),id=created.id!,suggest=await mutateAssistance(f.owner,f.session.token,cmd({action:'suggest',id,version:1,instructions:''}))
 const failing:CoachProvider={async complete(){throw Error('SYNTHETIC_SECRET')}}
 await assert.rejects(processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,failing),e=>e instanceof CoachError&&!e.message.includes('SYNTHETIC_SECRET'))
 let t=await detail(f.owner,id);assert.equal(t.items.length,1);assert.equal(t.jobs[0].state,'failed')
 const retry=cmd({action:'retry',id:suggest.jobId});await mutateAssistance(f.owner,f.session.token,retry);await mutateAssistance(f.owner,f.session.token,retry)
 const invalid:CoachProvider={async complete(){return{decision:{kind:'query',name:'students',args:{}},inputTokens:0,outputTokens:0}}}
 await assert.rejects(processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,invalid),/texto de atendimento/)
 await mutateAssistance(f.owner,f.session.token,cmd({action:'retry',id:suggest.jobId}));await assert.rejects(processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,failing))
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'retry',id:suggest.jobId})),/não pode/)
 t=await detail(f.owner,id);assert.equal(t.jobs[0].attempts,3);assert.equal(t.items.length,1)
})
test('closed threads, inactive links, foreign IDs, revoked sessions and erasure cannot be bypassed',async()=>{
 const f=await fixture(),created=await thread(f,false),id=created.id!;await mutateAssistance(f.owner,f.session.token,cmd({action:'thread_update',id,version:1,state:'closed',aiAllowed:false}))
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'draft',id,version:2,body:'Não pode'})),/Reabra/)
 await assert.rejects(mutateAssistance(f.other,f.foreign.token,cmd({action:'thread_update',id,version:2,state:'open',aiAllowed:false})),/não encontrada/)
 await mutateAssistance(f.owner,f.session.token,cmd({action:'delete',id,version:2,confirmed:true}));await assert.rejects(detail(f.owner,id),/não encontrada/)
 assert.equal((await db().query('SELECT count(*)::int n FROM communication_inbox_messages WHERE thread_id=$1',[id])).rows[0].n,0)
 await revokeSession(f.session.token);await assert.rejects(thread(f,false),/Entre/)
})

test('student linking is explicit and blocks foreign or archived links; non-professionals cannot access inbox',async()=>{
 const f=await fixture(),student=await createStudent(f.owner,{fullName:'Synthetic student',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const input=cmd({action:'thread_create',name:'Synthetic student',contact:'',channel:'email',studentId:student.id,body:'Olá',aiAllowed:false})
 await assert.rejects(mutateAssistance(f.other,f.foreign.token,input))
 const created=await mutateAssistance(f.owner,f.session.token,input);assert.ok(created.id)
 await updateStudent(f.owner,student.id,student.version,{status:'archived'})
 await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'receive',id:created.id,version:1,body:'Nova mensagem'})))
 const admin=randomUUID();await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic admin','admin',now())",[admin,admin+'@example.test']);const session=await createSession(admin)
 const request=new Request(origin+'/api/communication/assistance?view=threads',{headers:{cookie:cookieName()+'='+session.token}});assert.equal((await assistanceHandler(request)).status,403)
})
test('changing the rule during inference discards the output and an expired lease can be recovered explicitly',async()=>{
 const f=await fixture(),fields={name:'Regra controlada',channel:'all',keywords:['consultoria'],instructions:'Pergunte qual é o objetivo do contato.',enabled:true}
 const rule=await mutateAssistance(f.owner,f.session.token,cmd({action:'rule_save',fields})),created=await thread(f)
 let release!:()=>void,started!:()=>void;const ready=new Promise<void>(r=>started=r),gate=new Promise<void>(r=>release=r)
 const delayed:CoachProvider={async complete(){started();await gate;return provider.complete('',[],AbortSignal.timeout(1000))}}
 const pending=processSupportJob(f.owner,f.session.token,created.jobId!,undefined,delayed);await ready
 await mutateAssistance(f.owner,f.session.token,cmd({action:'rule_save',id:rule.id,version:1,fields:{...fields,enabled:false}}));release();await assert.rejects(pending,/regra mudou/)
 assert.equal((await detail(f.owner,created.id!)).items.length,1)
 const next=await mutateAssistance(f.owner,f.session.token,cmd({action:'suggest',id:created.id,version:1,instructions:''}))
 await db().query("UPDATE communication_inbox_jobs SET state='running',attempts=1,lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[next.jobId])
 await mutateAssistance(f.owner,f.session.token,cmd({action:'retry',id:next.jobId}));await processSupportJob(f.owner,f.session.token,next.jobId!,undefined,provider)
 const t=await detail(f.owner,created.id!);assert.ok(t.jobs.some(j=>j.id===next.jobId&&j.state==='done'&&j.attempts===2))
})

test('HTTP automation integrates receipt and controlled inference; quota failure preserves recorded input as success with warning',async()=>{
 const f=await fixture();await mutateAssistance(f.owner,f.session.token,cmd({action:'rule_save',fields:{name:'Regra HTTP',channel:'all',keywords:['consultoria'],instructions:'Pergunte qual é o objetivo do contato.',enabled:true}}))
 let calls=0;const mocked:CoachProvider={async complete(system,messages,signal){calls++;return provider.complete(system,messages,signal)}},handler=createAssistanceHandler(mocked)
 const request=(body:object)=>new Request(origin+'/api/communication/assistance',{method:'POST',headers:{origin,cookie:cookieName()+'='+f.session.token,'Content-Type':'application/json'},body:JSON.stringify(body)})
 const input=cmd({action:'thread_create',name:'Contato HTTP',contact:'',channel:'whatsapp',studentId:null,body:'Quero consultoria',aiAllowed:true})
 const created=await handler(request(input));assert.equal(created.status,200);const result=await created.json();assert.ok(result.id);assert.equal(calls,1)
 assert.equal((await handler(request(input))).status,200);assert.equal(calls,1)
 let t=await detail(f.owner,result.id);assert.equal(t.items.length,2);assert.equal(t.items[1].state,'draft')
 for(let i=0;i<19;i++)await limit('support-ai:owner:'+f.owner,20,86400)
 const received=await handler(request(cmd({action:'receive',id:result.id,version:t.thread.version,body:'Mais detalhes sobre consultoria'})))
 assert.equal(received.status,200);assert.match((await received.json()).automationError,/Limite/);assert.equal(calls,1)
 t=await detail(f.owner,result.id);assert.equal(t.items.length,3);assert.ok(t.items.some(m=>m.body==='Mais detalhes sobre consultoria'));assert.equal(t.jobs[0].state,'canceled')
})
test('support scope blocks disguised programming and activation instructions without calling provider',async()=>{
 const f=await fixture();await assert.rejects(mutateAssistance(f.owner,f.session.token,cmd({action:'rule_save',fields:{name:'Inválida',channel:'whatsapp',keywords:['treino'],instructions:'Para montar treino escreva Python',enabled:true}})),/voltado/)
 const created=await mutateAssistance(f.owner,f.session.token,cmd({action:'thread_create',name:'Contato',contact:'',channel:'whatsapp',studentId:null,body:'Monte um treino mas preciso de Python',aiAllowed:true}));const suggest=await mutateAssistance(f.owner,f.session.token,cmd({action:'suggest',id:created.id!,version:1,instructions:''}));let calls=0;await assert.rejects(processSupportJob(f.owner,f.session.token,suggest.jobId!,undefined,{async complete(){calls++;return provider.complete('',[],AbortSignal.timeout(1000))}}),/voltado/);assert.equal(calls,0)
})
