import {artifactPath} from './helpers/artifacts'
import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID, randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import Stripe from 'stripe'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { createSession } from '../src/server/sessions'
import { createDashboardHandler } from '../src/server/professional-dashboard'
import { startCheckout, processBillingEvent } from '../src/server/subscriptions/service'
import { ControlledGateway, fixture } from './helpers/controlled-billing'
import { activeNavigation, professionalNavigation, futureModules, pageTitle } from '../src/modules/professional/navigation'
const connection=process.env.TEST_DATABASE_URL
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw new Error('Isolated _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_not_real',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_not_real',STRIPE_PORTAL_CONFIGURATION_ID:''})
let id:string, provider:ControlledGateway, cookie:string
before(async()=>{await migrate(connection)})
beforeEach(async()=>{
  await db().query('TRUNCATE users,billing_events,abuse_limits CASCADE')
  id=randomUUID();provider=new ControlledGateway()
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Profissional real do teste','professional',now())",[id,id+'@example.test'])
  cookie='formfisik-session='+(await createSession(id)).token
})
after(async()=>{await db().end()})
const request=(extra='',session=cookie)=>new Request('http://localhost:3107/api/professional/dashboard'+extra,{headers:{cookie:session}})
async function enroll() {
  await startCheckout(id,provider)
  const {session,sub}=provider.complete()
  await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),type:'checkout.session.completed',livemode:false,created:Math.floor(Date.now()/1000),data:{object:session}}),provider)
  return sub
}
test('navigation has only existing links, one active subscription group and unavailable future modules',()=>{
  assert.deepEqual(professionalNavigation.map(x=>x.href),['/dashboard','/indicadores','/tutoriais','/alunos','/agenda','/consultorias','/financeiro','/crm','/comunicacao','/checkins','/anamneses','/videos','/exercicios','/treinos','/acompanhamento','/assinatura/gerenciar','/conta','/configuracoes'])
  assert.equal(futureModules.length,0)
  assert.equal(pageTitle('/assinatura/retorno'),'Minha assinatura')
  assert.equal(pageTitle('/importar'),'Importar dados')
  assert.equal(activeNavigation('/conta','/dashboard'),false)
})
test('unauthenticated, forged, expired, revoked and unconfirmed sessions cannot open the dashboard',async()=>{
  const handler=createDashboardHandler(provider)
  assert.equal((await handler(request('', ''))).status,401)
  assert.equal((await handler(request('', 'formfisik-session='+randomBytes(32).toString('base64url')))).status,401)
  await db().query("UPDATE sessions SET last_seen_at=now()-interval '31 minutes'")
  assert.equal((await handler(request())).status,401)
  cookie='formfisik-session='+(await createSession(id)).token
  await db().query('UPDATE sessions SET revoked_at=now()')
  assert.equal((await handler(request())).status,401)
  cookie='formfisik-session='+(await createSession(id)).token
  await db().query('UPDATE users SET email_verified_at=null')
  assert.equal((await handler(request())).status,401)
})
test('no subscription redirects to offer; unsupported role to account',async()=>{
  assert.equal((await createDashboardHandler(provider)(request('?paidAccess=true&success=1'))).status,400)
  let response=await createDashboardHandler(provider)(request())
  assert.equal(response.status,403);assert.equal((await response.json()).destination,'/assinatura')
  await db().query("UPDATE users SET role='student' WHERE id=$1",[id])
  response=await createDashboardHandler(provider)(request())
  assert.equal(response.status,403);assert.equal((await response.json()).destination,'/conta')
})
test('confirmed trial returns real identity and explicit empty data, without credentials or provider IDs',async()=>{
  await enroll()
  const response=await createDashboardHandler(provider)(request())
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store')
  const result=await response.json()
  assert.equal(result.data.fullName,'Profissional real do teste');assert.equal(result.data.studentTotal,0);assert.deepEqual(result.data.indicators.map((item:{value:string})=>item.value),['0','0','0','0','0','0','0']);assert.deepEqual(result.data.activities,[])
  assert.doesNotMatch(JSON.stringify(result),/token|email|cus_|sub_|password|stripe/i)
  await mkdir(artifactPath(''),{recursive:true});await writeFile(artifactPath('dashboard-data.json'),JSON.stringify(result.data))
})
test('paid subscription, canonical expiry, provider failure, and cancellation deny stale access appropriately',async()=>{
  const sub=await enroll();provider.paid(sub)
  const handler=createDashboardHandler(provider)
  assert.equal((await handler(request())).status,200)
  provider.failReads=true
  // A recent verified snapshot needs no provider request during navigation.
  assert.equal((await handler(request())).status,200)
  await db().query("UPDATE billing_subscriptions SET verified_at=now()-interval '6 minutes'")
  assert.equal((await handler(request())).status,503)
  provider.failReads=false;sub.status='canceled';sub.ended_at=Math.floor(Date.now()/1000)
  await db().query("UPDATE billing_accounts SET last_sync_attempt_at=now()-interval '61 seconds'")
  const denied=await handler(request());assert.equal(denied.status,403);assert.equal((await denied.json()).destination,'/assinatura/gerenciar')
})
test('one user cannot select another identity or entitlement using query parameters, and polling does not renew idle time',async()=>{
  await enroll()
  const other=randomUUID()
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Outra pessoa','professional',now())",[other,other+'@example.test'])
  const otherCookie='formfisik-session='+(await createSession(other)).token
  const denied=await createDashboardHandler(provider)(request('?userId='+id+'&paidAccess=true',otherCookie))
  assert.equal(denied.status,400)
  await db().query("UPDATE sessions SET last_seen_at=now()-interval '5 minutes' WHERE user_id=$1",[id])
  const before=(await db().query('SELECT last_seen_at FROM sessions WHERE user_id=$1',[id])).rows[0].last_seen_at.getTime()
  await createDashboardHandler(provider)(request('?userId='+other))
  assert.equal((await db().query('SELECT last_seen_at FROM sessions WHERE user_id=$1',[id])).rows[0].last_seen_at.getTime(),before)
})
test('rate limiting contains repeated canonical provider requests',async()=>{
  const handler=createDashboardHandler(provider)
  for(let i=0;i<30;i++)assert.equal((await handler(request())).status,403)
  assert.equal((await handler(request())).status,429)
})

test('trial expiration is enforced by canonical provider state without a delivered webhook',async()=>{
  const sub=await enroll();sub.trial_end=Math.floor(Date.now()/1000)-1;sub.trial_start=sub.trial_end-30*86400
  await db().query("UPDATE billing_subscriptions SET verified_at=now()-interval '6 minutes'")
  const response=await createDashboardHandler(provider)(request())
  assert.equal(response.status,403);assert.equal((await response.json()).destination,'/assinatura/gerenciar')
})
test('absent Stripe configuration cannot be replaced by paid URL flags or persisted entitlement',async()=>{
  await enroll()
  const previous=process.env.STRIPE_SECRET_KEY
  try{
    process.env.STRIPE_SECRET_KEY=''
    const response=await createDashboardHandler(provider)(request('?paidAccess=1&trialing=1'))
    assert.equal(response.status,400)
    const canonical=await createDashboardHandler(provider)(request());assert.equal(canonical.status,503);assert.equal((await canonical.json()).status,'unavailable')
  }finally{process.env.STRIPE_SECRET_KEY=previous}
})

 test('locally expired verified trial denies immediately, without waiting for freshness expiry',async()=>{
 await enroll()
 await db().query("UPDATE billing_subscriptions SET trial_end=now()-interval '1 second'")
 assert.equal((await createDashboardHandler(provider)(request())).status,403)
 })
