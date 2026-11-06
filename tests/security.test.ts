import {before,after,test} from 'node:test'
import assert from 'node:assert/strict'
import {randomBytes,randomUUID} from 'node:crypto'
import {setTimeout as delay} from 'node:timers/promises'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {verifyEmail,digest} from '../src/server/registration'
import {setAccountDisabled} from '../src/server/account-security'
import {createSession,readSession,sessionContext} from '../src/server/sessions'
import {login,getSession} from '../src/server/auth'
import {hash,argon2id} from 'argon2'
import {validateReset,resetDigest} from '../src/server/password-recovery'
import {browserPolicy} from '../src/server/browser-policy'
import {loginSchema} from '../src/modules/auth/schema'
import {registrationSchema} from '../src/modules/registration/schema'
import {recoverySchema,resetTokenSchema} from '../src/modules/auth/recovery-schema'
import {configureReportTests,reportFixture} from './helpers/physical-report-fixture'
import {subscriptionStatus} from '../src/server/subscriptions/status'
import {professionalAccess,createDashboardHandler} from '../src/server/professional-dashboard'
import {createStudentHandler} from '../src/server/students/handlers'
import {createAssessmentHandler} from '../src/server/assessments/handlers'
import {createPhotoHandler} from '../src/server/progress-photos/handlers'
import {reportHandler} from '../src/server/physical-reports/handlers'
import {documentHandler} from '../src/server/workout-documents/handlers'
import {createWorkoutHandler} from '../src/server/workouts/handlers'
import {createExerciseHandler} from '../src/server/exercises/handlers'
import {generateReport} from '../src/server/physical-reports/repository'
import {defaultReportOptions} from '../src/modules/physical-reports/schema'
import {jsonBody,BadRequest,reply} from '../src/server/http'

const connection=process.env.TEST_DATABASE_URL
if(!connection||!new URL(connection).pathname.endsWith('_test'))throw Error('Disposable _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')})
before(async()=>{await migrate(connection)})
after(async()=>{await db().end()})
test('015: verification must reject a token that expires while waiting for its email lock',async()=>{
 await db().query('TRUNCATE users,pending_registrations,abuse_limits CASCADE')
 const token=randomBytes(32).toString('base64url'),email='expiry-lock@example.test'
 await db().query("INSERT INTO pending_registrations(token_hash,email,full_name,password_hash,expires_at) VALUES($1,$2,'Synthetic expiry test','$argon2id$synthetic',clock_timestamp()+interval '1500 milliseconds')",[digest(token),email])
 const lock=await db().connect()
 let response:Promise<Response>|undefined
 try{
  await lock.query('BEGIN')
  await lock.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[email])
  response=verifyEmail(new Request('http://localhost:3107/api/accounts/verify',{method:'POST',headers:{origin:'http://localhost:3107','content-type':'application/json'},body:JSON.stringify({token})}))
  let waiting=false
  for(let i=0;i<100;i++){
   const r=await lock.query("SELECT count(*)::int AS n FROM pg_locks WHERE locktype='advisory' AND NOT granted")
   if(r.rows[0].n){waiting=true;break}await delay(20)
  }
  assert.ok(waiting,'verification reached the lock before expiry')
  await lock.query("SELECT pg_sleep(GREATEST(0,extract(epoch FROM (expires_at-clock_timestamp())))+0.1) FROM pending_registrations WHERE token_hash=$1",[digest(token)])
  await lock.query('COMMIT')
  assert.equal((await response).status,400)
  assert.equal((await db().query('SELECT count(*)::int AS n FROM users')).rows[0].n,0)
 }finally{await lock.query('ROLLBACK');lock.release();await response?.catch(()=>{})}
})
function request(path:string,body?:unknown,cookie?:string){return new Request(process.env.APP_URL+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{origin:process.env.APP_URL!,'content-type':'application/json'}),...(cookie?{cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)})}
test('015: disabled accounts revoke all sessions/reset links and cannot log in or reuse sessions after reactivation',async()=>{
 await db().query('TRUNCATE users,pending_registrations,abuse_limits CASCADE')
 const id=randomUUID(),email='disabled@example.test',password='Synthetic secure phrase 015!'
 await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,'Synthetic disabled account',now())",[id,email])
 await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[id,await hash(password,{type:argon2id,memoryCost:19456,timeCost:2,parallelism:1})])
 const a=await createSession(id),b=await createSession(id),reset=randomBytes(32).toString('base64url')
 await db().query('INSERT INTO password_resets(token_hash,user_id) VALUES($1,$2)',[resetDigest(reset),id])
 await setAccountDisabled(id,true,'security_incident')
 assert.equal(await readSession(a.token),null);assert.equal(await readSession(b.token,true),null)
 assert.equal((await validateReset(request('/api/auth/reset-password/validate',{token:reset}))).status,400)
 assert.equal((await login(request('/api/auth/login',{email,password}))).status,401)
 await assert.rejects(createSession(id))
 await setAccountDisabled(id,false,'administrative_review')
 assert.equal(await readSession(a.token),null)
 assert.equal((await login(request('/api/auth/login',{email,password}))).status,200)
 const events=await db().query('SELECT kind,reason FROM account_security_events WHERE user_id=$1 ORDER BY id',[id]);assert.deepEqual(events.rows,[{kind:'disabled',reason:'security_incident'},{kind:'enabled',reason:'administrative_review'}])
})
test('015: public authentication contracts reject protected/unknown fields',()=>{
 assert.equal(loginSchema.safeParse({email:'test@example.test',password:'valid',role:'admin'}).success,false)
 assert.equal(recoverySchema.safeParse({email:'test@example.test',userId:randomUUID()}).success,false)
 assert.equal(resetTokenSchema.safeParse({token:randomBytes(32).toString('base64url'),expiresAt:'2099-01-01'}).success,false)
 assert.equal(registrationSchema.safeParse({fullName:'Synthetic Person',email:'test@example.test',password:'Synthetic phrase 015!',confirmPassword:'Synthetic phrase 015!',role:'admin'}).success,false)
})
test('015: CSP has fresh cryptographic nonces and denies injected scripts/frames/objects; eval is development-only',()=>{
 const a=browserPolicy(randomBytes(32).toString('base64')),b=browserPolicy(randomBytes(32).toString('base64'))
 assert.notEqual(a,b);assert.ok(a.includes("'strict-dynamic'"));assert.ok(!a.includes("'unsafe-eval'"));assert.ok(!a.match(/script-src[^;]*unsafe-inline/));assert.ok(a.includes("frame-ancestors 'none'"));assert.ok(a.includes("object-src 'none'"));assert.throws(()=>browserPolicy('attacker nonce'))
})
test('015: passive session response discloses no identity or financial data and makes no provider lookup',async()=>{
 configureReportTests();const f=await reportFixture()
 const r=await getSession(request('/api/auth/session',undefined,f.cookie));assert.equal(r.status,200);assert.deepEqual(await r.json(),{authenticated:true,context:sessionContext(f.owner)});assert.ok(r.headers.get('cache-control')?.includes('no-store'));assert.equal(r.headers.get('access-control-allow-origin'),null)
 assert.notEqual(sessionContext(f.owner),sessionContext(f.other))
 assert.equal(await readSession(sessionContext(f.owner)),null,'display context is never an authentication token')
})
test('015: authorization omits Portal lookups while billing management preserves them; lightweight monitor omits dashboard counts',async()=>{
 configureReportTests();const f=await reportFixture();process.env.STRIPE_PORTAL_CONFIGURATION_ID='bpc_fixture'
 let calls=0;const original=f.provider.portalConfiguration.bind(f.provider);f.provider.portalConfiguration=async()=>{calls++;return original()}
 const user=(await readSession(f.cookie.split('=')[1]))!
 assert.equal((await professionalAccess(user,f.provider)).status,'allowed');assert.equal(calls,0)
 const status=await subscriptionStatus(f.owner,false,f.provider);assert.ok(status.actions.portal);assert.equal(calls,1)
 const monitor=await createDashboardHandler(f.provider)(request('/api/professional/dashboard?view=access',undefined,f.cookie));assert.deepEqual(await monitor.json(),{status:'allowed'});assert.equal(calls,1)
})
test('015: real PostgreSQL isolates two professionals across student, assessment, photos, calendar, report and document handlers',async()=>{
 configureReportTests();const f=await reportFixture(),other=f.otherProvider,cookie=f.otherCookie
 const doc=await generateReport(f.owner,f.student.id,defaultReportOptions(),null)
 const cases:[string,(r:Request,id:string)=>Promise<Response>,string|undefined][]=[
  ['/api/students/'+f.student.id,createStudentHandler('get',other),f.student.id],
  ['/api/students/'+f.student.id+'/pdf',createStudentHandler('pdf',other),f.student.id],
  ['/api/assessments/'+f.first.id,createAssessmentHandler('get',other),f.first.id],
  ['/api/assessments/'+f.first.id+'/history',createAssessmentHandler('history',other),f.first.id],
  ['/api/assessments?studentId='+f.student.id,createAssessmentHandler('list',other),undefined],
  ['/api/photo-records/'+f.photo1.id,createPhotoHandler('get',other,f.store),f.photo1.id],
  ['/api/photo-records/'+f.photo1.id+'/history',createPhotoHandler('history',other,f.store),f.photo1.id],
  ['/api/photo-images/'+f.photo1.images[0].id,createPhotoHandler('read',other,f.store),f.photo1.images[0].id],
  ['/api/photo-records?studentId='+f.student.id,createPhotoHandler('list',other,f.store),undefined],
  ['/api/progress/calendar?studentId='+f.student.id+'&year=2025',createPhotoHandler('calendar',other,f.store),undefined],
  ['/api/photos/choices?studentId='+f.student.id+'&date=2025-01-01&position=front',createPhotoHandler('choices',other,f.store),undefined],
  ['/api/students/'+f.student.id+'/physical-reports',reportHandler('candidates',other,null),f.student.id],
  ['/api/students/'+f.student.id+'/physical-reports/photos',reportHandler('photos',other,null),f.student.id],
  ['/api/physical-reports/'+doc.id,reportHandler('read',other,null),doc.id],
  ['/api/workout-documents/'+doc.id,documentHandler('read',other),doc.id],
  ['/api/workouts/'+randomUUID(),createWorkoutHandler('get',other),randomUUID()],
  ['/api/exercises/'+randomUUID(),createExerciseHandler('get',other),randomUUID()],
 ]
 for(const [path,handler,id]of cases){assert.equal((await handler(request(path),id??'')).status,401,path+' anonymous');const r=await handler(request(path,undefined,cookie),id??'');assert.equal(r.status,404,path+' foreign');const text=await r.text();assert.ok(!text.includes(f.student.fullName)&&!text.includes('Observação profissional'));assert.ok(r.headers.get('cache-control')?.includes('no-store'))}
 const role=randomUUID();await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic student role','student',now())",[role,role+'@example.test']);const token=(await createSession(role)).token
 assert.equal((await createStudentHandler('list',f.provider)(request('/api/students',undefined,'formfisik-session='+token))).status,403)
 assert.equal((await createExerciseHandler('queue',other)(request('/api/exercises/moderation',undefined,cookie))).status,403)
})
test('015: list DTOs omit notes, credentials, contacts and full exercise instructions; detail remains explicitly authorized',async()=>{
 configureReportTests();const f=await reportFixture()
 const assessments=await (await createAssessmentHandler('list',f.provider)(request('/api/assessments?studentId='+f.student.id,undefined,f.cookie))).json()
 assert.ok(assessments.items.length);for(const a of [...assessments.items,assessments.latest,assessments.first].filter(Boolean)){assert.ok(!('notes' in a));assert.ok(!('authorId' in a));assert.ok(!('chest' in a))}
 const identity=await (await createStudentHandler('get',f.provider)(request('/api/students/'+f.student.id+'?view=identity',undefined,f.cookie),f.student.id)).json();assert.deepEqual(Object.keys(identity.student).sort(),['fullName','id','status'])
 const photos=await (await createPhotoHandler('list',f.provider,f.store)(request('/api/photo-records?studentId='+f.student.id,undefined,f.cookie))).json();assert.ok(photos.items.length);for(const p of photos.items)assert.deepEqual(Object.keys(p).sort(),['date','id','imageCount','pendingCount','state','version'])
 const detail=await (await createAssessmentHandler('get',f.provider)(request('/api/assessments/'+f.first.id,undefined,f.cookie),f.first.id)).json();assert.equal(detail.assessment.notes,f.first.notes)
})
test('015: incomplete streamed JSON has a total read deadline and releases its stream',async()=>{
 let canceled=false
 const stream=new ReadableStream<Uint8Array>({start(c){c.enqueue(Buffer.from('{'))},cancel(){canceled=true}})
 const r=new Request('http://localhost:3107/api/test',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'} as RequestInit)
 await assert.rejects(jsonBody(r,8192,20),BadRequest);assert.ok(canceled)
})
test('015: rejected-request logs contain only a server-generated correlation ID and status',()=>{
 const output:string[]=[],original=console.info;console.info=(value)=>output.push(String(value))
 try{const r=reply({message:'Synthetic rejection'},403);const event=JSON.parse(output[0]);assert.deepEqual(Object.keys(event).sort(),['event','requestId','status']);assert.equal(event.event,'security_request_rejected');assert.equal(event.requestId,r.headers.get('x-request-id'));assert.equal(event.status,403)}finally{console.info=original}
})
