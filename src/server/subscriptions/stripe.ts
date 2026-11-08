import 'server-only'
import Stripe from 'stripe'
import { defaultSelection, planAmount, type PlanSelection } from '@/modules/subscriptions/plan'
import { config } from '../config'

export class BillingUnavailable extends Error {}
export class BillingConflict extends Error {}
export function stripeSettings(selection: PlanSelection = defaultSelection) {
  const key = process.env.STRIPE_SECRET_KEY
  const suffix = `${selection.plan.toUpperCase()}_${selection.interval === 'year' ? 'ANNUAL' : 'MONTHLY'}`
  const priceId = (selection.plan === 'pro' && selection.interval === 'month' ? process.env.STRIPE_PRICE_ID : undefined) || process.env[`STRIPE_PRICE_${suffix}`]
  const productId = (selection.plan === 'pro' ? process.env.STRIPE_PRODUCT_ID : undefined) || process.env[`STRIPE_PRODUCT_${selection.plan.toUpperCase()}`]
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  // This delivery is LOCAL TEST ONLY; no escape hatch for live keys/remote origins.
  const origin = config().appUrl
  const host = new URL(origin).hostname
  if (!key?.startsWith('sk_test_') || !priceId?.startsWith('price_') || !productId?.startsWith('prod_') || !webhookSecret?.startsWith('whsec_') || !['localhost', '127.0.0.1', '[::1]'].includes(host)) throw new BillingUnavailable()
  return { key, priceId, productId, webhookSecret, origin }
}
export function billingConfigured(selection: PlanSelection = defaultSelection) {
  try { stripeSettings(selection); return true } catch { return false }
}
export function stripeClient() {
  return new Stripe(stripeSettings().key, { timeout: 10000, maxNetworkRetries: 1 })
}
export function checkoutUrl(value: string | null) {
  if (!value) throw new BillingUnavailable()
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password || url.port) throw new BillingUnavailable()
  return value
}
// Minimal server-side boundary; real implementation uses official Stripe SDK.
// Tests supply an in-memory provider ONLY to service tests, never via runtime env or routes.
export interface BillingGateway {
  price(id: string): Promise<Stripe.Price>
  customer(accountId: string, email: string): Promise<Stripe.Customer>
  createCheckout(input: Stripe.Checkout.SessionCreateParams, key: string): Promise<Stripe.Checkout.Session>
  checkout(id: string): Promise<Stripe.Checkout.Session>
  subscription(id: string): Promise<Stripe.Subscription>
  invoice(id: string): Promise<Stripe.Invoice>
  upcoming(customer: string, subscription: string): Promise<Stripe.Invoice>
  cancel(subscription: string, target: number, key: string): Promise<Stripe.Subscription>
  portalConfiguration(id: string): Promise<Stripe.BillingPortal.Configuration>
  portal(input: Stripe.BillingPortal.SessionCreateParams): Promise<Stripe.BillingPortal.Session>
}
export function stripeGateway(): BillingGateway {
  const stripe = stripeClient()
  return {
    price: id => stripe.prices.retrieve(id, { expand: ['product'] }),
    customer: (id, email) => stripe.customers.create({ email, metadata: { formfisik_account_id: id } }, { idempotencyKey: `ff_customer_${id}` }),
    createCheckout: (input, key) => stripe.checkout.sessions.create(input, { idempotencyKey: `ff_checkout_${key}` }),
    checkout: id => stripe.checkout.sessions.retrieve(id),
    subscription: id => stripe.subscriptions.retrieve(id, { expand: ['default_payment_method', 'items.data.price.product'] }),
    invoice: id => stripe.invoices.retrieve(id,{ expand:['payments.data.payment.payment_intent'] }),
    upcoming: (customer, subscription) => stripe.invoices.createPreview({ customer, subscription }),
    cancel: (id, target, key) => stripe.subscriptions.update(id, { cancel_at: target, proration_behavior: 'none' }, { idempotencyKey: `ff_cancel_${key}` }),
    portalConfiguration: id => stripe.billingPortal.configurations.retrieve(id),
    portal: input => stripe.billingPortal.sessions.create(input),
  }
}
export function assertPrice(price: Stripe.Price, expectedId: string, productId: string, requireActive = true, selection: PlanSelection = defaultSelection) {
  const product = price.product
  if (price.livemode || (requireActive && !price.active) || price.id !== expectedId || price.currency !== 'brl' || price.unit_amount !== planAmount(selection) || price.type !== 'recurring' || price.recurring?.interval !== selection.interval || price.recurring.interval_count !== 1 || price.recurring.usage_type !== 'licensed' || typeof product === 'string' || product.deleted || product.id !== productId || (requireActive && !product.active) || product.livemode) throw new BillingUnavailable()
}

export function portalConfigurationId() {
  const id = process.env.STRIPE_PORTAL_CONFIGURATION_ID
  return id?.startsWith('bpc_') ? id : null
}
export function portalUrl(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.hostname !== 'billing.stripe.com' || url.username || url.password || url.port) throw new BillingUnavailable()
  return value
}

export function validPortalConfiguration(config: Stripe.BillingPortal.Configuration, id: string) {
  return !config.livemode && config.active && config.id === id && !config.features.subscription_cancel.enabled && !config.features.subscription_update.enabled && config.features.invoice_history.enabled && config.features.payment_method_update.enabled
}
