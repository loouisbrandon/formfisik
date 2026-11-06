import 'server-only'
import { db } from '../db'
import { billingConfigured, portalConfigurationId, stripeGateway, validPortalConfiguration, type BillingGateway } from './stripe'
import { reconcileUser } from './service'
import type { SubscriptionState, SubscriptionView } from '../../modules/subscriptions/status'

export async function subscriptionStatus(userId: string, refresh = false, gateway?: BillingGateway, details = true): Promise<SubscriptionView> {
  const configured = billingConfigured()
  const query = () => db().query(`SELECT a.trial_used_at,a.sync_state,a.last_sync_attempt_at,s.*,i.status AS invoice_status,i.payment_issue,
    EXISTS(SELECT 1 FROM billing_checkouts c WHERE c.account_id=a.id AND c.state IN ('creating','open')) AS checkout_pending,
    EXISTS(SELECT 1 FROM billing_cancellations x WHERE x.account_id=a.id AND x.state='pending') AS cancellation_pending
    FROM billing_accounts a LEFT JOIN billing_subscriptions s ON s.account_id=a.id LEFT JOIN billing_invoices i ON i.stripe_invoice_id=s.latest_invoice_id WHERE a.user_id=$1`, [userId])
  let row = (await query()).rows[0]
  if (configured && (refresh || (row?.sync_state === 'error' ? !row.last_sync_attempt_at || Date.now()-row.last_sync_attempt_at.getTime()>60000 : row?.verified_at && Date.now()-row.verified_at.getTime()>300000))) {
    await reconcileUser(userId, gateway)
    row = (await query()).rows[0]
  }
  const now = Date.now()
  const iso = (date?: Date | null) => date?.toISOString() ?? null
  const future = (date?: Date | null) => !!date && date.getTime()>now
  const recent = !!row?.verified_at && now-row.verified_at.getTime()<=300000 && row.sync_state === 'ok'
  const trial = row?.provider_status === 'trialing' && future(row.trial_end) && row.trial_start?.getTime()<=now
  const paid = row?.provider_status === 'active' && future(row.period_end) && row.period_start?.getTime()<=now && future(row.paid_through) && row.invoice_status === 'paid'
  const scheduled = !!row?.cancel_at || !!row?.cancel_at_period_end
  const cancelAt: Date | null = row?.cancel_at ?? (row?.cancel_at_period_end ? (trial ? row?.trial_end : row?.period_end) : null) ?? null
  const paidAccess = !!(configured && recent && (trial || paid) && !row.collection_paused && !row.ended_at && (!cancelAt || future(cancelAt)))
  let state: SubscriptionState = !row?.provider_status ? (row?.checkout_pending ? 'checkout_pending' : 'none') : 'blocked'
  if (row?.provider_status) {
    if (row.provider_status === 'canceled') state = 'canceled'
    else if (row.provider_status === 'incomplete_expired') state = 'expired'
    else if (row.provider_status === 'paused' || row.collection_paused) state = 'paused'
    else if (row.invoice_status === 'open') state = row.payment_issue ? 'payment_failed' : 'payment_pending'
    else if (['past_due','unpaid'].includes(row.provider_status)) state = 'past_due'
    else if (row.provider_status === 'incomplete') state = 'payment_pending'
    else if (trial || paid) state = scheduled ? 'cancel_scheduled' : trial ? 'trialing' : 'active'
    else if ((row.trial_end && !future(row.trial_end)) || (row.period_end && !future(row.period_end))) state = 'expired'
  }
  if (!configured || (row?.provider_status && !recent)) state = 'unavailable'
  const eligibleCancel = configured && recent && !scheduled && ['trialing','active','past_due','unpaid'].includes(row?.provider_status) && future(trial ? row?.trial_end : row?.period_end)
  let hasPortal = false
  const portalId = portalConfigurationId()
  if (details && configured && recent && row?.provider_status && portalId) {
    try { hasPortal = validPortalConfiguration(await (gateway ?? stripeGateway()).portalConfiguration(portalId),portalId) }
    catch { console.error('billing_portal_configuration_unavailable') }
  }
  const invoices = details && row?.account_id ? (await db().query('SELECT status,amount_due,amount_paid,created_at,attempt_count FROM billing_invoices WHERE account_id=$1 ORDER BY created_at DESC LIMIT 5', [row.account_id])).rows : []
  const boundary = trial ? row?.trial_end : row?.period_end
  const until = paidAccess ? new Date(Math.min(boundary.getTime(),cancelAt?.getTime() ?? Infinity,row.paid_through && !trial ? row.paid_through.getTime() : Infinity)) : null
  return {
    state,paidAccess,financialStatus: row?.provider_status ?? null,invoiceStatus: row?.invoice_status ?? null,paymentIssue: row?.payment_issue ?? null,
    trialStart: iso(row?.trial_start),trialEnd: iso(row?.trial_end),trialUsed: !!row?.trial_used_at,startedAt: iso(row?.started_at),periodStart: iso(row?.period_start),periodEnd: iso(row?.period_end),
    cancelAt: iso(cancelAt),canceledAt: iso(row?.canceled_at),endedAt: iso(row?.ended_at),accessUntil: iso(until),
    nextBillingAt: !scheduled && future(boundary) && ['trialing','active'].includes(row?.provider_status) ? iso(boundary) : null,
    nextBillingAmount: !scheduled ? row?.upcoming_amount ?? null : null,cancellationPending: !!row?.cancellation_pending,
    syncState: configured ? row?.sync_state ?? 'pending' : 'unavailable',verifiedAt: iso(row?.verified_at),
    actions: { cancel: !!eligibleCancel,portal: hasPortal,paymentMethod: hasPortal && !['canceled','incomplete_expired'].includes(row?.provider_status),payments: hasPortal,regularize: hasPortal && row?.invoice_status === 'open' },
    invoices: invoices.map(i => ({ status:i.status,amountDue:i.amount_due,amountPaid:i.amount_paid,createdAt:i.created_at.toISOString(),attempts:i.attempt_count })),
  }
}
