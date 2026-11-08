import 'server-only'
import { randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import type Stripe from 'stripe'
import { db } from '../db'
import { proPlan, defaultSelection, planAmount, type PlanSelection } from '../../modules/subscriptions/plan'
import { locked, transaction, type Account, type Attempt } from './store'
import { loadSnapshot, persistSnapshot, externalId, invoiceSubscription } from './lifecycle'
import { assertPrice, BillingConflict, BillingUnavailable, checkoutUrl, type BillingGateway, stripeGateway, stripeSettings } from './stripe'

function assertSession(session: Stripe.Checkout.Session, account: Account, attempt: Attempt) {
  if (session.livemode || !session.id.startsWith('cs_test_') || session.customer !== account.stripe_customer_id || session.mode !== 'subscription' || session.metadata?.formfisik_account_id !== account.id || session.metadata?.formfisik_checkout_id !== attempt.id || session.client_reference_id !== account.id || (attempt.stripe_session_id && session.id !== attempt.stripe_session_id)) throw new BillingUnavailable()
}
async function applySession(client: PoolClient, account: Account, attempt: Attempt, session: Stripe.Checkout.Session, gateway: BillingGateway, event?: Stripe.Event, invoice?: Stripe.Invoice) {
  assertSession(session, account, attempt)
  const snapshot = session.status === 'complete' && typeof session.subscription === 'string'
    ? await loadSnapshot(account, attempt, await gateway.subscription(session.subscription), gateway, invoice) : null
  if (session.status === 'complete' && (!snapshot || !['paid','no_payment_required'].includes(session.payment_status))) throw new BillingUnavailable()
  await transaction(client, async () => {
    if (snapshot) {
      await persistSnapshot(client, account, attempt, snapshot)
      await client.query("UPDATE billing_checkouts SET state='confirmed',stripe_session_id=$2 WHERE id=$1", [attempt.id, session.id])
    } else if (session.status === 'expired' && attempt.state !== 'confirmed') {
      await client.query("UPDATE billing_checkouts SET state='expired',stripe_session_id=$2 WHERE id=$1", [attempt.id, session.id])
    }
    if (event) await client.query("INSERT INTO billing_events(stripe_event_id,event_type,provider_created_at,outcome) VALUES($1,$2,to_timestamp($3),'processed')", [event.id,event.type,event.created])
    await client.query("UPDATE billing_accounts SET sync_state='ok',last_sync_attempt_at=clock_timestamp() WHERE id=$1", [account.id])
  })
}
export async function startCheckout(userId: string, gateway: BillingGateway = stripeGateway(), selection: PlanSelection = defaultSelection) {
  const settings = stripeSettings(selection)
  return locked(userId, async client => {
    // Recheck role/email under the same lock before any external work.
    const user = await client.query("SELECT email FROM users WHERE id=$1 AND role='professional' AND email_verified_at IS NOT NULL AND disabled_at IS NULL", [userId])
    if (!user.rowCount) throw new BillingConflict()
    await client.query('INSERT INTO billing_accounts(id,user_id) VALUES($1,$2) ON CONFLICT(user_id) DO NOTHING', [randomUUID(), userId])
    const account: Account = (await client.query('SELECT * FROM billing_accounts WHERE user_id=$1', [userId])).rows[0]
    if (account.trial_used_at) throw new BillingConflict()
    const pending = await client.query("SELECT * FROM billing_checkouts WHERE account_id=$1 AND state IN ('creating','open')", [account.id])
    let attempt: Attempt | undefined = pending.rows[0]
    if (attempt?.stripe_session_id) {
      const session = await gateway.checkout(attempt.stripe_session_id)
      assertSession(session, account, attempt)
      if (session.status === 'open') { if (attempt.plan_id !== selection.plan || attempt.billing_interval !== selection.interval) throw new BillingConflict(); return { url: checkoutUrl(session.url) } }
      await applySession(client, account, attempt!, session, gateway)
      if (session.status === 'complete') throw new BillingConflict()
      attempt = undefined
    }
    // An uncertain operation must never get a fresh key after Stripe's retention window.
    if (!account.stripe_customer_id) {
      if (Date.now() - account.created_at.getTime() > 23 * 3600000) throw new BillingConflict()
      const customer = await gateway.customer(account.id, user.rows[0].email)
      if (customer.livemode || customer.metadata.formfisik_account_id !== account.id) throw new BillingUnavailable()
      await client.query('UPDATE billing_accounts SET stripe_customer_id=$2 WHERE id=$1', [account.id, customer.id])
      account.stripe_customer_id = customer.id
    }
    if (!attempt) {
      // Verify configured TEST price/product, never take amount/trial/customer from browser.
      assertPrice(await gateway.price(settings.priceId), settings.priceId, settings.productId, true, selection)
      attempt = (await client.query(`INSERT INTO billing_checkouts(id,account_id,price_id,product_id,app_origin,expires_at,plan_id,billing_interval,amount)
        VALUES($1,$2,$3,$4,$5,to_timestamp($6),$7,$8,$9) RETURNING *`, [randomUUID(), account.id, settings.priceId, settings.productId, settings.origin, Math.floor(Date.now()/1000)+2100,selection.plan,selection.interval,planAmount(selection)])).rows[0] as Attempt
    }
    if (attempt.plan_id !== selection.plan || attempt.billing_interval !== selection.interval) throw new BillingConflict()
    if (attempt.expires_at.getTime() <= Date.now()) throw new BillingConflict()
    const input: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription', customer: account.stripe_customer_id!, client_reference_id: account.id,
      line_items: [{ price: attempt.price_id, quantity: 1 }], allowed_payment_method_types: ['card'], payment_method_collection: 'always',
      subscription_data: { trial_period_days: proPlan.trialDays, metadata: { formfisik_account_id: account.id, formfisik_checkout_id: attempt.id } },
      metadata: { formfisik_account_id: account.id, formfisik_checkout_id: attempt.id },
      success_url: `${attempt.app_origin}/assinatura/retorno`, cancel_url: `${attempt.app_origin}/assinatura?checkout=cancelado`,
      expires_at: Math.floor(attempt.expires_at.getTime()/1000),
    }
    const session = await gateway.createCheckout(input, attempt.id)
    assertSession(session, account, attempt)
    if (session.status !== 'open') throw new BillingUnavailable()
    await client.query("UPDATE billing_checkouts SET stripe_session_id=$2,state='open' WHERE id=$1", [attempt.id, session.id])
    return { url: checkoutUrl(session.url) }
  })
}
export async function syncAccount(client: PoolClient, account: Account, gateway: BillingGateway, event?: Stripe.Event, eventInvoice?: Stripe.Invoice) {
  const stored = await client.query('SELECT s.stripe_subscription_id,c.* FROM billing_subscriptions s JOIN billing_checkouts c ON c.id=s.checkout_id WHERE s.account_id=$1', [account.id])
  const attempt: Attempt | undefined = stored.rows[0] ?? (await client.query('SELECT * FROM billing_checkouts WHERE account_id=$1 ORDER BY created_at DESC LIMIT 1', [account.id])).rows[0]
  if (!attempt) {
    if (event) await client.query("INSERT INTO billing_events(stripe_event_id,event_type,provider_created_at,outcome) VALUES($1,$2,to_timestamp($3),'ignored')",[event.id,event.type,event.created])
    return
  }
  if (stored.rowCount) {
    const sub = await gateway.subscription(stored.rows[0].stripe_subscription_id)
    const snapshot = await loadSnapshot(account, attempt, sub, gateway, eventInvoice)
    await transaction(client, async () => {
      await persistSnapshot(client, account, attempt, snapshot)
      await client.query("UPDATE billing_accounts SET sync_state='ok',last_sync_attempt_at=clock_timestamp() WHERE id=$1", [account.id])
      if (event) await client.query("INSERT INTO billing_events(stripe_event_id,event_type,provider_created_at,outcome) VALUES($1,$2,to_timestamp($3),'processed')", [event.id,event.type,event.created])
    })
  } else {
    const id = event?.type.startsWith('checkout.') ? (event.data.object as { id: string }).id : attempt.stripe_session_id
    if (!id) { if (event) throw new BillingUnavailable(); return }
    await applySession(client, account, attempt, await gateway.checkout(id), gateway, event, eventInvoice)
  }
}
export async function syncFailed(client: PoolClient, accountId: string) {
  await client.query("UPDATE billing_accounts SET sync_state='error',last_sync_attempt_at=clock_timestamp() WHERE id=$1", [accountId])
}
// Browser supplies no external ID. Existing subscriptions no longer depend on old Checkout retrieval.
export async function reconcileUser(userId: string, gateway: BillingGateway = stripeGateway()) {
  return locked(userId, async client => {
    const account: Account | undefined = (await client.query('SELECT * FROM billing_accounts WHERE user_id=$1', [userId])).rows[0]
    if (!account) return
    try { await syncAccount(client, account, gateway) }
    catch (error) { await syncFailed(client, account.id); throw error }
  })
}
export async function processBillingEvent(event: Stripe.Event, gateway: BillingGateway = stripeGateway()) {
  if (event.livemode || event.account) throw new BillingUnavailable() // No Connect accounts in this product.
  const supported = ['checkout.session.completed','checkout.session.expired','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','customer.subscription.trial_will_end','customer.subscription.paused','customer.subscription.resumed','invoice.paid','invoice.payment_failed','invoice.payment_action_required','invoice.updated','invoice.finalized','invoice.voided','invoice.marked_uncollectible','customer.updated','payment_method.updated','payment_method.attached','payment_method.detached']
  const ignored = () => db().query("INSERT INTO billing_events(stripe_event_id,event_type,provider_created_at,outcome) VALUES($1,$2,to_timestamp($3),'ignored') ON CONFLICT DO NOTHING", [event.id,event.type,event.created])
  if (!supported.includes(event.type)) { await ignored(); return }
  const object = event.data.object as Stripe.Subscription | Stripe.Checkout.Session | Stripe.Invoice | Stripe.Customer | Stripe.PaymentMethod
  let customer: string | undefined
  let invoice: Stripe.Invoice | undefined
  if (event.type.startsWith('invoice.')) {
    invoice = await gateway.invoice(object.id)
    customer = externalId(invoice.customer)
  } else if (event.type === 'customer.updated') customer = object.id
  else customer = externalId((object as Stripe.Subscription | Stripe.PaymentMethod).customer)
  // Detached methods can have null customer. Customer/subscription webhooks + periodic canonical sync recover them.
  if (!customer || (invoice && !invoiceSubscription(invoice))) { await ignored(); return }
  const found = await db().query('SELECT * FROM billing_accounts WHERE stripe_customer_id=$1', [customer])
  if (!found.rowCount) { await ignored(); return }
  const account: Account = found.rows[0]
  await locked(account.user_id, async client => {
    if ((await client.query('SELECT 1 FROM billing_events WHERE stripe_event_id=$1', [event.id])).rowCount) return
    try {
      const stored = await client.query('SELECT stripe_subscription_id FROM billing_subscriptions WHERE account_id=$1', [account.id])
      const eventSub = invoice ? invoiceSubscription(invoice) : event.type.startsWith('customer.subscription.') ? object.id : null
      if (eventSub && stored.rowCount && eventSub !== stored.rows[0].stripe_subscription_id) throw new BillingUnavailable()
      const currentInvoice = invoice ? await gateway.invoice(invoice.id) : undefined
      await syncAccount(client, account, gateway, event, currentInvoice)
    } catch (error) { await syncFailed(client, account.id); throw error }
  })
}
