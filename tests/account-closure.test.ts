import {before,after,beforeEach,test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import argon2 from 'argon2'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {createSession,readSession,sessionDigest} from '../src/server/sessions'
import {closureHandler,requestClosure,ClosureUnauthorized,ClosureConflict} from '../src/server/settings/closure'
import {processAccountClosures,processClosureErasures} from '../src/server/privacy/account-closure-worker'
import {startCheckout,processBillingEvent} from '../src/server/subscriptions/service'
import {ControlledGateway,fixture} from './helpers/controlled-billing'
import type Stripe from 'stripe'
const url=process.env.TEST_DATABASE_URL
if(!url||!new URL(url).pathname.endsWith('_test'))throw Error('ISOLATED_TEST_DATABASE_REQUIRED')
Object.assign(process.env,{DATABASE_URL:url,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_fixture_not_a_real_key',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_controlled_fixture_not_real'})
let owner:string,token:string,gateway:ControlledGateway
const password='Closure-password!'
before(async()=>{await migrate(url)})
beforeEach(async()=>{await db().query('TRUNCATE users,account_closures,privacy_erasure_jobs,billing_events,abuse_limits CASCADE');owner=randomUUID();gateway=new ControlledGateway();await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,'Closure Test',now())",[owner,owner+'@example.test']);await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[owner,await argon2.hash(password,{type:argon2.argon2id})]);token=(await createSession(owner)).token})
after(async()=>{await db().end()})
test('no subscription closes access immediately; retries cannot restore it; operator queues lawful erasure',async()=>{
 const result=await requestClosure(owner,sessionDigest(token),password)
 assert.ok('immediate'in result&&result.immediate)
 assert.equal(await readSession(token),null)
 await assert.rejects(createSession(owner))
 const worked=await processAccountClosures();assert.equal(worked.closed,1)
 assert.equal((await db().query('SELECT count(*)::int n FROM credentials WHERE user_id=$1',[owner])).rows[0].n,0)
 assert.equal((await db().query('SELECT count(*)::int n FROM privacy_erasure_jobs WHERE owner_id=$1',[owner])).rows[0].n,1)
 assert.equal((await processAccountClosures()).closed,0)
 assert.equal((await processClosureErasures(null)).completed,1)
 assert.equal((await db().query('SELECT count(*)::int n FROM users WHERE id=$1',[owner])).rows[0].n,0)
})
test('wrong password or revoked session cannot schedule closure',async()=>{
 await assert.rejects(requestClosure(owner,sessionDigest(token),'incorrect'),ClosureUnauthorized)
 await db().query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1',[owner])
 await assert.rejects(requestClosure(owner,sessionDigest(token),password),ClosureUnauthorized)
 assert.equal((await db().query('SELECT count(*)::int n FROM account_closures')).rows[0].n,0)
})
test('active trial cancels renewal canonically, schedules boundary, denies future Checkout and expires sessions without worker',async()=>{
 await startCheckout(owner,gateway);const{session,sub}=gateway.complete()
 await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),type:'checkout.session.completed',livemode:false,created:Math.floor(Date.now()/1000),data:{object:session}}),gateway)
 const result=await requestClosure(owner,sessionDigest(token),password,gateway)
 assert.equal(new Date(result.effectiveAt).getTime(),sub.trial_end!*1000)
 assert.ok(await readSession(token))
 await assert.rejects(startCheckout(owner,gateway))
 assert.equal((await processAccountClosures()).closed,0)
 await db().query("UPDATE account_closures SET effective_at=clock_timestamp()-interval '1 second' WHERE user_id=$1",[owner])
 assert.equal(await readSession(token),null)
 await assert.rejects(createSession(owner))
})
test('open checkout blocks deletion; provider unavailability never means no subscription',async()=>{
 await startCheckout(owner,gateway)
 await assert.rejects(requestClosure(owner,sessionDigest(token),password,gateway),ClosureConflict)
 assert.ok(await readSession(token))
})
test('HTTP enforces origin, authentication, own account, strict input and confirmation',async()=>{
 const req=(body:unknown,origin='http://localhost:3107',cookie='formfisik-session='+token)=>new Request('http://localhost:3107/api/settings/closure',{method:'POST',headers:{origin,cookie,'content-type':'application/json'},body:JSON.stringify(body)})
 assert.equal((await closureHandler(req({},'https://evil.test'))).status,403)
 assert.equal((await closureHandler(req({},undefined,''))).status,401)
 assert.equal((await closureHandler(req({currentPassword:password,confirmation:'EXCLUIR MINHA CONTA',userId:randomUUID()}))).status,400)
 assert.equal((await closureHandler(req({currentPassword:password,confirmation:'wrong'}))).status,400)
 assert.equal((await closureHandler(req({currentPassword:password,confirmation:'EXCLUIR MINHA CONTA'}))).status,200)
})
test('provider outage cannot be treated as missing subscription or close access',async()=>{
 await startCheckout(owner,gateway);const{session}=gateway.complete()
 await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),type:'checkout.session.completed',livemode:false,created:Math.floor(Date.now()/1000),data:{object:session}}),gateway)
 gateway.failReads=true
 await assert.rejects(requestClosure(owner,sessionDigest(token),password,gateway))
 assert.equal((await db().query('SELECT count(*)::int n FROM account_closures')).rows[0].n,0)
 assert.ok(await readSession(token))
})
test('concurrent paid closure is idempotent, preserves paid boundary and never schedules a second cancellation',async()=>{
 await startCheckout(owner,gateway);const{session,sub}=gateway.complete();gateway.paid(sub)
 await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),type:'checkout.session.completed',livemode:false,created:Math.floor(Date.now()/1000),data:{object:session}}),gateway)
 const results=await Promise.all([requestClosure(owner,sessionDigest(token),password,gateway),requestClosure(owner,sessionDigest(token),password,gateway)])
 assert.equal(results[0].effectiveAt,results[1].effectiveAt)
 assert.equal(new Date(results[0].effectiveAt).getTime(),sub.items.data[0].current_period_end*1000)
 assert.equal(gateway.cancelCalls.length,1)
 assert.equal((await db().query('SELECT count(*)::int n FROM account_closures')).rows[0].n,1)
 await assert.rejects(requestClosure(owner,sessionDigest(token),'wrong',gateway),ClosureUnauthorized)
})
test('restore ledger preserves scheduled closures and expiration after replay',async()=>{
 const{exportErasureLedger,replayErasureLedger}=await import('../src/server/privacy/ledger')
 await db().query('INSERT INTO account_closures(id,user_id,effective_at) VALUES($1,$2,clock_timestamp()+interval \'1 day\')',[randomUUID(),owner])
 const ledger=await exportErasureLedger()
 await db().query('DELETE FROM account_closures')
 await replayErasureLedger(ledger)
 assert.equal((await db().query('SELECT count(*)::int n FROM account_closures WHERE user_id=$1',[owner])).rows[0].n,1)
 assert.ok(await readSession(token))
 await db().query("UPDATE account_closures SET effective_at=clock_timestamp()-interval '1 second' WHERE user_id=$1",[owner])
 const dueLedger=await exportErasureLedger();await db().query('DELETE FROM account_closures');await replayErasureLedger(dueLedger)
 assert.equal(await readSession(token),null)
})
test('worker rechecks proration and financial retention preserves operational records',async()=>{
 await db().query("INSERT INTO billing_accounts(id,user_id) VALUES($1,$2)",[randomUUID(),owner])
 await db().query("INSERT INTO professional_settings(user_id,profile,account,cpf_ciphertext,cpf_last_digits) VALUES($1,'{\"name\":\"public\"}','{\"city\":\"retained\"}','encrypted-synthetic','12')",[owner])
 await requestClosure(owner,sessionDigest(token),password)
 assert.equal((await processAccountClosures()).closed,1)
 const profile=(await db().query('SELECT profile,account,cpf_ciphertext,avatar FROM professional_settings WHERE user_id=$1',[owner])).rows[0]
 assert.deepEqual(profile.profile,{})
 assert.equal(profile.account.city,'retained')
 assert.equal(profile.cpf_ciphertext,'encrypted-synthetic')
 const{processErasure}=await import('../src/server/privacy/erasure')
 const job=(await db().query('SELECT id FROM privacy_erasure_jobs WHERE owner_id=$1',[owner])).rows[0]
 const erased=await processErasure(job.id,null)
 assert.ok('blocker' in erased)
 assert.equal(erased.blocker,'financial_retention')
 assert.equal((await db().query('SELECT count(*)::int n FROM billing_accounts WHERE user_id=$1',[owner])).rows[0].n,1)
})
test('runtime grants permit self closure without granting account erasure or DDL',async()=>{
 const{Pool}=await import('pg');const{readFile}=await import('node:fs/promises')
 const root=db(),role='closure_runtime_'+randomBytes(5).toString('hex'),secret=randomBytes(24).toString('hex')
 await root.query(`CREATE ROLE ${role} LOGIN PASSWORD '${secret}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`)
 const grants=(await readFile('db/operations/runtime-grants.sql','utf8')).replaceAll(':"runtime_role"','"'+role+'"')
 await root.query(grants)
 const connection=new URL(url!);connection.username=role;connection.password=secret
 const runtime=new Pool({connectionString:connection.toString()})
 const globalPool=globalThis as unknown as {formfisikPool:import('pg').Pool}
 globalPool.formfisikPool=runtime
 try{
  assert.ok(await readSession(token))
  const result=await requestClosure(owner,sessionDigest(token),password)
  assert.ok('immediate' in result&&result.immediate)
  assert.equal(await readSession(token),null)
  await assert.rejects(runtime.query('DELETE FROM credentials WHERE user_id=$1',[owner]),{code:'42501'})
  await assert.rejects(runtime.query('CREATE TABLE closure_forbidden(id int)'),{code:'42501'})
 }finally{globalPool.formfisikPool=root;await runtime.end();await root.query('DROP OWNED BY '+role);await root.query('DROP ROLE '+role)}
})
test('worker refuses erasure when canonical cancellation was removed or renewed remotely',async()=>{
 await startCheckout(owner,gateway);const{session,sub}=gateway.complete()
 await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),type:'checkout.session.completed',livemode:false,created:Math.floor(Date.now()/1000),data:{object:session}}),gateway)
 await requestClosure(owner,sessionDigest(token),password,gateway)
 await db().query("UPDATE account_closures SET effective_at=clock_timestamp()-interval '1 second' WHERE user_id=$1",[owner])
 sub.cancel_at=null;sub.cancel_at_period_end=false
 const result=await processAccountClosures(gateway)
 assert.equal(result.closed,0);assert.equal(result.blocked,1)
 assert.equal((await db().query('SELECT count(*)::int n FROM credentials WHERE user_id=$1',[owner])).rows[0].n,1)
 assert.equal((await db().query('SELECT count(*)::int n FROM privacy_erasure_jobs')).rows[0].n,0)
})
