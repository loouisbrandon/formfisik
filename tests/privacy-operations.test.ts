import assert from 'node:assert/strict'
import {before,after,test} from 'node:test'
import {randomUUID} from 'node:crypto'
import {hash,argon2id} from 'argon2'
import {configureReportTests,reportFixture} from './helpers/physical-report-fixture'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {setAccountDisabled} from '../src/server/account-security'
import {requestErasure,processErasure,processErasureQueue,erasureInput} from '../src/server/privacy/erasure'
import {exportErasureLedger,replayErasureLedger,erasureStatus} from '../src/server/privacy/ledger'
import {createPlan,applyTemplate,changePlanState} from '../src/server/workouts/repository'
import {emptyWorkout,newSet} from '../src/modules/workouts/schema'
import {createExercise} from '../src/server/exercises/repository'
import {readPhoto} from '../src/server/progress-photos/repository'
import {GET as health} from '../src/app/api/health/route'
import {operationalStatus} from '../src/server/operations'

const connection=configureReportTests()
before(async()=>{await migrate(connection)})
after(async()=>{await db().end()})
async function fixture(){await db().query('TRUNCATE privacy_erasure_jobs CASCADE');return reportFixture()}
async function request(owner:string,subject:string,scope:'student'|'professional'='student'){return requestErasure({id:randomUUID(),ownerId:owner,subjectId:subject,scope,approvalReference:randomUUID()})}
async function due(id:string){await db().query("UPDATE privacy_erasure_jobs SET not_before=clock_timestamp()-interval '1 minute' WHERE id=$1",[id]);await db().query('UPDATE privacy_erasure_objects SET cleanup_due_at=clock_timestamp() WHERE job_id=$1',[id])}

test('016: erasure rejects active account, absent approval, mixed owners and mass assignment',async()=>{
 const f=await fixture();await assert.rejects(request(f.owner,f.student.id),/ACCOUNT_MUST_BE_SUSPENDED/)
 await setAccountDisabled(f.owner,true,'owner_request');await assert.rejects(request(f.owner,f.foreign.id),/SUBJECT_NOT_FOUND/)
 assert.equal(erasureInput.safeParse({id:randomUUID(),ownerId:f.owner,scope:'professional',subjectId:f.owner,approvalReference:'',role:'admin'}).success,false)
 await assert.rejects(request(f.owner,f.other,'professional'),/INVALID_SCOPE/)
 assert.equal((await db().query('SELECT count(*) FROM privacy_erasure_jobs')).rows[0].count,'0')
})
test('016: financial retention blocks whole-account erasure without deleting data or reactivating sessions',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const id=await request(f.owner,f.owner,'professional')
 assert.equal((await processErasure(id,f.store)).state,'blocked');const j=await db().query('SELECT blocker FROM privacy_erasure_jobs WHERE id=$1',[id]);assert.equal(j.rows[0].blocker,'financial_retention')
 assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[f.student.id])).rowCount,1);assert.equal(f.store.deletes,0)
 await assert.rejects(setAccountDisabled(f.owner,false,'administrative_review'),/ERASURE_IN_PROGRESS/)
})
test('016: student erasure survives absent storage, failed DELETE and interruption; opaque tombstones repeat late DELETE',async()=>{
 const f=await fixture(),foreignBefore=(await db().query('SELECT row_to_json(s) AS value FROM student_records s WHERE professional_id=$1',[f.other])).rows
 const plan=await createPlan(f.owner,{...emptyWorkout('individual',f.student.id),name:'Treino privado sintético'},randomUUID())
 await setAccountDisabled(f.owner,true,'owner_request');const input={id:randomUUID(),ownerId:f.owner,scope:'student' as const,subjectId:f.student.id,approvalReference:randomUUID()}
 const id=await requestErasure(input);assert.equal(await requestErasure({...input,id:randomUUID()}),id);assert.equal(await requestErasure({...input,ownerId:input.ownerId.toUpperCase(),subjectId:input.subjectId.toUpperCase(),approvalReference:input.approvalReference.toUpperCase()}),id);await assert.rejects(requestErasure({...input,approvalReference:randomUUID()}),/ERASURE_CONFLICT/)
 assert.equal((await processErasure(id,null)).state,'blocked');assert.equal(f.store.objects.size,2)
 const image=(await db().query('SELECT id FROM progress_photo_images WHERE professional_id=$1 LIMIT 1',[f.owner])).rows[0].id
 await assert.rejects(readPhoto(f.owner,image,f.store))
 await due(id);f.store.failRemove=true;assert.ok((await processErasure(id,f.store)).failed>0);assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[f.student.id])).rowCount,1)
 f.store.failRemove=false;await due(id)
 // Process died while owning lease. Concurrent worker cannot steal it before expiry.
 await db().query("UPDATE privacy_erasure_jobs SET lease_id=$2,lease_until=clock_timestamp()+interval '1 minute' WHERE id=$1",[id,randomUUID()]);assert.equal((await processErasure(id,f.store)).state,'busy_or_missing')
 await db().query("UPDATE privacy_erasure_jobs SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[id])
 const keys=[...f.store.objects.keys()];assert.equal((await processErasure(id,f.store)).state,'completed')
 for(const table of ['student_links','physical_assessments','photo_records','progress_photo_images'])assert.equal((await db().query(`SELECT 1 FROM ${table} WHERE ${table==='student_links'?'id':'student_link_id'}=$1`,[f.student.id])).rowCount,0)
 assert.equal((await db().query('SELECT 1 FROM workout_versions WHERE plan_id=$1',[plan.id])).rowCount,0)
 assert.deepEqual((await db().query('SELECT row_to_json(s) AS value FROM student_records s WHERE professional_id=$1',[f.other])).rows,foreignBefore)
 assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[f.empty.id])).rowCount,1)
 await f.store.put(keys[0],Buffer.from('late uncertain synthetic PUT'));await due(id);assert.equal((await processErasure(id,f.store)).state,'completed');assert.equal(f.store.objects.size,0)
 assert.equal(await requestErasure(input),id)
})
test('016: confirmed first DELETE does not skip technical quiescence window',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const id=await request(f.owner,f.student.id)
 assert.equal((await processErasure(id,f.store)).state,'waiting');assert.equal(f.store.objects.size,0)
 assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[f.student.id])).rowCount,1)
 await due(id);assert.equal((await processErasure(id,f.store)).state,'completed')
})
test('016: whole-account erasure removes credentials and private data only without finance/shared retention blockers',async()=>{
 await db().query('TRUNCATE privacy_erasure_jobs CASCADE');await db().query('TRUNCATE users CASCADE');const owner=randomUUID()
 await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,'erasable@example.test','Conta sintética',now())",[owner])
 await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[owner,await hash('Synthetic deletion phrase 016!',{type:argon2id,memoryCost:19456,timeCost:2,parallelism:1})])
 await createExercise(owner,{creationKey:randomUUID(),name:'Privado sintético',category:'forca',primaryMuscles:['peito'],secondaryMuscles:[],equipment:null,level:null,instructions:[],aliases:[]})
 await setAccountDisabled(owner,true,'owner_request');const id=await request(owner,owner,'professional');assert.equal((await processErasure(id,null)).state,'completed')
 for(const [table,col] of [['users','id'],['credentials','user_id'],['exercise_entries','owner_id'],['account_security_events','user_id']])assert.equal((await db().query(`SELECT 1 FROM ${table} WHERE ${col}=$1`,[owner])).rowCount,0)
 const ledger=await exportErasureLedger();assert.ok(!ledger.includes('erasable@example.test'));assert.ok(!ledger.includes('password_hash'))
})
test('016: signed restore ledger rejects tampering and replays completed erasure without exposing identity',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const id=await request(f.owner,f.empty.id);assert.equal((await processErasure(id,null)).state,'completed')
 const raw=await exportErasureLedger(),envelope=JSON.parse(raw);envelope.payload=envelope.payload.replace(f.owner,f.other)
 await assert.rejects(replayErasureLedger(JSON.stringify(envelope)),/LEDGER_AUTHENTICATION_FAILED/)
 assert.ok(!raw.includes('private-email'));assert.ok(!raw.includes('Ana Evolução'))
 await db().query("UPDATE privacy_erasure_jobs SET lease_id=$2,lease_until=clock_timestamp()+interval '1 minute' WHERE id=$1",[id,randomUUID()]);await assert.rejects(replayErasureLedger(raw),/LEDGER_CONFLICT/);await db().query("UPDATE privacy_erasure_jobs SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",[id]);await replayErasureLedger(raw);assert.equal((await processErasure(id,null)).state,'completed');assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[f.foreign.id])).rowCount,1)
 assert.equal((await erasureStatus()).pageSize,20);await assert.rejects(erasureStatus(0))
})
test('016: readiness rejects incomplete/checksum-diverged schema; operator status contains counts, not secrets',async()=>{
 assert.equal((await health()).status,200);const rows=await db().query("DELETE FROM schema_migrations WHERE name LIKE '016_%' RETURNING *")
 assert.equal((await health()).status,503)
 const r=rows.rows[0];await db().query('INSERT INTO schema_migrations(name,checksum,applied_at) VALUES($1,$2,$3)',[r.name,r.checksum,r.applied_at]);assert.equal((await health()).status,200)
 const result=await operationalStatus(),text=JSON.stringify(result);assert.equal(result.schema,'ready');assert.equal(result.externalHomologation,false);assert.ok(!text.includes(process.env.ABUSE_HMAC_SECRET!));assert.ok(!text.includes(connection))
})

test('016: batch history survives another student erasure without permitting duplicate retry',async()=>{
 const f=await fixture();const e=await createExercise(f.owner,{creationKey:randomUUID(),name:'Referência sintética 016',category:'forca',primaryMuscles:['peito'],secondaryMuscles:[],equipment:null,level:null,instructions:[],aliases:[]})
 let t=await createPlan(f.owner,{...emptyWorkout('template'),name:'Modelo sintético',objective:'Objetivo sintético de prescrição',divisions:[{id:randomUUID(),name:'Treino A',description:'',notes:'',groups:[],exercises:[{id:randomUUID(),exerciseId:e.id,exerciseVersion:1,technique:'standard',notes:'',sets:[{...newSet(),repetition:{mode:'reps',value:12,perSide:false},restSeconds:60}]}]}]},randomUUID())
 t=await changePlanState(f.owner,t.id,t.version,'active');const key=randomUUID(),applied=await applyTemplate(f.owner,t.id,t.version,key,[f.student.id,f.empty.id]),other=applied.plans.find(x=>x.studentId===f.empty.id)!
 const before=(await db().query('SELECT document,identity_snapshot FROM workout_versions WHERE plan_id=$1',[other.id])).rows
 await setAccountDisabled(f.owner,true,'owner_request');const id=await request(f.owner,f.student.id);await processErasure(id,f.store);await due(id);assert.equal((await processErasure(id,f.store)).state,'completed')
 assert.deepEqual((await db().query('SELECT document,identity_snapshot FROM workout_versions WHERE plan_id=$1',[other.id])).rows,before)
 await assert.rejects(applyTemplate(f.owner,t.id,t.version,key,[f.student.id,f.empty.id]),/resultado desta operação foi removido/)
})
test('016: controlled final SQL failure rolls back hard deletion and supports retry',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const id=await request(f.owner,f.student.id);await processErasure(id,f.store);await due(id)
 await db().query("CREATE FUNCTION fail_erasure_016() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled erasure failure'; END $$; CREATE TRIGGER fail_erasure_016 BEFORE DELETE ON student_links FOR EACH ROW EXECUTE FUNCTION fail_erasure_016()")
 try{await assert.rejects(processErasure(id,f.store));assert.equal((await db().query('SELECT count(*) FROM physical_assessments WHERE student_link_id=$1',[f.student.id])).rows[0].count,'3');assert.notEqual((await db().query('SELECT state FROM privacy_erasure_jobs WHERE id=$1',[id])).rows[0].state,'completed')}
 finally{await db().query('DROP TRIGGER fail_erasure_016 ON student_links; DROP FUNCTION fail_erasure_016()')}
 assert.equal((await processErasure(id,f.store)).state,'completed')
})

test('016: shared catalog contribution blocks account erasure without destroying other consumers',async()=>{
 await db().query('TRUNCATE privacy_erasure_jobs CASCADE');await db().query('TRUNCATE users CASCADE');const owner=randomUUID(),exercise=randomUUID()
 await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,'contributor@example.test','Contribuidor sintético',now())",[owner])
 await db().query("INSERT INTO exercise_entries(id,scope,state,name,name_key,search_text,category,primary_muscles) VALUES($1,'official','published','Oficial sintético','oficial','oficial','forca',ARRAY['peito'])",[exercise])
 await db().query("INSERT INTO exercise_versions(exercise_id,version,definition,actor_id) VALUES($1,1,'{}',$2)",[exercise,owner])
 await setAccountDisabled(owner,true,'owner_request');const id=await request(owner,owner,'professional'),result=await processErasure(id,null);assert.equal(result.state,'blocked');assert.equal('blocker' in result?result.blocker:null,'shared_contribution')
 assert.equal((await db().query('SELECT 1 FROM exercise_entries WHERE id=$1',[exercise])).rowCount,1)
})

test('016: bounded scheduler distinguishes completed, waiting and legally blocked jobs',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const held=await request(f.owner,f.owner,'professional');await processErasure(held,f.store)
 await request(f.owner,f.empty.id);await request(f.owner,f.student.id)
 const result=await processErasureQueue(f.store,5);assert.equal(result.scanned,2);assert.equal(result.completed,1);assert.equal(result.waiting,1);assert.equal(result.failed,0)
 assert.equal((await processErasureQueue(f.store)).scanned,0);await assert.rejects(processErasureQueue(f.store,100))
})

test('016: professional request never implicitly erases students who are separate data subjects',async()=>{
 const f=await fixture();await db().query('DELETE FROM billing_accounts WHERE user_id=$1',[f.owner]);await setAccountDisabled(f.owner,true,'owner_request')
 const id=await request(f.owner,f.owner,'professional'),result=await processErasure(id,f.store);assert.equal(result.state,'blocked');assert.equal('blocker' in result?result.blocker:null,'related_history')
 assert.equal((await db().query('SELECT 1 FROM student_links WHERE id=$1',[f.student.id])).rowCount,1);assert.equal(f.store.deletes,0)
})
test('016: maintenance locks remain compatible with FK key-share reservations already in flight',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const id=await request(f.owner,f.empty.id),c=await db().connect();await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,13013))',[f.owner])
 const worker=processErasure(id,f.store).catch(error=>error as Error)
 try{let waiting=false;for(let i=0;i<100;i++){const r=await db().query("SELECT EXISTS(SELECT 1 FROM pg_locks l JOIN pg_stat_activity a ON a.pid=l.pid WHERE a.datname=current_database() AND l.locktype='advisory' AND NOT l.granted) AS waiting");if(r.rows[0].waiting){waiting=true;break}await new Promise(resolve=>setTimeout(resolve,10))}assert.equal(waiting,true);await c.query("SET LOCAL lock_timeout='500ms'");await c.query('SELECT id FROM users WHERE id=$1 FOR KEY SHARE',[f.owner]);await c.query('COMMIT')}
 finally{await c.query('ROLLBACK');c.release()}
 const result=await worker;if(result instanceof Error)throw result;assert.equal(result.state,'completed')
})

test('016: concurrent approved duplicate requests resolve to one durable operation',async()=>{
 const f=await fixture();await setAccountDisabled(f.owner,true,'owner_request');const input={id:randomUUID(),ownerId:f.owner,scope:'student' as const,subjectId:f.empty.id,approvalReference:randomUUID()}
 const results=await Promise.all([requestErasure(input),requestErasure({...input,id:randomUUID()})]);assert.equal(results[0],results[1]);assert.equal((await db().query('SELECT count(*) FROM privacy_erasure_jobs')).rows[0].count,'1')
})
