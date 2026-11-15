// Test-only provider. Never imported by application code.
import type Stripe from 'stripe'
import type { BillingGateway } from '../../src/server/subscriptions/stripe'
export const fixture = <T>(value: unknown) => value as T
export class ControlledGateway implements BillingGateway {
  customers = 0
  sessions = new Map<string, Stripe.Checkout.Session>()
  createCalls: { input: Stripe.Checkout.SessionCreateParams; key: string }[] = []
  subscriptions = new Map<string, Stripe.Subscription>()
  failAfterCreate = false
  failReads = false
  fixturePrice = fixture<Stripe.Price>({ id: 'price_fixture', livemode: false, active: true, currency: 'brl', unit_amount: 13990, type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, product: { id: 'prod_fixture', deleted: false, active: true, livemode: false } })
  async price() { return this.fixturePrice }
  async customer(accountId: string) { this.customers++; return fixture<Stripe.Customer>({ id: `cus_${accountId}`, livemode: false, metadata: { formfisik_account_id: accountId } }) }
  async createCheckout(input: Stripe.Checkout.SessionCreateParams, key: string) {
    this.createCalls.push({ input, key })
    if (!this.sessions.has(key)) this.sessions.set(key, fixture<Stripe.Checkout.Session>({ id: `cs_test_${key}`, livemode: false, status: 'open', mode: 'subscription', customer: input.customer, metadata: input.metadata, client_reference_id: input.client_reference_id, expires_at: input.expires_at, url: 'https://checkout.stripe.com/c/pay/controlled-fixture', subscription: null, payment_status: 'unpaid' }))
    if (this.failAfterCreate) { this.failAfterCreate = false; throw new Error('Controlled provider timeout after creation') }
    return this.sessions.get(key)!
  }
  async checkout(id: string) {
    if (this.failReads) throw new Error('Controlled provider outage')
    const session = [...this.sessions.values()].find(s => s.id === id)
    if (!session) throw new Error('Controlled unknown session')
    return session
  }
  async subscription(id: string) { if (this.failReads) throw new Error('Controlled outage'); const sub = this.subscriptions.get(id); if (!sub) throw new Error('Controlled missing sub'); return sub }
  complete() {
    const session = [...this.sessions.values()].at(-1)!
    const start = Math.floor(Date.now()/1000)
    const sub = fixture<Stripe.Subscription>({ id: `sub_${session.id}`, livemode: false, customer: session.customer, metadata: session.metadata, status: 'trialing', trial_start: start, trial_end: start+30*86400, default_payment_method: { id: 'pm_fixture_card' }, collection_method: 'charge_automatically',start_date:start,cancel_at:null,cancel_at_period_end:false,canceled_at:null,ended_at:null,pause_collection:null,latest_invoice:null,items: { data: [{ quantity: 1, price: this.fixturePrice,current_period_start:start,current_period_end:start+30*86400 }] } })
    session.status = 'complete'; session.subscription = sub.id; session.payment_status = 'no_payment_required'
    this.subscriptions.set(sub.id, sub)
    return { session, sub }
  }
  invoices = new Map<string, Stripe.Invoice>()
  cancelCalls: { id:string;target:number;key:string }[] = []
  failCancel = false
  failCancelAfter = false
  portalCalls: Stripe.BillingPortal.SessionCreateParams[] = []
  portalConfig = fixture<Stripe.BillingPortal.Configuration>({ id:'bpc_fixture',livemode:false,active:true,features:{ subscription_cancel:{enabled:false},subscription_update:{enabled:false},invoice_history:{enabled:true},payment_method_update:{enabled:true} } })
  async invoice(id: string) { if (this.failReads) throw new Error('Controlled invoice outage'); const inv=this.invoices.get(id); if (!inv) throw new Error('Controlled missing invoice'); return inv }
  async upcoming(customer:string,subscription:string) { return fixture<Stripe.Invoice>({id:'upcoming_fixture',livemode:false,customer,currency:'brl',amount_due:13990,parent:{subscription_details:{subscription}}}) }
  async cancel(id:string,target:number,key:string) {
    this.cancelCalls.push({id,target,key})
    if(this.failCancel) throw new Error('Controlled cancel outage')
    const sub=await this.subscription(id); sub.cancel_at=target
    if(this.failCancelAfter) {this.failCancelAfter=false; throw new Error('Controlled lost response')}
    return sub
  }
  async portalConfiguration() { return this.portalConfig }
  async portal(input:Stripe.BillingPortal.SessionCreateParams) { this.portalCalls.push(input);return fixture<Stripe.BillingPortal.Session>({livemode:false,configuration:input.configuration,customer:input.customer,return_url:input.return_url,url:'https://billing.stripe.com/p/session/test_controlled_fixture'}) }
  paid(sub:Stripe.Subscription, status:Stripe.Invoice.Status = 'paid') {
    const start=Math.floor(Date.now()/1000)-60
    sub.status='active';sub.trial_start=start-31*86400;sub.trial_end=sub.trial_start+30*86400
    sub.items.data[0].current_period_start=start;sub.items.data[0].current_period_end=start+30*86400
    const inv=fixture<Stripe.Invoice>({id:'in_'+this.invoices.size,livemode:false,customer:sub.customer,currency:'brl',status,amount_due:13990,amount_paid:status==='paid'?13990:0,amount_remaining:status==='paid'?0:13990,attempt_count:status==='open'?1:1,next_payment_attempt:null,created:start,parent:{subscription_details:{subscription:sub.id}},lines:{has_more:false,data:[{amount:13990,pricing:{price_details:{price:'price_fixture'}},period:{start,end:start+30*86400}}]}})
    this.invoices.set(inv.id,inv);sub.latest_invoice=inv.id;return inv
  }

}
