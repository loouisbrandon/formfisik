// PostgreSQL + explicit test-only provider. No hosted Stripe calls or runtime bypass.
import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID, randomBytes } from 'node:crypto'
import Stripe from 'stripe'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { createSession } from '../src/server/sessions'
import { startCheckout, processBillingEvent, reconcileUser } from '../src/server/subscriptions/service'
import { subscriptionStatus } from '../src/server/subscriptions/status'
import { cancelSubscription, openPortal } from '../src/server/subscriptions/management'
import { createManagementHandlers, createStripeWebhookHandler, billingStatus } from '../src/server/subscriptions/handlers'
import { BillingConflict, BillingUnavailable } from '../src/server/subscriptions/stripe'
import { accessFor } from '../src/server/access'
import { ControlledGateway, fixture } from './helpers/controlled-billing'
const connection = process.env.TEST_DATABASE_URL
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw new Error('Isolated _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_fixture_not_a_real_key',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_controlled_fixture_not_real',STRIPE_PORTAL_CONFIGURATION_ID:'bpc_fixture'})
let userId: string
let provider: ControlledGateway
const event = (object: unknown,type = 'customer.subscription.updated',id = 'evt_'+randomUUID(),created = Math.floor(Date.now()/1000)) => fixture<Stripe.Event>({id,type,livemode:false,created,data:{object}})
async function enroll(paid = false) {
  await startCheckout(userId,provider)
  const {session,sub} = provider.complete()
  const invoice = paid ? provider.paid(sub) : null
  await processBillingEvent(event(session,'checkout.session.completed'),provider)
  return {session,sub,invoice}
}
const status = (refresh = false) => subscriptionStatus(userId,refresh,provider)
function request(path:string,data?:unknown,cookie?:string,origin = process.env.APP_URL!) {
  return new Request(origin+path,{method:data === undefined ? 'GET':'POST',headers:{origin,'content-type':'application/json',...(cookie ? {cookie}: {})},body:data === undefined ? undefined:JSON.stringify(data)})
}
async function auth() { const s = await createSession(userId); return `formfisik-session=${s.token}` }
before(async () => { await migrate(connection); await migrate(connection) })
beforeEach(async () => {
  userId=randomUUID(); provider=new ControlledGateway()
  await db().query('TRUNCATE users,billing_events,abuse_limits CASCADE')
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Lifecycle Fixture','professional',now())",[userId,`${userId}@example.test`])
})
after(async () => { await db().end() })

test('no subscription and incomplete Checkout never authorize; frontend parameters cannot select third parties',async () => {
  assert.equal((await status()).state,'none')
  assert.equal((await accessFor({id:userId,role:'professional'})).paidAccess,false)
  await startCheckout(userId,provider)
  assert.equal((await status()).state,'checkout_pending')
  const response=await billingStatus(request('/api/subscriptions/status?userId=other&customer=cus_other&success=1',undefined,await auth()))
  assert.equal(response.status,200);assert.equal((await response.json()).paidAccess,false)
})
test('trial active grants bounded access and upcoming amount comes from provider preview',async () => {
  const {sub}=await enroll()
  const view=await status()
  assert.equal(view.state,'trialing');assert.equal(view.paidAccess,true)
  assert.equal(view.trialEnd,new Date(sub.trial_end!*1000).toISOString())
  assert.equal(view.accessUntil,view.trialEnd);assert.equal(view.nextBillingAmount,13990)
  assert.equal(view.actions.portal,true)
})
test('active subscription requires paid invoice covering the current contracted period',async () => {
  const {invoice}=await enroll(true)
  assert.equal((await status()).state,'active');assert.equal((await status()).paidAccess,true)
  invoice!.lines.data[0].period.end=Math.floor(Date.now()/1000)-1
  await reconcileUser(userId,provider)
  assert.equal((await status()).paidAccess,false)
})
test('trial and paid access expire without a delivered webhook',async () => {
  await enroll()
  await db().query("UPDATE billing_subscriptions SET trial_start=now()-interval '31 days',trial_end=now()-interval '1 day'")
  assert.equal((await status()).paidAccess,false);assert.equal((await status()).state,'expired')
  const sub=[...provider.subscriptions.values()][0];provider.paid(sub)
  await reconcileUser(userId,provider)
  await db().query("UPDATE billing_subscriptions SET period_end=now()-interval '1 minute',paid_through=now()-interval '1 minute'")
  assert.equal((await status()).paidAccess,false)
})
test('pending payment has no grace period; failed and action-required payment are explicit',async () => {
  const {sub,invoice}=await enroll(true)
  invoice!.status='open';invoice!.amount_remaining=13990;invoice!.amount_paid=0;invoice!.attempt_count=0
  await processBillingEvent(event(invoice,'invoice.updated'),provider)
  assert.equal((await status()).state,'payment_pending');assert.equal((await status()).paidAccess,false)
  invoice!.attempt_count=1;sub.status='past_due'
  await processBillingEvent(event(invoice,'invoice.payment_failed'),provider)
  assert.equal((await status()).state,'payment_failed');assert.equal((await status()).actions.regularize,true)
  invoice!.payments=fixture({data:[{payment:{payment_intent:{status:'requires_action'}}}]})
  await processBillingEvent(event(invoice,'invoice.payment_action_required'),provider)
  assert.equal((await status()).paymentIssue,'action_required')
  invoice!.status='paid';invoice!.amount_paid=13990;invoice!.amount_remaining=0;sub.status='active'
  await processBillingEvent(event(invoice,'invoice.paid'),provider)
  assert.equal((await status()).paidAccess,true);assert.equal((await status()).paymentIssue,null)
})
test('unpaid, paused, incomplete_expired and canceled are denied independently of favorable UI',async () => {
  const {sub}=await enroll(true)
  for(const [providerStatus,expected] of [['unpaid','past_due'],['paused','paused'],['incomplete_expired','expired'],['canceled','canceled']] as const) {
    sub.status=providerStatus
    await processBillingEvent(event(sub),provider)
    assert.equal((await status()).state,expected);assert.equal((await status()).paidAccess,false)
  }
  sub.status='active';sub.pause_collection={behavior:'keep_as_draft',resumes_at:null}
  await reconcileUser(userId,provider);assert.equal((await status()).paidAccess,false)
})
test('renewal paid advances the paid boundary; old invoice event cannot resurrect access after latest failure',async () => {
  const {sub,invoice:oldInvoice}=await enroll(true)
  const renewal=provider.paid(sub,'open')
  await processBillingEvent(event(renewal,'invoice.payment_failed'),provider)
  await processBillingEvent(event(oldInvoice,'invoice.paid','evt_old_paid',1),provider)
  assert.equal((await status()).paidAccess,false)
  renewal.status='paid';renewal.amount_remaining=0;renewal.amount_paid=13990
  await processBillingEvent(event(renewal,'invoice.paid'),provider)
  const view=await status();assert.equal(view.paidAccess,true);assert.equal(view.accessUntil,view.periodEnd)
  assert.equal((await db().query('SELECT * FROM billing_invoices')).rowCount,2)
})
test('trial cancellation keeps access until trial end and schedules no next charge',async () => {
  const {sub}=await enroll()
  await cancelSubscription(userId,provider)
  const view=await status()
  assert.equal(sub.cancel_at,sub.trial_end);assert.equal(view.state,'cancel_scheduled');assert.equal(view.paidAccess,true)
  assert.equal(view.accessUntil,view.trialEnd);assert.equal(view.nextBillingAt,null);assert.equal(view.nextBillingAmount,null)
  assert.equal(view.actions.cancel,false);assert.equal((await db().query('SELECT state FROM billing_cancellations')).rows[0].state,'confirmed')
  sub.status='canceled';sub.ended_at=sub.cancel_at
  await processBillingEvent(event(sub,'customer.subscription.deleted'),provider)
  assert.equal((await status()).paidAccess,false)
  await assert.rejects(()=>startCheckout(userId,provider),BillingConflict)
})
test('paid cancellation is concurrent/idempotent and preserves paid period without a refund call',async () => {
  const {sub}=await enroll(true)
  await Promise.all([cancelSubscription(userId,provider),cancelSubscription(userId,provider),cancelSubscription(userId,provider)])
  assert.equal(provider.cancelCalls.length,1);assert.equal(provider.cancelCalls[0].target,sub.items.data[0].current_period_end)
  assert.equal((await status()).paidAccess,true);assert.equal((await status()).state,'cancel_scheduled')
})
test('cancellation lost response reconciles once; retry does not send a second financial mutation',async () => {
  await enroll();provider.failCancelAfter=true
  await assert.rejects(()=>cancelSubscription(userId,provider))
  assert.equal((await status()).paidAccess,false) // Known sync error denies while uncertain.
  await cancelSubscription(userId,provider)
  assert.equal(provider.cancelCalls.length,1);assert.equal((await status()).cancellationPending,false)
  assert.equal((await status()).state,'cancel_scheduled')
})
test('cancellation outage persists intent and retries the exact same key and target',async () => {
  await enroll();provider.failCancel=true
  await assert.rejects(()=>cancelSubscription(userId,provider))
  assert.equal((await db().query('SELECT state FROM billing_cancellations')).rows[0].state,'pending')
  provider.failCancel=false
  await cancelSubscription(userId,provider)
  assert.deepEqual(provider.cancelCalls[0],provider.cancelCalls[1])
})
test('stale confirmation and uncertain expired cancellation cannot cancel a different period',async () => {
  await enroll(true)
  await assert.rejects(()=>cancelSubscription(userId,provider,'2000-01-01T00:00:00.000Z'),BillingConflict)
  assert.equal(provider.cancelCalls.length,0)
  provider.failCancel=true;await assert.rejects(()=>cancelSubscription(userId,provider))
  await db().query("UPDATE billing_cancellations SET created_at=now()-interval '25 hours'")
  provider.failCancel=false
  await assert.rejects(()=>cancelSubscription(userId,provider),BillingConflict)
  assert.equal(provider.cancelCalls.length,1)
})
test('management endpoints require confirmed auth, same origin, explicit confirmation and forbid arbitrary IDs',async () => {
  const handlers=createManagementHandlers(provider)
  assert.equal((await handlers.cancel(request('/cancel',{confirm:true,expectedEnd:new Date().toISOString()}))).status,401)
  await enroll();const cookie=await auth();const expectedEnd=(await status()).trialEnd
  assert.equal((await handlers.cancel(request('/cancel',{confirm:false,expectedEnd},cookie))).status,400)
  assert.equal((await handlers.cancel(request('/cancel',{confirm:true,expectedEnd,subscription:'sub_other'},cookie))).status,400)
  assert.equal((await handlers.cancel(request('/cancel',{confirm:true,expectedEnd},cookie,'https://evil.test'))).status,403)
  assert.equal((await handlers.portal(request('/portal',{action:'manage',customer:'cus_other'},cookie))).status,400)
  assert.equal((await handlers.cancel(request('/cancel',{confirm:true,expectedEnd},cookie))).status,200)
  assert.equal((await handlers.cancel(request('/cancel',{confirm:true,expectedEnd},cookie))).status,200)
  assert.equal(provider.cancelCalls.length,1)
})
test('another confirmed user cannot cancel or open a portal for this subscription',async () => {
  await enroll();const other=randomUUID()
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Other','professional',now())",[other,other+'@example.test'])
  await assert.rejects(()=>cancelSubscription(other,provider),BillingConflict)
  await assert.rejects(()=>openPortal(other,'manage',provider),BillingConflict)
  assert.equal(provider.cancelCalls.length,0);assert.equal(provider.portalCalls.length,0)
})
test('Portal binds own customer, configured capabilities and fixed return; payment management uses full Portal for subscription card overrides',async () => {
  await enroll()
  const result=await openPortal(userId,'payment_method',provider)
  assert.match(result.url,/^https:\/\/billing\.stripe\.com\//)
  const input=provider.portalCalls[0]
  assert.equal(input.customer,(await db().query('SELECT stripe_customer_id FROM billing_accounts')).rows[0].stripe_customer_id)
  assert.equal(input.configuration,'bpc_fixture');assert.equal(input.return_url,'http://localhost:3107/assinatura/gerenciar?retorno=portal')
  assert.equal(input.flow_data,undefined)
  assert.equal((await status(true)).paidAccess,true)
})
test('Portal missing or unsafe configuration is explicitly unavailable; no plan changes or portal cancellation',async () => {
  await enroll()
  delete process.env.STRIPE_PORTAL_CONFIGURATION_ID
  await assert.rejects(()=>openPortal(userId,'manage',provider),BillingUnavailable)
  assert.equal((await status()).actions.portal,false)
  process.env.STRIPE_PORTAL_CONFIGURATION_ID='bpc_fixture'
  provider.portalConfig.features.subscription_update.enabled=true
  await assert.rejects(()=>openPortal(userId,'manage',provider),BillingUnavailable)
  assert.equal((await status()).actions.portal,false)
  provider.portalConfig.features.subscription_update.enabled=false
})
test('regularization only opens for a canonical outstanding invoice, never settles locally',async () => {
  const {sub}=await enroll(true)
  await assert.rejects(()=>openPortal(userId,'regularize',provider),BillingConflict)
  provider.paid(sub,'open');await reconcileUser(userId,provider)
  await openPortal(userId,'regularize',provider)
  assert.equal((await status()).paidAccess,false)
})
test('canonical reconciliation recovers missed events and failure never extends stale paid access',async () => {
  const {sub}=await enroll(true)
  await db().query("UPDATE billing_subscriptions SET verified_at=now()-interval '10 minutes'")
  provider.failReads=true
  await assert.rejects(()=>status())
  assert.equal((await db().query('SELECT sync_state FROM billing_accounts')).rows[0].sync_state,'error')
  assert.equal((await status()).paidAccess,false)
  provider.failReads=false;sub.status='canceled'
  assert.equal((await status(true)).state,'canceled');assert.equal((await status()).paidAccess,false)
})
test('invoice webhook signature, duplicate processing and invalid raw bytes use existing secure endpoint',async () => {
  const {invoice}=await enroll(true)
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!)
  const payload=JSON.stringify(event(invoice,'invoice.paid'))
  const signature=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET!})
  const handler=createStripeWebhookHandler(provider)
  const req=(body=payload) => new Request(process.env.APP_URL+'/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':signature},body})
  assert.equal((await handler(req())).status,200);assert.equal((await handler(req())).status,200)
  assert.equal((await handler(req(payload+' '))).status,400)
  assert.equal((await db().query("SELECT * FROM billing_events WHERE event_type='invoice.paid'")).rowCount,1)
})
test('out-of-order subscription and card updates cannot restore ended access; Connect/live events denied',async () => {
  const {sub}=await enroll(true);sub.status='canceled';sub.ended_at=Math.floor(Date.now()/1000)
  await processBillingEvent(event(sub,'customer.subscription.deleted'),provider)
  await processBillingEvent(event({...sub,status:'active'},'customer.subscription.updated','evt_old',1),provider)
  await processBillingEvent(event({id:'pm_fixture',customer:sub.customer},'payment_method.updated'),provider)
  assert.equal((await status()).state,'canceled');assert.equal((await status()).paidAccess,false)
  await assert.rejects(()=>processBillingEvent({...event(sub),livemode:true},provider),BillingUnavailable)
  await assert.rejects(()=>processBillingEvent({...event(sub),account:'acct_unexpected'},provider),BillingUnavailable)
})
test('foreign invoice cannot change current account; transaction failure stays retryable and persists no payloads',async () => {
  const {invoice}=await enroll(true)
  invoice!.parent!.subscription_details!.subscription='sub_other'
  await assert.rejects(()=>processBillingEvent(event(invoice,'invoice.paid'),provider),BillingUnavailable)
  assert.equal((await db().query("SELECT * FROM billing_events WHERE event_type='invoice.paid'")).rowCount,0)
  const text=JSON.stringify(await db().query('SELECT * FROM billing_invoices'))
  assert.ok(!text.includes('sk_test_'));assert.ok(!text.includes('card_number'));assert.ok(!text.includes('cvv'))
})

test('database write failure rolls back event and snapshot; re-delivery recovers without stale authorization',async () => {
  const {sub}=await enroll(true);sub.status='canceled';const update=event(sub)
  await db().query("CREATE FUNCTION billing_test_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled persistence failure'; END $$")
  await db().query('CREATE TRIGGER billing_test_fail BEFORE UPDATE ON billing_subscriptions FOR EACH ROW EXECUTE FUNCTION billing_test_fail()')
  try {
    await assert.rejects(()=>processBillingEvent(update,provider))
    assert.equal((await db().query('SELECT * FROM billing_events WHERE stripe_event_id=$1',[update.id])).rowCount,0)
    assert.equal((await status()).paidAccess,false)
  } finally {
    await db().query('DROP TRIGGER billing_test_fail ON billing_subscriptions')
    await db().query('DROP FUNCTION billing_test_fail()')
  }
  await processBillingEvent(update,provider)
  assert.equal((await status()).state,'canceled')
})

test('old action-required event cannot override current canonical PaymentIntent state',async () => {
  const {invoice}=await enroll(true)
  invoice!.status='open';invoice!.amount_remaining=13990
  invoice!.payments=fixture({data:[{payment:{payment_intent:{status:'requires_action'}}}]})
  await processBillingEvent(event(invoice,'invoice.payment_action_required'),provider)
  assert.equal((await status()).paymentIssue,'action_required')
  invoice!.payments=fixture({data:[{payment:{payment_intent:{status:'requires_payment_method'}}}]})
  await processBillingEvent(event(invoice,'invoice.payment_action_required','evt_late_auth',1),provider)
  assert.equal((await status()).paymentIssue,'failed');assert.equal((await status()).paidAccess,false)
})
test('optional preview failure does not invent amount or revoke regular access; unsafe Portal URL rejected',async () => {
  await enroll(true)
  provider.upcoming=async()=>{throw new Error('Controlled optional preview unavailable')}
  await reconcileUser(userId,provider)
  assert.equal((await status()).paidAccess,true);assert.equal((await status()).nextBillingAmount,null)
  const original=provider.portal.bind(provider)
  provider.portal=async input=>({...await original(input),url:'https://evil.test/redirect'})
  await assert.rejects(()=>openPortal(userId,'manage',provider),BillingUnavailable)
})

test('invoice state read before account lock cannot overwrite the latest canonical invoice under lock',async () => {
  const {invoice}=await enroll(true)
  const original=provider.invoice.bind(provider);let reads=0
  provider.invoice=async id=> {
    const current=await original(id);reads++
    return reads===1 ? {...current,status:'open',amount_paid:0,amount_remaining:13990} : current
  }
  await processBillingEvent(event(invoice,'invoice.payment_failed'),provider)
  assert.equal((await status()).invoiceStatus,'paid');assert.equal((await status()).paidAccess,true)
})
