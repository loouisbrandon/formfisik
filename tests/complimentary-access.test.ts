import{before,after,beforeEach,test}from'node:test'
import assert from'node:assert/strict'
import{randomUUID,randomBytes}from'node:crypto'
import{migrate}from'../scripts/migrate'
import{db}from'../src/server/db'
import{provisionComplimentaryProfessional,revokeComplimentaryAccess}from'../src/server/subscriptions/complimentary-operations'
import{hasComplimentaryAccess}from'../src/server/subscriptions/complimentary'
import{subscriptionStatus}from'../src/server/subscriptions/status'
import{professionalAccess}from'../src/server/professional-dashboard'
import{createSession,readSession}from'../src/server/sessions'
const url=process.env.TEST_DATABASE_URL;if(!url||!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
Object.assign(process.env,{DATABASE_URL:url,APP_URL:'https://sta.formfisik.com.br',RAILWAY_ENVIRONMENT_NAME:'staging',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')})
const input=()=>({email:randomUUID()+'@example.test',fullName:'Synthetic Tester',password:'Synthetic-Password123!',authorizationReference:randomUUID()})
before(async()=>{await migrate(url)})
beforeEach(async()=>{process.env.APP_URL='https://sta.formfisik.com.br';process.env.RAILWAY_ENVIRONMENT_NAME='staging';await db().query('TRUNCATE users,complimentary_access_events,complimentary_access_grants,account_closures CASCADE')})
after(async()=>{await db().end()})
test('operator provision grants professional access without Stripe rows, card, trial or invoices',async()=>{
 const created=await provisionComplimentaryProfessional(input())
 assert.ok(await hasComplimentaryAccess(created.userId))
 const status=await subscriptionStatus(created.userId)
 assert.equal(status.state,'courtesy');assert.equal(status.paidAccess,true);assert.equal(status.studentLimit,null);assert.equal(status.financialStatus,null);assert.equal(status.accessUntil,null);assert.equal(status.nextBillingAt,null)
 assert.deepEqual(status.invoices,[]);assert.ok(Object.values(status.actions).every(v=>!v))
 assert.equal((await professionalAccess({id:created.userId,role:'professional',email:'synthetic@example.test',fullName:'Synthetic Tester'})).status,'allowed')
 assert.equal((await db().query('SELECT count(*)::int n FROM billing_accounts')).rows[0].n,0)
 assert.ok(await readSession((await createSession(created.userId)).token))
})
test('no privilege for other users, disabled/unconfirmed accounts, wrong domain or production environment',async()=>{
 const created=await provisionComplimentaryProfessional(input());assert.equal(await hasComplimentaryAccess(randomUUID()),false)
 await db().query('UPDATE users SET disabled_at=now() WHERE id=$1',[created.userId]);assert.equal(await hasComplimentaryAccess(created.userId),false)
 await db().query('UPDATE users SET disabled_at=NULL,email_verified_at=NULL WHERE id=$1',[created.userId]);assert.equal(await hasComplimentaryAccess(created.userId),false)
 await db().query('UPDATE users SET email_verified_at=now() WHERE id=$1',[created.userId]);process.env.RAILWAY_ENVIRONMENT_NAME='production';assert.equal(await hasComplimentaryAccess(created.userId),false)
 await assert.rejects(provisionComplimentaryProfessional(input()))
 process.env.RAILWAY_ENVIRONMENT_NAME='staging';process.env.APP_URL='https://formfisik.com.br';assert.equal(await hasComplimentaryAccess(created.userId),false)
})
test('revocation is idempotent, audited and revokes sessions immediately',async()=>{
 const created=await provisionComplimentaryProfessional(input()),session=await createSession(created.userId)
 assert.equal((await revokeComplimentaryAccess(created.userId,randomUUID())).revoked,1)
 assert.equal((await revokeComplimentaryAccess(created.userId,randomUUID())).revoked,0)
 assert.equal(await hasComplimentaryAccess(created.userId),false);assert.equal(await readSession(session.token),null)
 assert.equal((await db().query('SELECT count(*)::int n FROM complimentary_access_events')).rows[0].n,2)
})
test('existing identity is never overwritten and closure deadline overrides a complimentary grant',async()=>{
 const data=input(),created=await provisionComplimentaryProfessional(data)
 await assert.rejects(provisionComplimentaryProfessional({...data,password:'Different-Password123!'}))
 assert.equal((await db().query('SELECT count(*)::int n FROM complimentary_access_grants')).rows[0].n,1)
 await db().query("INSERT INTO account_closures(id,user_id,effective_at) VALUES($1,$2,now()-interval '1 second')",[randomUUID(),created.userId]);assert.equal(await hasComplimentaryAccess(created.userId),false)
})
test('runtime can read authorization and append audit but cannot erase or rewrite it',async()=>{
 const{Pool}=await import('pg'),{readFile}=await import('node:fs/promises');const root=db(),role='comp_runtime_'+randomBytes(4).toString('hex'),pass=randomBytes(24).toString('hex'),created=await provisionComplimentaryProfessional(input())
 await root.query(`CREATE ROLE ${role} LOGIN PASSWORD '${pass}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`)
 await root.query((await readFile('db/operations/runtime-grants.sql','utf8')).replaceAll(':"runtime_role"','"'+role+'"'))
 const u=new URL(url!);u.username=role;u.password=pass;const runtime=new Pool({connectionString:u.toString()}),globalPool=globalThis as unknown as{formfisikPool:import('pg').Pool};globalPool.formfisikPool=runtime
 try{assert.ok(await hasComplimentaryAccess(created.userId));await assert.rejects(runtime.query('DELETE FROM complimentary_access_grants'),{code:'42501'});await assert.rejects(runtime.query("UPDATE complimentary_access_events SET operation='granted'"),{code:'42501'});await assert.rejects(runtime.query('UPDATE complimentary_access_grants SET expires_at=now()'),{code:'42501'})}
 finally{globalPool.formfisikPool=root;await runtime.end();await root.query('DROP OWNED BY '+role);await root.query('DROP ROLE '+role)}
})
