import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {adminPrivacy} from '../src/server/admin/privacy'
import {adminPrivacyQuery,privacyHref} from '../src/modules/admin/privacy-schema'
const actor={id:randomUUID(),role:'admin',fullName:'Synthetic Admin',email:'synthetic@example.test'}
test('privacy admin guard and tab-specific validation fail closed',async()=>{
 for(const role of ['professional','student','ADMIN',''])await assert.rejects(adminPrivacy({...actor,role},{}),/ADMIN_ACCESS_DENIED/)
 for(const input of [{tab:'logs'},{page:0},{period:'365'},{q:'x'.repeat(121)},{state:'closed'},{state:'toString'},{tab:'security',detalhe:randomUUID()},{tab:'closures',detalhe:'123'},{sort:'DROP TABLE users'},{unknown:'value'}])assert.equal(adminPrivacyQuery.safeParse(input).success,false)
 assert.equal(adminPrivacyQuery.safeParse({tab:'security',detalhe:'123'}).success,true)
 const q=adminPrivacyQuery.parse({tab:'erasures',state:'blocked',page:2,detalhe:randomUUID()})
 const url=new URL(privacyHref(q),'http://localhost');assert.equal(url.searchParams.get('state'),'blocked');assert.equal(url.searchParams.get('page'),'2')
})
test('privacy monitoring has paginated minimal projections and read-only runtime grants',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 process.env.DATABASE_URL=url
 const {migrate}=await import('../scripts/migrate');await migrate(url)
 const {db}=await import('../src/server/db'),users:string[]=[],closures:string[]=[],jobs:string[]=[],prefix=randomUUID().slice(0,8),orphan=randomUUID()
 try{
  const baseline=await adminPrivacy(actor,{})
  for(let i=0;i<25;i++){
   const user=randomUUID();users.push(user)
   await db().query("INSERT INTO users(id,email,full_name,email_verified_at,disabled_at) VALUES($1,$2,$3,now(),CASE WHEN $4 THEN now() ELSE NULL END)",[user,user+'@example.test',prefix+(i===0?'%_literal':' User '+i),i===0])
   await db().query("INSERT INTO settings_privacy_requests(user_id,kind,status,created_at) VALUES($1,$2,$3,now()-$4*interval '1 day')",[user,['access','correction','erasure'][i%3],['pending','processing','completed','denied'][i%4],i===24?120:0])
  }
  for(let i=0;i<3;i++){const id=randomUUID();closures.push(id);await db().query("INSERT INTO account_closures(id,user_id,effective_at,state,processed_at) VALUES($1,$2,now()+interval '1 day',$3,CASE WHEN $4 THEN now() ELSE NULL END)",[id,i===2?orphan:users[i],i===1?'closed':'scheduled',i===1])}
  for(let i=0;i<3;i++){const id=randomUUID();jobs.push(id);await db().query("INSERT INTO privacy_erasure_jobs(id,owner_id,subject_id,scope,approval_reference,state,blocker,completed_at) VALUES($1,$2,$3,$4,$5,$6,$7,CASE WHEN $8 THEN now() ELSE NULL END)",[id,i===2?orphan:users[0],i===1?randomUUID():i===2?orphan:users[0],i===1?'student':'professional',randomUUID(),i===0?'blocked':i===1?'pending':'completed',i===0?'financial_retention':null,i===2])}
  const event=await db().query("INSERT INTO account_security_events(user_id,kind,reason) VALUES($1,'disabled','security_incident') RETURNING id::text",[users[0]])
  const requests=await adminPrivacy(actor,{q:prefix});assert.equal(requests.total,25);assert.equal(requests.items.length,20)
  const second=await adminPrivacy(actor,{q:prefix,page:2});assert.equal(second.items.length,5);assert.ok(second.items.every(item=>!requests.items.some(row=>row.id===item.id)))
  assert.equal((await adminPrivacy(actor,{q:prefix,period:'7'})).total,24)
  assert.equal((await adminPrivacy(actor,{q:prefix,state:'pending'})).total,7)
  assert.equal((await adminPrivacy(actor,{q:prefix+'%_'})).total,1)
  assert.equal((await adminPrivacy(actor,{q:"' OR 1=1 --"})).total,0)
  assert.equal((await adminPrivacy(actor,{q:prefix,page:10000})).items.length,0)
  assert.deepEqual(Object.keys(requests.items[0]).sort(),['createdAt','id','name','state','type'])
  assert.equal(requests.summary.requests-baseline.summary.requests,13)
  assert.equal(requests.summary.closures-baseline.summary.closures,2)
  assert.equal(requests.summary.blockedErasures-baseline.summary.blockedErasures,1)
  assert.equal(requests.summary.disabledUsers-baseline.summary.disabledUsers,1)
  const blocked=await adminPrivacy(actor,{tab:'erasures',detalhe:jobs[0]});assert.equal(blocked.selected?.blocker,'financial_retention')
  assert.deepEqual(Object.keys(blocked.selected!).sort(),['blocker','createdAt','effectiveAt','id','name','state','type','updatedAt','userId'])
  const tombstone=await adminPrivacy(actor,{tab:'erasures',detalhe:jobs[2]});assert.equal(tombstone.selected?.name,'Conta removida');assert.equal(tombstone.selected?.userId,null)
  assert.equal((await adminPrivacy(actor,{tab:'closures',detalhe:closures[1]})).selected?.state,'closed')
  assert.equal((await adminPrivacy(actor,{tab:'closures',detalhe:jobs[0]})).selected,null)
  assert.equal((await adminPrivacy(actor,{tab:'security',detalhe:event.rows[0].id})).selected?.type,'security_incident')
  // Verify actual restricted-role reads and forbidden operator columns/writes.
  const {Pool}=await import('pg'),{readFile}=await import('node:fs/promises'),root=db(),role='privacy_runtime_'+randomBytes(4).toString('hex'),password=randomBytes(24).toString('hex')
  await root.query(`CREATE ROLE ${role} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`)
  await root.query((await readFile('db/operations/runtime-grants.sql','utf8')).replaceAll(':"runtime_role"','"'+role+'"'))
  const connection=new URL(url);connection.username=role;connection.password=password;const runtime=new Pool({connectionString:connection.toString()}),globalPool=globalThis as unknown as {formfisikPool:import('pg').Pool};globalPool.formfisikPool=runtime
  try{
   for(const tab of ['requests','closures','erasures','security'] as const)assert.ok((await adminPrivacy(actor,{tab})).total>=1)
   await assert.rejects(runtime.query('SELECT approval_reference FROM privacy_erasure_jobs'),{code:'42501'})
   await assert.rejects(runtime.query('SELECT subject_id FROM privacy_erasure_jobs'),{code:'42501'})
   await assert.rejects(runtime.query('SELECT object_key FROM privacy_erasure_objects'),{code:'42501'})
   await assert.rejects(runtime.query("UPDATE privacy_erasure_jobs SET state='pending'"),{code:'42501'})
   await assert.rejects(runtime.query("UPDATE account_security_events SET reason='owner_request'"),{code:'42501'})
  }finally{globalPool.formfisikPool=root;await runtime.end();await root.query('DROP OWNED BY '+role);await root.query('DROP ROLE '+role)}
 }finally{await db().query('DELETE FROM account_security_events WHERE user_id=ANY($1::uuid[])',[users]);await db().query('DELETE FROM account_closures WHERE id=ANY($1::uuid[])',[closures]);await db().query('DELETE FROM privacy_erasure_jobs WHERE id=ANY($1::uuid[])',[jobs]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[users]);await db().end()}
})
