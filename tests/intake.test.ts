import {before,beforeEach,after,test} from 'node:test'
import assert from 'node:assert/strict'
import {randomBytes,randomUUID} from 'node:crypto'
import Stripe from 'stripe'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {createSession} from '../src/server/sessions'
import {startCheckout,processBillingEvent} from '../src/server/subscriptions/service'
import {ControlledGateway,fixture} from './helpers/controlled-billing'
import {createStudent} from '../src/server/students/repository'
import {intakeHandler,publicIntakeHandler} from '../src/server/intake/handlers'
import * as repo from '../src/server/intake/repository'
import {formSchema,validateAnswers,type FormDefinition,type Question} from '../src/modules/intake/schema'
import {standardForm,STANDARD_ID} from '../src/modules/intake/standard'
import {requestErasure,processErasure} from '../src/server/privacy/erasure'
const connection=process.env.TEST_DATABASE_URL
if(!connection||!new URL(connection).pathname.endsWith('_test'))throw Error('Disposable _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3109',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_not_real',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_not_real'})
let owner:string,other:string,cookie:string,provider:ControlledGateway
before(async()=>{await migrate(connection);await migrate(connection)})
beforeEach(async()=>{await db().query('TRUNCATE users,billing_events,abuse_limits CASCADE');owner=randomUUID();other=randomUUID();provider=new ControlledGateway();for(const id of [owner,other])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Profissional sintético','professional',now())",[id,id+'@example.test']);cookie='formfisik-session='+(await createSession(owner)).token;await startCheckout(owner,provider);const {session}=provider.complete();await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),livemode:false,type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:session}}),provider)})
after(async()=>{await db().end()})
const question=(type:Question['type'],required=false):Question=>({id:randomUUID(),title:'Pergunta '+type,description:'',type,required,options:['single','multiple','select'].includes(type)?[{id:randomUUID(),label:'1 dia'},{id:randomUUID(),label:'2 dias'}]:[],min:null,max:null,condition:null})
const form=(qs=[question('short')]):FormDefinition=>({title:'Formulário sintético',description:'Finalidade de teste',sections:[{id:randomUUID(),title:'Seção',questions:qs}]})
const registration={fullName:'Pessoa sintética',email:'person@example.test',phone:'',birthDate:''}
const fields={...registration,adminNotes:'',creationKey:randomUUID()}
const payload=(answers={})=>({registration,answers,acknowledged:true})
const req=(body?:unknown,session=cookie)=>new Request(process.env.APP_URL+'/api/intake'+(body?'':'?view=forms'),{method:body?'POST':'GET',headers:{origin:process.env.APP_URL!,cookie:session,'content-type':'application/json'},body:body?JSON.stringify(body):undefined})
async function custom(f=form()){const m=await repo.saveForm(owner,null,f);const v=await repo.publishForm(owner,m.id,1);return {m,v,f}}
const publicReq=(token:string,operation='open',submission?:unknown)=>new Request(process.env.APP_URL+'/api/intake/public',{method:'POST',headers:{origin:process.env.APP_URL!,'content-type':'application/json'},body:JSON.stringify({token,operation,...(submission?{submission}:{})})})
test('017 schemas: every mandatory type, limits, strict keys and stable official model',()=>{
 assert.ok(formSchema.safeParse(standardForm).success)
 const types=['boolean','short','long','integer','decimal','single','multiple','select','scale','date','info'] as const
 const qs=types.map(t=>question(t)),f=form(qs),a:Record<string,string|number|string[]>={}
 for(const q of qs)a[q.id]=q.type==='boolean'?'yes':q.type==='multiple'?[q.options[0].id]:['single','select'].includes(q.type)?q.options[0].id:['integer','decimal','scale'].includes(q.type)?2:q.type==='date'?'2026-01-01':'Texto'
 assert.ok(formSchema.safeParse(f).success);const result=validateAnswers(f,a);assert.equal(Object.keys(result).length,10);assert.equal(qs[10].id in result,false)
 assert.throws(()=>validateAnswers(f,{...a,[randomUUID()]:'unexpected'}));assert.equal(formSchema.safeParse({...f,ownerId:owner}).success,false)
 const number=question('integer',true);number.min=1;number.max=7
 for(const v of [0,8,1.2,'3',NaN])assert.throws(()=>validateAnswers(form([number]),{[number.id]:v}))
 assert.throws(()=>validateAnswers(form([question('date',true)]),{}));const safe=question('integer',true);assert.throws(()=>validateAnswers(form([safe]),{[safe.id]:Number.MAX_SAFE_INTEGER+1}))
})
test('017 condition structure rejects forward/circular references, clears hidden dependent values server-side',()=>{
 const a=question('boolean',true),b=question('short',true),c=question('short',true);b.condition={questionId:a.id,equals:'yes'}
 const f=form([a,b,c]);assert.ok(formSchema.safeParse(f).success);assert.deepEqual(validateAnswers(f,{[a.id]:'no',[b.id]:'hidden health',[c.id]:'visible'}),{[a.id]:'no',[c.id]:'visible'})
 assert.throws(()=>validateAnswers(f,{[a.id]:'yes',[c.id]:'visible'}));assert.equal(formSchema.safeParse(form([b,a])).success,false)
 a.condition={questionId:b.id,equals:'yes'};assert.equal(formSchema.safeParse(f).success,false)
})
test('017 publish freezes snapshots, optimistic draft conflicts, archive preserves versions and responses',async()=>{
 const {m,v,f}=await custom();const link=await repo.invite(owner,v.id)
 await repo.saveForm(owner,m.id,{...f,title:'Alterado depois'},1);await assert.rejects(repo.saveForm(owner,m.id,f,1))
 const opened=await repo.openPublic(link.token);assert.equal(opened.definition.title,f.title)
 await assert.rejects(db().query("UPDATE intake_versions SET definition='{}' WHERE id=$1",[v.id]),/immutable/)
 await repo.archiveForm(owner,m.id);await assert.rejects(repo.invite(owner,v.id));assert.equal((await repo.openPublic(link.token)).definition.title,f.title)
})
test('017 new invitation submits once concurrently, creates canonical private student and never an access account',async()=>{
 const {v}=await custom();const i=await repo.invite(owner,v.id)
 const results=await Promise.allSettled([repo.submitPublic(i.token,payload()),repo.submitPublic(i.token,payload())]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1)
 assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,1);assert.equal((await db().query('SELECT count(*)::int AS n FROM users')).rows[0].n,2)
 const detail=await repo.getRequest(owner,i.id);assert.ok(detail.student_link_id);assert.equal(detail.registration,null);assert.equal(detail.state,'received');await assert.rejects(repo.openPublic(i.token));await repo.changeRequest(owner,i.id,'reviewing');await repo.changeRequest(owner,i.id,'reviewed');assert.equal((await repo.getRequest(owner,i.id)).state,'reviewed')
 await assert.rejects(db().query("UPDATE intake_submissions SET answers='{}' WHERE request_id=$1",[i.id]),/immutable/)
})
test('017 existing student response does not duplicate or reveal/update registration; new history uses new invitation',async()=>{
 const student=await createStudent(owner,fields),i=await repo.invite(owner,STANDARD_ID,student.id),opened=await repo.openPublic(i.token)
 assert.equal(opened.registrationRequired,false);assert.equal('student' in opened,false);assert.equal('email' in opened,false)
 const q=opened.definition.sections[0].questions[0];await assert.rejects(repo.submitPublic(i.token,payload({[q.id]:'Objetivo'})))
 await repo.submitPublic(i.token,{answers:{[q.id]:'Objetivo'},acknowledged:true});const second=await repo.invite(owner,STANDARD_ID,student.id);assert.notEqual(second.id,i.id)
 assert.equal((await repo.listRequests(owner,1,student.id)).total,2);assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,1)
})
test('017 ambiguous email/name stays pending; explicit independently verified resolution never changes identity',async()=>{
 const student=await createStudent(owner,fields),{v}=await custom(),i=await repo.invite(owner,v.id);await repo.submitPublic(i.token,payload())
 assert.equal((await repo.getRequest(owner,i.id)).state,'pending');assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,1)
 await assert.rejects(repo.changeRequest(owner,i.id,'resolve',{studentId:student.id}));const foreign=await createStudent(other,{...fields,creationKey:randomUUID()})
 await assert.rejects(repo.changeRequest(owner,i.id,'resolve',{studentId:foreign.id,confirmed:true}));await repo.changeRequest(owner,i.id,'resolve',{studentId:student.id,confirmed:true});assert.equal((await repo.getRequest(owner,i.id)).student_link_id,student.id)
})
test('017 capabilities expire/revoke/suspend; malformed, random, used links disclose same public error',async()=>{
 const {v}=await custom(),a=await repo.invite(owner,v.id),b=await repo.invite(owner,v.id)
 await repo.changeRequest(owner,a.id,'revoke');await db().query("UPDATE intake_requests SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[b.id])
 for(const token of [a.token,b.token,randomBytes(32).toString('base64url')]){const r=await publicIntakeHandler(publicReq(token));assert.equal(r.status,410);assert.equal((await r.json()).message,'Link indisponível. Solicite um novo link ao profissional.')}
 const c=await repo.invite(owner,v.id);await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[owner]);assert.equal((await publicIntakeHandler(publicReq(c.token))).status,410)
})
test('017 professional endpoints enforce auth, entitlement, origin, strict schemas and cross-owner isolation',async()=>{
 const handler=intakeHandler(provider),{m,v}=await custom()
 assert.equal((await handler(req(undefined,''))).status,401)
 const foreign=await createSession(other);assert.equal((await handler(req(undefined,'formfisik-session='+foreign.token))).status,403)
 assert.equal((await handler(req({action:'invite',versionId:v.id,ownerId:other}))).status,400)
 await assert.rejects(repo.getForm(other,m.id));await assert.rejects(repo.publishForm(other,m.id,1));await assert.rejects(repo.invite(other,v.id))
 const i=await repo.invite(owner,v.id);await assert.rejects(repo.getRequest(other,i.id));await assert.rejects(repo.changeRequest(other,i.id,'revoke'))
 const wrong=new Request(process.env.APP_URL+'/api/intake',{method:'POST',headers:{origin:'https://other.test',cookie,'content-type':'application/json'},body:'{}'});assert.equal((await handler(wrong)).status,403)
})
test('017 invalid answers and injected keys roll back token usage; DB failure rolls back student and submission',async()=>{
 const required=question('integer',true),{v}=await custom(form([required])),i=await repo.invite(owner,v.id)
 await assert.rejects(repo.submitPublic(i.token,payload({[required.id]:'not numeric'})))
 assert.ok(await repo.openPublic(i.token))
 await db().query("CREATE FUNCTION fail_intake_017() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled failure'; END $$; CREATE TRIGGER fail_intake_017 BEFORE INSERT ON intake_submissions FOR EACH ROW EXECUTE FUNCTION fail_intake_017()")
 try{await assert.rejects(repo.submitPublic(i.token,payload({[required.id]:2})));assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,0)}finally{await db().query('DROP TRIGGER fail_intake_017 ON intake_submissions; DROP FUNCTION fail_intake_017()')}
 await repo.submitPublic(i.token,payload({[required.id]:2}));assert.equal((await repo.getRequest(owner,i.id)).answers![required.id],2)
})
test('017 public limits, minimal DTO/cache and digest-only capability persistence',async()=>{
 const {v}=await custom(),i=await repo.invite(owner,v.id);let response=await publicIntakeHandler(publicReq(i.token));assert.equal(response.status,200);assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.match(response.headers.get('cache-control')!,/no-store/)
 const data=await response.json();assert.deepEqual(Object.keys(data).sort(),['definition','number','professional','registrationRequired']);const row=(await db().query('SELECT * FROM intake_requests WHERE id=$1',[i.id])).rows[0];assert.equal(JSON.stringify(row).includes(i.token),false);assert.equal(row.token_digest.length,64)
 for(let n=0;n<30;n++)response=await publicIntakeHandler(publicReq(i.token));assert.equal(response.status,429)
})
test('017 list pagination and filters return no answers or personal data',async()=>{
 const {v}=await custom();for(let n=0;n<23;n++)await repo.invite(owner,v.id)
 const list=await repo.listRequests(owner,2);assert.equal(list.items.length,3);assert.equal(list.total,23);assert.equal('token_digest' in list.items[0],false);assert.equal('answers' in list.items[0],false);assert.equal((await repo.listRequests(other,1)).total,0);assert.equal((await repo.listRequests(owner,3)).items.length,0)
})
test('017 approved student erasure cascades anamnesis but preserves other portfolio',async()=>{
 const {v}=await custom(),i=await repo.invite(owner,v.id);await repo.submitPublic(i.token,payload());const sid=(await repo.getRequest(owner,i.id)).student_link_id!
 const foreign=await createStudent(other,{...fields,creationKey:randomUUID()});await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[owner]);const id=randomUUID();await requestErasure({id,ownerId:owner,scope:'student',subjectId:sid,approvalReference:randomUUID()});await processErasure(id,null)
 assert.equal((await db().query('SELECT 1 FROM intake_requests WHERE id=$1',[i.id])).rowCount,0);assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[foreign.id])).rowCount,1)
})

test('017 ambiguous submissions allow explicit separate registration without merging other data',async()=>{
 const student=await createStudent(owner,fields),{v}=await custom(),i=await repo.invite(owner,v.id);await repo.submitPublic(i.token,payload());await repo.changeRequest(owner,i.id,'resolve',{confirmed:true,createSeparate:true});const resolved=await repo.getRequest(owner,i.id);assert.notEqual(resolved.student_link_id,student.id);assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records WHERE professional_id=$1',[owner])).rows[0].n,2)
})
test('017 unbound sensitive submission blocks whole professional erasure, never silently deletes another subject',async()=>{
 const student=await createStudent(other,{...fields,creationKey:randomUUID()}),m=await repo.saveForm(other,null,form()),v=await repo.publishForm(other,m.id,1),i=await repo.invite(other,v.id);await repo.submitPublic(i.token,payload());assert.equal((await repo.getRequest(other,i.id)).state,'pending')
 // Remove only this synthetic registration to isolate the unbound-submission blocker.
 await db().query('DELETE FROM student_administrative_events WHERE professional_id=$1',[other]);const r=await db().query('DELETE FROM student_links WHERE id=$1 RETURNING student_id',[student.id]);await db().query('DELETE FROM student_records WHERE id=$1',[r.rows[0].student_id]);await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[other]);const id=randomUUID();await requestErasure({id,ownerId:other,scope:'professional',subjectId:other,approvalReference:randomUUID()});const result=await processErasure(id,null);assert.equal(result.state,'blocked');assert.equal('blocker' in result&&result.blocker,'related_history');assert.equal((await db().query('SELECT 1 FROM intake_submissions WHERE request_id=$1',[i.id])).rowCount,1)
})
test('017 expiry while awaiting a row lock rolls back submission and student creation',async()=>{
 const {v}=await custom(),i=await repo.invite(owner,v.id),lock=await db().connect();await lock.query('BEGIN');await lock.query('SELECT 1 FROM intake_requests WHERE id=$1 FOR UPDATE',[i.id]);const submitting=repo.submitPublic(i.token,payload());const rejection=assert.rejects(submitting);await new Promise(r=>setTimeout(r,50));await lock.query("UPDATE intake_requests SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[i.id]);await lock.query('COMMIT');lock.release();await rejection;assert.equal((await db().query('SELECT 1 FROM intake_submissions WHERE request_id=$1',[i.id])).rowCount,0);assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,0)
})
test('017 detail history is paginated, summary excludes answers and published definition is owner-scoped',async()=>{
 const student=await createStudent(owner,fields),{v}=await custom(),i=await repo.invite(owner,v.id,student.id);await repo.submitPublic(i.token,{answers:{},acknowledged:true});for(let n=0;n<23;n++)await repo.getRequest(owner,i.id)
 const history=await repo.getRequest(owner,i.id,2);assert.ok(history.historyTotal>20);assert.ok(history.events.length>0&&history.events.length<=20);const summary=await repo.studentIntakeSummary(owner,student.id);assert.equal(summary.total,1);assert.equal(summary.answered.number,1);assert.equal('answers' in summary,false);await assert.rejects(repo.studentIntakeSummary(other,student.id));await assert.rejects(repo.getVersion(other,v.id));assert.equal((await repo.getVersion(owner,v.id)).number,1)
})

test('request dashboard summary and literal search are owner scoped and exclude expired waiting links',async()=>{
 const student=await createStudent(owner,{...fields,creationKey:randomUUID()});await repo.invite(owner,STANDARD_ID,student.id);const expired=await repo.invite(owner,STANDARD_ID);await repo.invite(other,STANDARD_ID)
 await db().query('UPDATE intake_requests SET expires_at=now()-interval \'1 day\' WHERE id=$1',[expired.id])
 const all=await repo.listRequests(owner,1);assert.equal(all.total,2);assert.deepEqual(all.summary,{total:2,waiting:1,pending:0,reviewed:0});assert.equal(all.items.find((r:{student_link_id:string})=>r.student_link_id===student.id).student_name,fields.fullName)
 const search=await repo.listRequests(owner,1,undefined,undefined,'Pessoa sintética');assert.equal(search.total,1);assert.equal(search.summary.total,2);assert.equal((await repo.listRequests(owner,1,undefined,undefined,'%')).total,0);assert.equal((await repo.listRequests(owner,99)).total,2);assert.equal((await repo.listRequests(owner,99)).items.length,0)
 assert.ok(!JSON.stringify(all).includes(fields.email));assert.ok(!JSON.stringify(all).includes('token'))
})
