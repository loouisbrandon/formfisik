// CONTROLLED PROVIDER FIXTURES, NOT live Stripe validation or a hosted Checkout simulation.
import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import Stripe from 'stripe'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { createSession } from '../src/server/sessions'
import { limit } from '../src/server/http'
import { startCheckout, processBillingEvent, reconcileUser } from '../src/server/subscriptions/service'
import { stripeSettings, assertPrice, BillingConflict, BillingUnavailable } from '../src/server/subscriptions/stripe'
import { checkout, billingStatus, createStripeWebhookHandler } from '../src/server/subscriptions/handlers'
import { subscriptionStatus } from '../src/server/subscriptions/status'
import { accessFor } from '../src/server/access'
const connection = process.env.TEST_DATABASE_URL
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw new Error('Isolated _test database required')
Object.assign(process.env, { DATABASE_URL: connection, APP_URL: 'http://localhost:3107', ABUSE_HMAC_SECRET: randomBytes(32).toString('hex'), STRIPE_SECRET_KEY: 'sk_test_controlled_fixture_not_a_real_key', STRIPE_PRICE_ID: 'price_fixture', STRIPE_PRODUCT_ID: 'prod_fixture', STRIPE_WEBHOOK_SECRET: 'whsec_controlled_fixture_not_a_real_secret' })
import { ControlledGateway, fixture } from './helpers/controlled-billing'
let userId = ''
let provider: ControlledGateway
function request(path: string, data?: unknown, cookie?: string, origin = process.env.APP_URL!) {
  return new Request(process.env.APP_URL + path, { method: data === undefined ? 'GET' : 'POST', headers: { ...(data === undefined ? {} : { 'content-type': 'application/json', origin }), ...(cookie ? { cookie } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) })
}
function event(session: Stripe.Checkout.Session, id = 'evt_' + randomUUID(), type = 'checkout.session.completed', created = Math.floor(Date.now()/1000)) {
  return fixture<Stripe.Event>({ id, type, livemode: false, created, object: 'event', data: { object: session } })
}
before(async () => { await migrate(connection); await migrate(connection) })
beforeEach(async () => {
  provider = new ControlledGateway(); userId = randomUUID()
  await db().query('TRUNCATE billing_events,users CASCADE')
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Stripe Fixture','professional',now())", [userId, `${userId}@example.test`])
})
after(async () => { await db().end() })

test('test-only configuration rejects live keys and remote origins without contacting Stripe', () => {
  const key = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'sk_live_rejected_fixture'
  assert.throws(stripeSettings, BillingUnavailable)
  process.env.STRIPE_SECRET_KEY = key
  const url = process.env.APP_URL
  process.env.APP_URL = 'https://remote.example'
  assert.throws(stripeSettings, BillingUnavailable)
  process.env.APP_URL = url
})
test('authenticated checkout request rejects no session, unconfirmed and price/user tampering', async () => {
  assert.equal((await checkout(request('/api/subscriptions/checkout', {}))).status, 401)
  const session = await createSession(userId)
  const cookie = `formfisik-session=${session.token}`
  assert.equal((await checkout(request('/api/subscriptions/checkout', { price: 1, userId }, cookie))).status, 400)
  assert.equal((await checkout(request('/api/subscriptions/checkout', {}, cookie, 'https://evil.test'))).status, 403)
  await db().query('UPDATE users SET email_verified_at=NULL WHERE id=$1', [userId])
  assert.equal((await checkout(request('/api/subscriptions/checkout', {}, cookie))).status, 401)
})
test('checkout parameters fix monthly BRL 13990, card required, trial 30 days and bound user; concurrent calls reuse one session', async () => {
  const urls = await Promise.all([startCheckout(userId, provider), startCheckout(userId, provider)])
  assert.deepEqual(urls[0], urls[1])
  assert.equal(provider.customers, 1)
  assert.equal(provider.sessions.size, 1)
  const { input } = provider.createCalls[0]
  assert.equal(input.mode, 'subscription')
  assert.deepEqual(input.allowed_payment_method_types, ['card'])
  assert.equal(input.payment_method_collection, 'always')
  assert.equal(input.subscription_data?.trial_period_days, 30)
  assert.deepEqual(input.line_items, [{ price: 'price_fixture', quantity: 1 }])
  assert.equal(input.success_url, 'http://localhost:3107/assinatura/retorno')
  assert.equal((await db().query('SELECT * FROM billing_checkouts')).rowCount, 1)
  assert.equal((await subscriptionStatus(userId)).paidAccess, false)
})
test('provider timeout AFTER creation retains durable key and recovers without second session', async () => {
  provider.failAfterCreate = true
  await assert.rejects(() => startCheckout(userId, provider))
  const pending = (await db().query('SELECT * FROM billing_checkouts')).rows[0]
  assert.equal(pending.state, 'creating')
  await startCheckout(userId, provider)
  assert.equal(provider.sessions.size, 1)
  assert.equal(provider.createCalls[0].key, provider.createCalls[1].key)
  assert.deepEqual(provider.createCalls[0].input, provider.createCalls[1].input)
})
test('expired known session may be replaced; uncertain expired intent cannot blindly generate another', async () => {
  await startCheckout(userId, provider)
  ;[...provider.sessions.values()][0].status = 'expired'
  await startCheckout(userId, provider)
  assert.equal(provider.sessions.size, 2)
  await db().query("UPDATE billing_checkouts SET state='creating',stripe_session_id=NULL,created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' WHERE state='open'")
  await assert.rejects(() => startCheckout(userId, provider), BillingConflict)
})
test('configured price mismatch or live data cannot create eligible trial', async () => {
  provider.fixturePrice.unit_amount = 100
  await assert.rejects(() => startCheckout(userId, provider), BillingUnavailable)
  assert.equal(provider.sessions.size, 0)
  provider.fixturePrice.unit_amount = 13990
  provider.fixturePrice.livemode = true
  assert.throws(() => assertPrice(provider.fixturePrice, 'price_fixture', 'prod_fixture'), BillingUnavailable)
})
test('canonical completed checkout persists trial and sticky eligibility; duplicate events have one effect', async () => {
  await startCheckout(userId, provider)
  const { session } = provider.complete()
  const completion = event(session)
  await Promise.all([processBillingEvent(completion, provider), processBillingEvent(completion, provider)])
  assert.equal((await db().query('SELECT * FROM billing_events')).rowCount, 1)
  const sub = (await db().query('SELECT * FROM billing_subscriptions')).rows[0]
  assert.equal(sub.monthly_amount, 13990)
  assert.equal(sub.currency, 'brl')
  assert.equal((sub.trial_end-sub.trial_start)/1000, 2592000)
  const access = await accessFor({ id: userId, role: 'professional' })
  assert.equal(access.paidAccess, true)
  assert.equal((await subscriptionStatus(userId)).state, 'trialing')
  await assert.rejects(() => startCheckout(userId, provider), BillingConflict)
})
test('out-of-order signed events re-read current provider state and cannot resurrect canceled trial', async () => {
  await startCheckout(userId, provider)
  const { session, sub } = provider.complete()
  await processBillingEvent(event(session), provider)
  sub.status = 'canceled'
  await processBillingEvent(event(session, 'evt_newer', 'checkout.session.completed'), provider)
  await processBillingEvent(event(session, 'evt_older', 'checkout.session.completed', Math.floor(Date.now()/1000)-86400), provider)
  assert.equal((await subscriptionStatus(userId)).paidAccess, false)
  assert.equal((await db().query('SELECT provider_status FROM billing_subscriptions')).rows[0].provider_status, 'canceled')
  assert.ok((await db().query('SELECT trial_used_at FROM billing_accounts')).rows[0].trial_used_at)
  await assert.rejects(() => startCheckout(userId, provider), BillingConflict)
})
test('webhook signature verified by official SDK on raw body; duplicates, tampering and live events rejected', async () => {
  await startCheckout(userId, provider)
  const { session } = provider.complete()
  const payload = JSON.stringify(event(session))
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET! })
  const handler = createStripeWebhookHandler(provider)
  const make = (body: string, header = signature) => new Request(process.env.APP_URL + '/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': header }, body })
  assert.equal((await handler(make(payload))).status, 200)
  assert.equal((await handler(make(payload))).status, 200)
  assert.equal((await handler(make(payload+' '))).status, 400)
  assert.equal((await handler(make(payload, 'invalid'))).status, 400)
  const live = JSON.stringify({ ...event(session), livemode: true })
  const liveSignature = stripe.webhooks.generateTestHeaderString({ payload: live, secret: process.env.STRIPE_WEBHOOK_SECRET! })
  assert.equal((await handler(make(live, liveSignature))).status, 400)
})
test('wrong association, card missing or wrong price never activate subscription', async () => {
  await startCheckout(userId, provider)
  const { session, sub } = provider.complete()
  const original = sub.customer
  sub.customer = 'cus_other_user'
  await assert.rejects(() => processBillingEvent(event(session), provider), BillingUnavailable)
  sub.customer = original; sub.default_payment_method = null
  await assert.rejects(() => processBillingEvent(event(session), provider), BillingUnavailable)
  assert.equal((await db().query('SELECT * FROM billing_subscriptions')).rowCount, 0)
})
test('return params cannot grant access or select another user; reconciliation only follows stored session', async () => {
  const session = await createSession(userId)
  const response = await billingStatus(request('/api/subscriptions/status?success=1&session_id=cs_test_other', undefined, `formfisik-session=${session.token}`))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).paidAccess, false)
  await startCheckout(userId, provider)
  provider.complete()
  await reconcileUser(userId, provider)
  assert.equal((await subscriptionStatus(userId)).paidAccess, true)
})
test('provider failure leaves trial unconfirmed and event retryable, no card or secrets persisted', async () => {
  await startCheckout(userId, provider)
  const { session } = provider.complete()
  provider.failReads = true
  await assert.rejects(() => processBillingEvent(event(session), provider))
  assert.equal((await db().query('SELECT * FROM billing_events')).rowCount, 0)
  assert.equal((await subscriptionStatus(userId)).paidAccess, false)
  const columns = await db().query("SELECT column_name FROM information_schema.columns WHERE table_name IN ('billing_accounts','billing_checkouts','billing_subscriptions','billing_events')")
  assert.ok(columns.rows.every(row => !/card_number|cvv|secret|payload/i.test(row.column_name)))
})
test('trial access expires independently of webhook delivery', async () => {
  await startCheckout(userId, provider)
  const { session } = provider.complete()
  await processBillingEvent(event(session), provider)
  await db().query("UPDATE billing_subscriptions SET trial_start=now()-interval '31 days',trial_end=now()-interval '1 day'")
  assert.equal((await subscriptionStatus(userId)).state, 'expired')
  assert.equal((await subscriptionStatus(userId)).paidAccess, false)
})

test('checkout and status refresh rate limits stop abusive calls before provider work', async () => {
  const session = await createSession(userId)
  const cookie = `formfisik-session=${session.token}`
  for (let i = 0; i < 10; i++) await limit(`checkout:user:${userId}`, 10, 60)
  assert.equal((await checkout(request('/api/subscriptions/checkout', {}, cookie))).status, 429)
  for (let i = 0; i < 30; i++) await limit(`billing-refresh:${userId}`, 30, 60)
  assert.equal((await billingStatus(request('/api/subscriptions/status?refresh=1', undefined, cookie))).status, 429)
  assert.equal(provider.sessions.size, 0)
  assert.equal((await db().query('SELECT * FROM billing_accounts')).rowCount, 0)
})
