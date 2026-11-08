import 'server-only'
import type Stripe from 'stripe'
import type { PoolClient } from 'pg'
import { assertPrice, BillingUnavailable, BillingConflict, type BillingGateway } from './stripe'
import type { Account, Attempt } from './store'
import { proPlan, subscriptionPlans, type PlanSelection } from '../../modules/subscriptions/plan'

export const externalId = (value: string | { id: string } | null | undefined) => typeof value === 'string' ? value : value?.id
export function invoiceSubscription(invoice: Stripe.Invoice) { return externalId(invoice.parent?.subscription_details?.subscription) }
function assertInvoice(invoice: Stripe.Invoice, account: Account, sub: Stripe.Subscription) {
  if (invoice.livemode || externalId(invoice.customer) !== account.stripe_customer_id || invoiceSubscription(invoice) !== sub.id || invoice.currency !== 'brl') throw new BillingUnavailable()
}
export async function loadSnapshot(account: Account, attempt: Attempt, sub: Stripe.Subscription, gateway: BillingGateway, eventInvoice?: Stripe.Invoice) {
  const item = sub.items.data[0]
  const selection: PlanSelection = { plan: attempt.plan_id, interval: attempt.billing_interval }
  if (sub.livemode || sub.customer !== account.stripe_customer_id || sub.metadata.formfisik_account_id !== account.id || sub.metadata.formfisik_checkout_id !== attempt.id || sub.items.data.length !== 1 || item.quantity !== 1 || !sub.trial_start || !sub.trial_end || sub.trial_end-sub.trial_start !== proPlan.trialDays*86400 || !item.current_period_start || !item.current_period_end || item.current_period_end <= item.current_period_start || !sub.start_date || sub.collection_method !== 'charge_automatically') throw new BillingUnavailable()
  // Archiving a price must not revoke an already contracted subscription.
  assertPrice(item.price, attempt.price_id, attempt.product_id, false, selection)
  const invoiceId = externalId(sub.latest_invoice)
  const invoice = invoiceId ? await gateway.invoice(invoiceId) : null
  if (invoice) assertInvoice(invoice, account, sub)
  if (eventInvoice) assertInvoice(eventInvoice, account, sub)
  const paidLine = invoice?.status === 'paid' && invoice.amount_remaining === 0 && !invoice.lines.has_more && invoice.lines.data.find(line =>
    externalId(line.pricing?.price_details?.price) === attempt.price_id && line.amount >= attempt.amount && line.period.start <= item.current_period_start && line.period.end >= item.current_period_end)
  let upcoming: number | null = null
  if (['trialing','active'].includes(sub.status) && !sub.cancel_at && !sub.cancel_at_period_end && !sub.pause_collection) {
    try {
      const preview = await gateway.upcoming(account.stripe_customer_id!, sub.id)
      assertInvoice(preview, account, sub)
      if (Number.isSafeInteger(preview.amount_due) && preview.amount_due >= 0) upcoming = preview.amount_due
    } catch { console.error('billing_preview_unavailable') } // Optional estimate never controls entitlement.
  }
  return { sub, invoice, eventInvoice, upcoming, paidThrough: paidLine ? item.current_period_end : null }
}
export type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>
export async function persistSnapshot(client: PoolClient, account: Account, attempt: Attempt, snapshot: Snapshot) {
  const { sub, invoice, eventInvoice, upcoming, paidThrough } = snapshot
  const item = sub.items.data[0]
  const previous = await client.query('SELECT stripe_subscription_id FROM billing_subscriptions WHERE account_id=$1', [account.id])
  if (previous.rowCount && previous.rows[0].stripe_subscription_id !== sub.id) throw new BillingConflict()
  // A payment method is mandatory on INITIAL enrollment, not after a later card removal.
  if (!previous.rowCount && !sub.default_payment_method) throw new BillingUnavailable()
  await client.query(`INSERT INTO billing_subscriptions(account_id,checkout_id,stripe_subscription_id,provider_status,trial_start,trial_end,price_id,product_id,currency,monthly_amount,plan_id,billing_interval,amount)
    VALUES($1,$2,$3,$4,to_timestamp($5),to_timestamp($6),$7,$8,'brl',$9,$10,$11,$12)
    ON CONFLICT(account_id) DO UPDATE SET provider_status=EXCLUDED.provider_status,trial_start=EXCLUDED.trial_start,trial_end=EXCLUDED.trial_end,verified_at=clock_timestamp()`,
    [account.id,attempt.id,sub.id,sub.status,sub.trial_start,sub.trial_end,attempt.price_id,attempt.product_id,subscriptionPlans[attempt.plan_id].monthlyPriceCents,attempt.plan_id,attempt.billing_interval,attempt.amount])
  await client.query(`UPDATE billing_subscriptions SET started_at=to_timestamp($2),period_start=to_timestamp($3),period_end=to_timestamp($4),cancel_at_period_end=$5,cancel_at=to_timestamp($6),canceled_at=to_timestamp($7),ended_at=to_timestamp($8),collection_paused=$9,latest_invoice_id=$10,paid_through=to_timestamp($11),upcoming_amount=$12 WHERE account_id=$1`,
    [account.id,sub.start_date,item.current_period_start,item.current_period_end,sub.cancel_at_period_end,sub.cancel_at,sub.canceled_at,sub.ended_at,!!sub.pause_collection,invoice?.id ?? null,paidThrough,upcoming])
  for (const inv of [invoice,eventInvoice?.id === invoice?.id ? null : eventInvoice]) {
    if (!inv) continue
    const requiresAction = inv.payments?.data.some(payment => {
      const intent = payment.payment.payment_intent
      return typeof intent === 'object' && intent.status === 'requires_action'
    })
    const issue = inv.status === 'open' ? (requiresAction ? 'action_required' : inv.attempt_count > 0 ? 'failed' : null) : null
    await client.query(`INSERT INTO billing_invoices(stripe_invoice_id,account_id,stripe_subscription_id,status,currency,amount_due,amount_paid,attempt_count,payment_issue,next_payment_attempt,created_at)
      VALUES($1,$2,$3,$4,'brl',$5,$6,$7,$8,to_timestamp($9),to_timestamp($10))
      ON CONFLICT(stripe_invoice_id) DO UPDATE SET status=EXCLUDED.status,amount_due=EXCLUDED.amount_due,amount_paid=EXCLUDED.amount_paid,attempt_count=EXCLUDED.attempt_count,
      payment_issue=EXCLUDED.payment_issue,
      next_payment_attempt=EXCLUDED.next_payment_attempt,verified_at=clock_timestamp()`,
      [inv.id,account.id,sub.id,inv.status ?? 'draft',inv.amount_due,inv.amount_paid,inv.attempt_count,issue,inv.next_payment_attempt,inv.created])
  }
  await client.query("UPDATE billing_cancellations SET state='confirmed',confirmed_at=COALESCE(confirmed_at,clock_timestamp()) WHERE account_id=$1 AND (target_at=to_timestamp($2) OR $3='canceled')",[account.id,sub.cancel_at,sub.status])
  await client.query('UPDATE billing_accounts SET trial_used_at=COALESCE(trial_used_at,to_timestamp($2)) WHERE id=$1', [account.id,sub.trial_start])
}
