import {artifactPath} from './helpers/artifacts'
import {before,beforeEach,after,test} from 'node:test'
import assert from 'node:assert/strict'
import {randomBytes,randomUUID} from 'node:crypto'
import {writeFile,mkdir} from 'node:fs/promises'
import Stripe from 'stripe'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {createSession} from '../src/server/sessions'
import {startCheckout,processBillingEvent} from '../src/server/subscriptions/service'
import {ControlledGateway,fixture} from './helpers/controlled-billing'
import {createStudent,updateStudent} from '../src/server/students/repository'
import {configuration,initializeCrm,transaction} from '../src/server/crm/core'
import {board,cards,fact,factsSql} from '../src/server/crm/facts'
import {archiveStage,move,previewArchive,previewMove,reorderStages,saveStage,settings} from '../src/server/crm/stages'
import {getTask,history,listTasks,saveTask,synchronizeTasks,taskStatus} from '../src/server/crm/tasks'
import {crmHandler} from '../src/server/crm/handlers'
import {crmQuery,stageFields,taskFields,type Settings,type Stage} from '../src/modules/crm/schema'
import {invite,openPublic,submitPublic,changeRequest} from '../src/server/intake/repository'
import {STANDARD_ID} from '../src/modules/intake/standard'
import {createPlan} from '../src/server/workouts/repository'
import {emptyWorkout} from '../src/modules/workouts/schema'
import {blankAssessment,today} from '../src/modules/assessments/schema'
import {createPhysicalAssessment} from '../src/server/assessments/repository'
import {requestErasure,processErasure} from '../src/server/privacy/erasure'
const connection=process.env.TEST_DATABASE_URL
if(!connection||!new URL(connection).pathname.endsWith('_test'))throw Error('Disposable _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3109',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_not_real',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_not_real'})
let owner:string,other:string,cookie:string,provider:ControlledGateway,student:{id:string},foreign:{id:string},cfg:{settings:Settings;stages:Stage[]}
const sf={fullName:'Aluno sintético CRM',email:'',phone:'',birthDate:'',adminNotes:'PRIVATE_ADMIN_NOT_IN_CRM'}
const fields={name:'Etapa personalizada',description:'Descrição operacional',color:'blue' as const,active:true,operator:'all' as const,rules:[]}
const tf={title:'Contatar aluno',description:'Nota operacional restrita ao detalhe',priority:'high' as const,dueAt:null,required:false}
before(async()=>{await migrate(connection);await migrate(connection)})
beforeEach(async()=>{await db().query('TRUNCATE users,billing_events,abuse_limits CASCADE');owner=randomUUID();other=randomUUID();provider=new ControlledGateway();for(const id of [owner,other])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Profissional sintético','professional',now())",[id,id+'@example.test']);cookie='formfisik-session='+(await createSession(owner)).token;await startCheckout(owner,provider);const {session}=provider.complete();await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),livemode:false,type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:session}}),provider);student=await createStudent(owner,{...sf,creationKey:randomUUID()});foreign=await createStudent(other,{...sf,fullName:'FOREIGN_NAME_MUST_NOT_LEAK',creationKey:randomUUID()});await initializeCrm(owner);cfg=await configuration(owner)})
after(async()=>{await db().end()})
const query=(v={})=>crmQuery.parse(v)
const req=(body?:unknown,session=cookie,path='')=>new Request(process.env.APP_URL+'/api/crm'+path,{method:body?'POST':'GET',headers:{origin:process.env.APP_URL!,cookie:session,'content-type':'application/json'},body:body?JSON.stringify(body):undefined})
const card=()=>transaction(c=>fact(c,owner,student.id))
async function newStage(input={}){const result=await saveStage(owner,{operationKey:randomUUID(),boardVersion:(await configuration(owner)).settings.version,fields:{...fields,...input}});cfg=await configuration(owner);return result.id}
async function performMove(to:string,key=randomUUID()){const p=await previewMove(owner,student.id,to);return move(owner,{operationKey:key,boardVersion:p.boardVersion,studentId:student.id,version:p.version,to,acknowledgedRecommendations:true,confirmed:true})}
test('018 schemas reject unexpected fields, invalid condition keys/modes/days, limits and unsafe task inputs',()=>{
 assert.ok(stageFields.safeParse(fields).success);for(const extra of [{rules:[{key:'payment',mode:'entry'}]},{rules:[{key:'intake_reviewed',mode:'entry',expression:'eval()'}]},{name:'x'},{color:'#ffffff'},{rules:[{key:'assessment_recent',mode:'entry',days:0}]},{rules:[{key:'intake_reviewed',mode:'info'},{key:'intake_reviewed',mode:'info'}]},{ownerId:other}])assert.equal(stageFields.safeParse({...fields,...extra}).success,false)
 assert.equal(taskFields.safeParse({...tf,title:'',responsibleId:other}).success,false);assert.equal(crmQuery.safeParse({from:'2026-02-30'}).success,false)
})
test('018 default CRM enrolls existing canonical students once and newly created/invited students atomically',async()=>{
 await Promise.all([initializeCrm(owner),initializeCrm(owner)]);assert.equal((await configuration(owner)).stages.length,6);assert.equal((await db().query('SELECT count(*)::int n FROM crm_memberships WHERE professional_id=$1',[owner])).rows[0].n,1)
 const next=await createStudent(owner,{...sf,fullName:'Segundo aluno',creationKey:randomUUID()});assert.ok((await db().query('SELECT 1 FROM crm_memberships WHERE professional_id=$1 AND student_link_id=$2',[owner,next.id])).rowCount)
 const i=await invite(owner,STANDARD_ID),opened=await openPublic(i.token);await submitPublic(i.token,{registration:{fullName:'Novo por convite CRM',email:'',phone:'',birthDate:''},answers:{[opened.definition.sections[0].questions[0].id]:'Objetivo sintético'},acknowledged:true});assert.equal((await db().query('SELECT count(*)::int n FROM crm_memberships WHERE professional_id=$1',[owner])).rows[0].n,3)
})
test('018 stages create/edit/order/activate/initial configuration preserve independent student identity',async()=>{
 const id=await newStage();await assert.rejects(newStage(),e=>e instanceof Error)
 await saveStage(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,id,fields:{...fields,name:'Renomeada',active:false}});cfg=await configuration(owner);assert.equal(cfg.stages.find(s=>s.id===id)!.active,false)
 await reorderStages(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,ids:cfg.stages.filter(s=>!s.archived).map(s=>s.id).reverse()});cfg=await configuration(owner);assert.equal(cfg.stages[0].id,id)
 await settings(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,initialStageId:cfg.stages.find(s=>s.active&&s.id!==cfg.settings.initial_stage_id)!.id,recentDays:60,autoReview:false,autoWorkout:false,autoAssessment:false});assert.equal((await card()).stage_id,cfg.settings.initial_stage_id)
})
test('018 informative/recommended/mandatory entry and exit use canonical all/any groups',async()=>{
 const target=await newStage({rules:[{key:'intake_reviewed',mode:'entry'}]});let p=await previewMove(owner,student.id,target);assert.equal(p.allowed,false);await assert.rejects(performMove(target))
 await saveStage(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,id:target,fields:{...fields,rules:[{key:'intake_reviewed',mode:'recommended'}]}});p=await previewMove(owner,student.id,target);assert.equal(p.allowed,true);assert.equal(p.recommendationRequired,true);await assert.rejects(move(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,studentId:student.id,version:p.version,to:target,acknowledgedRecommendations:false,confirmed:true}))
 await performMove(target);cfg=await configuration(owner);await saveStage(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,id:target,fields:{...fields,rules:[{key:'workout_active',mode:'exit'}]}});await assert.rejects(performMove(cfg.settings.initial_stage_id))
 cfg=await configuration(owner);await saveStage(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,id:target,fields:{...fields,operator:'any',rules:[{key:'workout_active',mode:'exit'},{key:'workout_pending',mode:'exit'}]}});await performMove(cfg.settings.initial_stage_id)
})
test('018 movement is transactional, idempotent, audited, and concurrent tabs cannot overwrite one another',async()=>{
 const a=await newStage({name:'Destino A'}),b=await newStage({name:'Destino B'}),p=await previewMove(owner,student.id,a),key=randomUUID(),input={operationKey:key,boardVersion:p.boardVersion,studentId:student.id,version:p.version,to:a,acknowledgedRecommendations:true,confirmed:true as const}
 const r=await Promise.allSettled([move(owner,input),move(owner,{...input,operationKey:randomUUID(),to:b})]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1)
 const winning=(await card()).stage_id;if(winning===a){await move(owner,input);assert.equal((await db().query("SELECT count(*)::int n FROM crm_events WHERE professional_id=$1 AND kind='moved'",[owner])).rows[0].n,1)}
 const f=await card();assert.equal(f.version,2);assert.equal((await db().query('SELECT version FROM student_links WHERE id=$1',[student.id])).rows[0].version,1)
})
test('018 stage archived or rule changed after preview invalidates pending movement',async()=>{
 const id=await newStage(),p=await previewMove(owner,student.id,id);const preview=await previewArchive(owner,id);await archiveStage(owner,{operationKey:randomUUID(),boardVersion:preview.boardVersion,stageId:id,digest:preview.digest,confirmed:true,acknowledgedRecommendations:true})
 await assert.rejects(move(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,studentId:student.id,version:p.version,to:id,confirmed:true,acknowledgedRecommendations:true}))
 assert.equal((await card()).stage_id,cfg.settings.initial_stage_id)
})
test('018 occupied archive requires exact preview, explicit target and preserves audit through controlled transfer',async()=>{
 const source=await newStage({name:'Origem ocupada'}),target=await newStage({name:'Destino transferência'});await performMove(source);await assert.rejects(previewArchive(owner,source));const p=await previewArchive(owner,source,target);assert.equal(p.total,1)
 await assert.rejects(archiveStage(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,stageId:source,to:target,digest:'0'.repeat(64),confirmed:true,acknowledgedRecommendations:true}));const result=await archiveStage(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,stageId:source,to:target,digest:p.digest,confirmed:true,acknowledgedRecommendations:true});assert.equal(result.archived,true);assert.equal((await card()).stage_id,target);assert.ok((await history(owner,query({studentId:student.id}))).total>=3)
})
test('018 tasks create/edit/complete/reopen/cancel/archive with real deadlines and no duplicate operation events',async()=>{
 const input={operationKey:randomUUID(),studentId:student.id,fields:{...tf,dueAt:'2025-01-01T12:00:00.000Z',required:true}},created=await saveTask(owner,input);assert.equal((await saveTask(owner,input)).id,created.id)
 let t=await getTask(owner,created.id);await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,id:t.id,version:t.version,fields:{...input.fields,title:'Título atualizado'}});t=await getTask(owner,t.id)
 const results=await Promise.allSettled([taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'completed'}),taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'in_progress'})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);t=await getTask(owner,t.id);if(t.status!=='completed')await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'completed'});t=await getTask(owner,t.id);assert.ok(t.completed_at)
 await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'pending'});t=await getTask(owner,t.id);assert.equal(t.completed_at,null);await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'canceled'});assert.equal((await card()).required_open,1);t=await getTask(owner,t.id);await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,archive:true});assert.equal((await card()).required_open,0)
})
test('018 automatic task generation is explicit, configured, canonical and idempotent by source',async()=>{
 const i=await invite(owner,STANDARD_ID,student.id),opened=await openPublic(i.token);await submitPublic(i.token,{answers:{[opened.definition.sections[0].questions[0].id]:'Objetivo'},acknowledged:true});cfg=await configuration(owner)
 await settings(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,initialStageId:cfg.settings.initial_stage_id,recentDays:30,autoReview:true,autoWorkout:true,autoAssessment:true});cfg=await configuration(owner)
 const a=await synchronizeTasks(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version}),b=await synchronizeTasks(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version});assert.equal(a.created,3);assert.equal(b.created,0)
 await changeRequest(owner,i.id,'reviewed');const tasks=await listTasks(owner,query());assert.equal(tasks.total,3);assert.equal(tasks.items.find((t:{source:string})=>t.source==='auto_review').status,'pending')
})
test('018 anamnesis transitions reflect actual pending/answered/reviewed/expired/revoked without copying answers',async()=>{
 assert.equal((await card()).intake,'none');const i=await invite(owner,STANDARD_ID,student.id),opened=await openPublic(i.token);assert.equal((await card()).intake,'waiting');await submitPublic(i.token,{answers:{[opened.definition.sections[0].questions[0].id]:'HEALTH_ANSWER_MUST_NOT_LEAK'},acknowledged:true});assert.equal((await card()).intake,'received');await changeRequest(owner,i.id,'reviewed');assert.equal((await card()).intake,'reviewed')
 const second=await invite(owner,STANDARD_ID,student.id);await db().query("UPDATE intake_requests SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[second.id]);assert.equal((await card()).intake,'expired');await changeRequest(owner,second.id,'revoke');assert.equal((await card()).intake,'revoked');const data=await board(owner,query(),cfg.settings.initial_stage_id);assert.equal(JSON.stringify(data).includes('HEALTH_ANSWER_MUST_NOT_LEAK'),false)
})
test('018 workout and assessment indicators read canonical data, never clinical content',async()=>{
 const plan=await createPlan(owner,{...emptyWorkout('individual',student.id),name:'Plano canônico'},randomUUID());assert.equal((await card()).workout,'draft')
 const a=await createPhysicalAssessment(owner,student.id,{...blankAssessment(),date:today(),weight:'80',notes:'HEALTH_MEASUREMENT_MUST_NOT_LEAK'},randomUUID());assert.ok(a.id);assert.equal((await card()).assessment_recent,true)
 const f=await board(owner,query({workout:'draft',assessment:'recent'}),cfg.settings.initial_stage_id);assert.equal(f.total,1);assert.equal(JSON.stringify(f).includes('HEALTH_MEASUREMENT_MUST_NOT_LEAK'),false);assert.equal(JSON.stringify(f).includes('80.00'),false);assert.equal(plan.fields.studentId,student.id)
})
test('018 combined filters, list/column pagination and indicators agree, including empty pages and literal search',async()=>{
 const t=await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:{...tf,dueAt:'2025-01-01T00:00:00.000Z'}});assert.ok(t.id)
 const a=await board(owner,query({q:'sintético',overdue:'yes',pending:'yes',mode:'list'}),cfg.settings.initial_stage_id);assert.equal(a.total,1);assert.equal(a.open_tasks,1);assert.equal(a.overdue_tasks,1);assert.equal(a.items.length,1);assert.equal((await cards(owner,query({q:'%',view:'list'}))).total,0);assert.equal((await cards(owner,query({page:100}))).items.length,0)
 assert.equal((await listTasks(owner,query({q:'Contatar',priority:'high',overdue:'yes'}))).total,1);assert.equal((await listTasks(owner,query({q:'%'}))).total,0)
})
test('018 private endpoints require session/paid authorization/origin and reject cross-owner IDs and excessive DTOs',async()=>{
 const handler=crmHandler(provider);assert.equal((await handler(req(undefined,''))).status,401);const otherCookie='formfisik-session='+(await createSession(other)).token;assert.equal((await handler(req(undefined,otherCookie))).status,403)
 const r=await handler(req(undefined,cookie,'?view=board'));assert.equal(r.status,200);const body=await r.text();for(const secret of ['PRIVATE_ADMIN_NOT_IN_CRM','FOREIGN_NAME_MUST_NOT_LEAK','password_hash','token_digest','answers','weight'])assert.equal(body.includes(secret),false)
 await assert.rejects(previewMove(owner,foreign.id,cfg.stages[1].id));assert.equal((await handler(req({action:'move_preview',studentId:foreign.id,to:cfg.stages[1].id}))).status,404)
 assert.equal((await handler(req({action:'move_preview',studentId:student.id,to:cfg.stages[1].id,professionalId:other}))).status,400)
 const wrong=new Request(process.env.APP_URL+'/api/crm',{method:'POST',headers:{origin:'https://foreign.test',cookie,'content-type':'application/json'},body:'{}'});assert.equal((await handler(wrong)).status,403)
 const t=await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:tf});await assert.rejects(getTask(other,t.id));await assert.rejects(taskStatus(other,{operationKey:randomUUID(),id:t.id,version:1,status:'completed'}))
})
test('018 suspended accounts and archived students cannot mutate; removing/reordering a foreign stage is denied',async()=>{
 await updateStudent(owner,student.id,1,{status:'archived'});await assert.rejects(previewMove(owner,student.id,cfg.stages[1].id));await assert.rejects(saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:tf}));await assert.rejects(reorderStages(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,ids:[randomUUID()]}));await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[owner]);assert.equal((await crmHandler(provider)(req())).status,401)
})
test('018 a controlled audit failure rolls back movement, history and operation key for safe retry',async()=>{
 const to=cfg.stages[1].id,p=await previewMove(owner,student.id,to),input={operationKey:randomUUID(),boardVersion:p.boardVersion,studentId:student.id,version:p.version,to,acknowledgedRecommendations:true,confirmed:true as const};await db().query("CREATE FUNCTION fail_crm_018() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.kind='moved' THEN RAISE EXCEPTION 'controlled failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_crm_018 BEFORE INSERT ON crm_events FOR EACH ROW EXECUTE FUNCTION fail_crm_018()")
 try{await assert.rejects(move(owner,input));assert.equal((await card()).version,1);assert.equal((await db().query('SELECT 1 FROM crm_operations WHERE operation_key=$1',[input.operationKey])).rowCount,0)}finally{await db().query('DROP TRIGGER fail_crm_018 ON crm_events; DROP FUNCTION fail_crm_018()')}
 await move(owner,input);assert.equal((await card()).version,2)
})
test('018 approved erasure removes membership/tasks/history, sanitizes retries and preserves foreign portfolio',async()=>{
 const t=await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:tf});await performMove(cfg.stages[1].id);await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[owner]);const id=randomUUID();await requestErasure({id,ownerId:owner,scope:'student',subjectId:student.id,approvalReference:randomUUID()});assert.equal((await processErasure(id,null)).state,'completed')
 for(const table of ['crm_memberships','crm_tasks','crm_events'])assert.equal((await db().query(`SELECT 1 FROM ${table} WHERE professional_id=$1 AND student_link_id=$2`,[owner,student.id])).rowCount,0);assert.equal((await db().query('SELECT 1 FROM crm_tasks WHERE id=$1',[t.id])).rowCount,0);assert.ok((await db().query('SELECT 1 FROM student_links WHERE id=$1',[foreign.id])).rowCount);assert.equal((await db().query('SELECT 1 FROM crm_operations WHERE professional_id=$1 AND subject_id IS NOT NULL',[owner])).rowCount,0)
})
test('018 large synthetic portfolio uses bounded per-stage/list SQL without N+1 HTTP or sensitive payloads',async()=>{
 await db().query(`WITH r AS(INSERT INTO student_records(id,professional_id,full_name) SELECT gen_random_uuid(),$1,'Aluno volume '||n FROM generate_series(1,2500)n RETURNING id),l AS(INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) SELECT gen_random_uuid(),$1,id,gen_random_uuid(),'synthetic' FROM r RETURNING id) INSERT INTO crm_memberships(professional_id,student_link_id,stage_id) SELECT $1,id,$2 FROM l`,[owner,cfg.settings.initial_stage_id]);const start=performance.now(),b=await board(owner,query(),cfg.settings.initial_stage_id),elapsed=performance.now()-start;assert.equal(b.total,2501);assert.equal(b.items.length,10);assert.equal((await cards(owner,query({page:2}))).items.length,20)
 const explain=await db().query('EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) '+factsSql+' SELECT id FROM facts LIMIT 10',[owner]);await mkdir(artifactPath('018'),{recursive:true});await writeFile(artifactPath('018/large-portfolio.json'),JSON.stringify({syntheticOnly:true,students:b.total,boardCards:b.items.length,boardMilliseconds:elapsed,bytes:Buffer.byteLength(JSON.stringify(b)),plan:explain.rows[0]['QUERY PLAN']},null,2))
})
test('018 rate limiting and cache headers apply to real authorized CRM reads',async()=>{
 const handler=crmHandler(provider),r=await handler(req());assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('referrer-policy'),'no-referrer');await db().query('UPDATE abuse_limits SET attempts=120');assert.equal((await handler(req())).status,429)
})
test('018 occupied stage transfer is bounded to 100 and requires a fresh preview for every remaining batch',async()=>{
 const source=await newStage({name:'Origem em retirada'}),target=cfg.stages[1].id
 await db().query(`WITH r AS(INSERT INTO student_records(id,professional_id,full_name) SELECT gen_random_uuid(),$1,'Aluno lote '||n FROM generate_series(1,105)n RETURNING id),l AS(INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) SELECT gen_random_uuid(),$1,id,gen_random_uuid(),'synthetic' FROM r RETURNING id) INSERT INTO crm_memberships(professional_id,student_link_id,stage_id) SELECT $1,id,$2 FROM l`,[owner,source])
 let p=await previewArchive(owner,source,target);assert.equal(p.batchSize,100);assert.equal(p.remaining,5);let r=await archiveStage(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,stageId:source,to:target,digest:p.digest,acknowledgedRecommendations:true,confirmed:true});assert.equal(r.archived,false);assert.equal(r.moved,100);const s=(await configuration(owner)).stages.find(s=>s.id===source)!;assert.equal(s.active,false);assert.equal(s.archived,false)
 await assert.rejects(archiveStage(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,stageId:source,to:target,digest:p.digest,acknowledgedRecommendations:true,confirmed:true}));p=await previewArchive(owner,source,target);assert.equal(p.total,5);r=await archiveStage(owner,{operationKey:randomUUID(),boardVersion:p.boardVersion,stageId:source,to:target,digest:p.digest,acknowledgedRecommendations:true,confirmed:true});assert.equal(r.archived,true);assert.equal(r.moved,5);assert.equal((await db().query("SELECT count(*)::int n FROM crm_events WHERE professional_id=$1 AND kind='moved' AND from_stage_id=$2",[owner,source])).rows[0].n,105)
})
test('018 generated tasks paginate 100 students by stable cursor and replay without duplicates',async()=>{
 await db().query(`WITH r AS(INSERT INTO student_records(id,professional_id,full_name) SELECT gen_random_uuid(),$1,'Aluno sincronização '||n FROM generate_series(1,105)n RETURNING id),l AS(INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) SELECT gen_random_uuid(),$1,id,gen_random_uuid(),'synthetic' FROM r RETURNING id) INSERT INTO crm_memberships(professional_id,student_link_id,stage_id) SELECT $1,id,$2 FROM l`,[owner,cfg.settings.initial_stage_id])
 await settings(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,initialStageId:cfg.settings.initial_stage_id,recentDays:30,autoReview:false,autoWorkout:true,autoAssessment:false});cfg=await configuration(owner);const first=await synchronizeTasks(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version});assert.equal(first.created,100);assert.equal(first.scanned,100);assert.ok(first.next);const last=await synchronizeTasks(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,after:first.next!});assert.equal(last.created,6);assert.equal(last.next,null);assert.equal((await synchronizeTasks(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version})).created,0)
})
test('018 published workout and assessment recency are canonical across activation, archival and threshold',async()=>{
 const {createExercise}=await import('../src/server/exercises/repository'),{changePlanState}=await import('../src/server/workouts/repository'),{newSet}=await import('../src/modules/workouts/schema')
 const exercise=await createExercise(owner,{creationKey:randomUUID(),name:'Exercício sintético CRM',category:'forca',primaryMuscles:['peito'],secondaryMuscles:[],equipment:null,level:null,instructions:[],aliases:[]})
 const p=await createPlan(owner,{...emptyWorkout('individual',student.id),name:'Ficha canônica CRM',objective:'Objetivo de teste',divisions:[{id:randomUUID(),name:'Treino A',description:'',notes:'',groups:[],exercises:[{id:randomUUID(),exerciseId:exercise.id,exerciseVersion:1,technique:'standard',notes:'',sets:[{...newSet(),repetition:{mode:'reps',value:12,perSide:false}}]}]}]},randomUUID())
 assert.equal((await card()).prescribed,false);await changePlanState(owner,p.id,1,'active');assert.equal((await card()).workout,'active');assert.equal((await card()).prescribed,true);await changePlanState(owner,p.id,2,'archived');assert.equal((await card()).workout,'archived');assert.equal((await card()).prescribed,true)
 const date=(await db().query("SELECT ((clock_timestamp() AT TIME ZONE 'America/Sao_Paulo')::date-30)::text d")).rows[0].d;await createPhysicalAssessment(owner,student.id,{...blankAssessment(),date,weight:'80'},randomUUID());assert.equal((await card()).assessment_recent,false);await settings(owner,{operationKey:randomUUID(),boardVersion:cfg.settings.version,initialStageId:cfg.settings.initial_stage_id,recentDays:31,autoReview:false,autoWorkout:false,autoAssessment:false});assert.equal((await card()).assessment_recent,true)
})

test('CRM operation: general tasks, waiting lifecycle, due ordering and owner isolation',async()=>{
 const general=await saveTask(owner,{operationKey:randomUUID(),studentId:null,fields:{...tf,title:'Rotina geral',dueAt:'2026-01-01T12:00:00Z'}})
 const linked=await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:{...tf,title:'Rotina do aluno',dueAt:'2026-02-01T12:00:00Z'}})
 let t=await getTask(owner,general.id);assert.equal(t.student_link_id,null)
 await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'waiting'})
 t=await getTask(owner,general.id);assert.equal(t.status,'waiting')
 assert.equal((await listTasks(owner,query({taskStatus:'waiting'}))).items[0].id,general.id)
 assert.equal((await listTasks(owner,query({taskSort:'due'}))).items[0].id,general.id)
 assert.equal((await listTasks(owner,query({from:'2026-02-01',to:'2026-02-01'}))).items[0].id,linked.id)
 assert.equal((await listTasks(other,query())).total,0)
 await assert.rejects(getTask(other,general.id))
 await assert.rejects(saveTask(owner,{operationKey:randomUUID(),studentId:null,fields:{...tf,required:true}}))
 await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'completed'})
 t=await getTask(owner,general.id);assert.ok(t.completed_at)
 await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:t.version,status:'pending'})
 assert.equal((await getTask(owner,general.id)).completed_at,null)
 assert.equal((await history(owner,query({id:general.id}))).total,4)
 const bound=await getTask(owner,linked.id)
 await taskStatus(owner,{operationKey:randomUUID(),id:linked.id,version:bound.version,status:'waiting'})
 assert.equal((await card()).pending,1)
 assert.equal((await cards(owner,query({priority:'high'}))).total,1)
 assert.equal((await cards(owner,query({priority:'urgent'}))).total,0)
})
test('CRM operation: overview is scoped, bounded and omits private task descriptions',async()=>{
 const {overview}=await import('../src/server/crm/overview')
 for(let i=0;i<8;i++)await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:{...tf,title:'Prioritária '+i,dueAt:'2020-01-01T12:00:00Z'}})
 const result=await overview(owner,query());assert.equal(result.metrics.students,1);assert.equal(result.metrics.overdue,8);assert.equal(result.tasks.length,6);assert.equal(result.metrics.without_action,0)
 assert.equal(JSON.stringify(result).includes(tf.description),false)
 assert.equal((await overview(other,query())).tasks.length,0)
 assert.equal((await overview(owner,query({studentId:foreign.id}))).metrics.students,0)
 assert.equal((await overview(owner,query({studentId:foreign.id}))).tasks.length,0)
})
test('CRM operation: appointment links reject unrelated and foreign IDs',async()=>{
 await assert.rejects(saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:{...tf,appointmentId:randomUUID()}}))
 assert.equal((await listTasks(owner,query())).total,0)
 const response=await crmHandler(provider)(req({action:'task_save',operationKey:randomUUID(),studentId:null,fields:tf}))
 assert.equal(response.status,200)
 assert.equal((await crmHandler(provider)(req(undefined,cookie,'?view=overview'))).status,200)
})
test('CRM operation: canonical appointment link is audited without marking attendance, and privacy removal remains valid',async()=>{
 const {executeAgenda,agendaSettings}=await import('../src/server/agenda/repository')
 const {emptyAppointment,agendaCommand}=await import('../src/modules/agenda/schema')
 const {reserve,today:agendaToday}=await import('./helpers/agenda-fixture')
 const {overview}=await import('../src/server/crm/overview')
 const settings=await agendaSettings(owner)
 await executeAgenda(owner,agendaCommand.parse({action:'availability_save',operationKey:randomUUID(),version:settings.version,fields:{timezone:'America/Sao_Paulo',weekly:Array.from({length:7},(_,day)=>({day,windows:[{start:0,end:1440}]}))},confirmed:true}) as Parameters<typeof executeAgenda>[1])
 const type=await executeAgenda(owner,agendaCommand.parse({action:'type_save',operationKey:randomUUID(),fields:{name:'Atendimento sintético',description:'',duration:60,mode:'onsite',location:'',before:0,after:0,archived:false}}) as Parameters<typeof executeAgenda>[1]) as {id:string}
 const a=await reserve(owner,{...emptyAppointment(),studentId:student.id,typeId:type.id,date:agendaToday(),time:'10:00',notes:'CRM_PRIVATE_APPOINTMENT_NOTE'})
 const t=await saveTask(owner,{operationKey:randomUUID(),studentId:student.id,fields:{...tf,appointmentId:a.id}})
 assert.equal((await getTask(owner,t.id)).appointmentId,a.id)
 await assert.rejects(saveTask(owner,{operationKey:randomUUID(),studentId:null,fields:{...tf,appointmentId:a.id}}))
 await assert.rejects(saveTask(other,{operationKey:randomUUID(),studentId:foreign.id,fields:{...tf,appointmentId:a.id}}))
 await taskStatus(owner,{operationKey:randomUUID(),id:t.id,version:1,status:'completed'})
 assert.equal((await db().query('SELECT state FROM agenda_occurrences WHERE id=$1',[a.id])).rows[0].state,'scheduled')
 const result=await overview(owner,query());assert.equal(result.metrics.week,1);assert.equal(result.agenda.total,1)
 assert.equal(JSON.stringify(result).includes('CRM_PRIVATE_APPOINTMENT_NOTE'),false)
 assert.equal((await history(owner,query({id:t.id}))).items.find((e:{kind:string})=>e.kind==='task_created').validation.appointmentId,a.id)
 await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[owner]);const erasure=randomUUID();await requestErasure({id:erasure,ownerId:owner,scope:'student',subjectId:student.id,approvalReference:randomUUID()});assert.equal((await processErasure(erasure,null)).state,'completed');assert.equal((await db().query('SELECT id FROM crm_tasks WHERE id=$1',[t.id])).rowCount,0)
})
