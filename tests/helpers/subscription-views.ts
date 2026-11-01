// Browser fixtures ONLY. Never imported by application code or enabled by an environment flag.
import type { SubscriptionState, SubscriptionView } from '../../src/modules/subscriptions/status'
export function subscriptionFixture(state: SubscriptionState, now: number): SubscriptionView {
  const day = 86400000
  const at = (offset: number) => new Date(now + offset * day).toISOString()
  const view: SubscriptionView = {
    state, paidAccess: false, financialStatus: null, invoiceStatus: null, paymentIssue: null,
    trialStart: null, trialEnd: null, trialUsed: false, startedAt: null, periodStart: null, periodEnd: null,
    cancelAt: null, canceledAt: null, endedAt: null, accessUntil: null, nextBillingAt: null, nextBillingAmount: null,
    cancellationPending: false, syncState: state === 'unavailable' ? 'unavailable' : 'ok', verifiedAt: new Date(now).toISOString(),
    actions: { cancel: false, portal: false, paymentMethod: false, payments: false, regularize: false }, invoices: [],
  }
  if (['none', 'unavailable', 'checkout_pending'].includes(state)) return view
  Object.assign(view, {
    financialStatus: 'active', trialStart: at(-60), trialEnd: at(-30), trialUsed: true, startedAt: at(-60),
    periodStart: at(-10), periodEnd: at(20), nextBillingAt: at(20), nextBillingAmount: 13990, invoiceStatus: 'paid',
    actions: { cancel: true, portal: true, paymentMethod: true, payments: true, regularize: false },
    invoices: [{ status: 'paid', amountDue: 13990, amountPaid: 13990, createdAt: at(-10), attempts: 1 }],
  })
  if (['active', 'cancel_scheduled'].includes(state)) { view.paidAccess = true; view.accessUntil = at(20) }
  if (state === 'trialing') Object.assign(view, {
    financialStatus: 'trialing', paidAccess: true, startedAt: at(-9), trialStart: at(-9), trialEnd: at(21),
    periodStart: at(-9), periodEnd: at(21), accessUntil: at(21), nextBillingAt: at(21), invoices: [],
  })
  if (state === 'cancel_scheduled') { view.cancelAt = at(20); view.nextBillingAt = null; view.nextBillingAmount = null; view.actions.cancel = false }
  if (['payment_pending', 'payment_failed', 'past_due'].includes(state)) {
    view.financialStatus = state === 'payment_pending' ? 'incomplete' : 'past_due'
    view.invoiceStatus = 'open'; view.nextBillingAt = null; view.nextBillingAmount = null
    view.paymentIssue = state === 'payment_pending' ? null : 'failed'
    view.actions.regularize = true; view.actions.cancel = state !== 'payment_pending'
    view.invoices = [{ status: 'open', amountDue: 13990, amountPaid: 0, createdAt: at(-1), attempts: state === 'payment_pending' ? 0 : 2 }]
  }
  if (state === 'expired') Object.assign(view, {
    financialStatus: 'trialing', trialStart: at(-31), trialEnd: at(-1), periodStart: at(-31), periodEnd: at(-1),
    nextBillingAt: null, nextBillingAmount: null, invoices: [], actions: { ...view.actions, cancel: false },
  })
  if (state === 'canceled') Object.assign(view, {
    financialStatus: 'canceled', cancelAt: at(-3), endedAt: at(-3), canceledAt: at(-23), periodEnd: at(-3),
    nextBillingAt: null, nextBillingAmount: null, actions: { ...view.actions, cancel: false, paymentMethod: false },
  })
  if (state === 'paused') { view.financialStatus = 'paused'; view.actions.cancel = false; view.nextBillingAt = null; view.nextBillingAmount = null }
  if (state === 'blocked') { view.nextBillingAt = null; view.nextBillingAmount = null }
  return view
}
