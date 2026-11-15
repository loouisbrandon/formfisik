import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {changeAccountSecurity,adminSecurityHandler} from '../src/server/admin/account-security'
test('administrative account changes revoke sessions, are audited and protect closure/admins',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 Object.assign(process.env,{DATABASE_URL:url,APP_URL:'http://localhost:3000',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')})
 const {migrate}=await import('../scripts/migrate');await migrate(url)
 const {db}=await import('../src/server/db'),{createSession,readSession,revokeSession}=await import('../src/server/sessions'),{hash}=await import('argon2')
 const ids=[randomUUID(),randomUUID(),randomUUID()],password=await hash(randomBytes(32)),input={disabled:true,expectedDisabled:false,reason:'administrative_review'}
 try{
  for(let i=0;i<3;i++){await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Security',$3,now())",[ids[i],ids[i]+'@example.test',i===2?'professional':'admin']);await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[ids[i],password])}
  const a=await createSession(ids[0]),b=await createSession(ids[1]),target=await createSession(ids[2])
  const first=await changeAccountSecurity(ids[0],a.token,ids[2],input);assert.equal(first.changed,true);assert.equal(await readSession(target.token),null)
  assert.equal((await changeAccountSecurity(ids[0],a.token,ids[2],input)).changed,false)
  assert.equal((await db().query('SELECT actor_id FROM account_security_events WHERE user_id=$1',[ids[2]])).rows[0].actor_id,ids[0])
  await changeAccountSecurity(ids[0],a.token,ids[2],{...input,disabled:false,expectedDisabled:true});assert.equal(await readSession(target.token),null)
  await assert.rejects(changeAccountSecurity(ids[0],a.token,ids[0],input),/SELF_ACTION/)
  await db().query("INSERT INTO account_closures(id,user_id,effective_at) VALUES($1,$2,now()+interval '1 day')",[randomUUID(),ids[2]])
  await assert.rejects(changeAccountSecurity(ids[0],a.token,ids[2],{...input,disabled:false}),/REACTIVATION_BLOCKED/)
  const results=await Promise.allSettled([changeAccountSecurity(ids[0],a.token,ids[1],input),changeAccountSecurity(ids[1],b.token,ids[0],input)])
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1)
  assert.equal((await db().query("SELECT count(*)::int n FROM users WHERE id=ANY($1::uuid[]) AND role='admin' AND disabled_at IS NULL",[ids])).rows[0].n,1)
  const survivor=await readSession(a.token)?{id:ids[0],token:a.token}:{id:ids[1],token:b.token}
  await revokeSession(survivor.token)
  await assert.rejects(changeAccountSecurity(survivor.id,survivor.token,ids[2],input),/SESSION_REVOKED/)
  assert.equal((await adminSecurityHandler(new Request('http://localhost:3000/api/admin',{method:'POST',headers:{origin:'https://evil.test'}}),ids[2])).status,403)
  assert.equal((await adminSecurityHandler(new Request('http://localhost:3000/api/admin',{method:'POST',headers:{origin:'http://localhost:3000'}}),ids[2])).status,401)
 }finally{await db().query('DELETE FROM account_security_events WHERE user_id=ANY($1::uuid[])',[ids]);await db().query('DELETE FROM account_closures WHERE user_id=ANY($1::uuid[])',[ids]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[ids]);await db().end()}
})
