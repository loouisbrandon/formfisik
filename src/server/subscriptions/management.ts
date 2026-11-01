import 'server-only'
import { randomUUID } from 'node:crypto'
import { locked, type Account } from './store'
import { syncAccount, syncFailed } from './service'
import { externalId } from './lifecycle'
import { BillingConflict, BillingUnavailable, stripeGateway, stripeSettings, portalConfigurationId, portalUrl, validPortalConfiguration, type BillingGateway } from './stripe'

export async function cancelSubscription(userId: string, gateway: BillingGateway = stripeGateway(), expectedEnd?: string) {
  stripeSettings()
  return locked(userId, async client => {
    const account: Account | undefined = (await client.query("SELECT a.* FROM billing_accounts a JOIN users u ON u.id=a.user_id WHERE u.id=$1 AND u.role='professional' AND u.email_verified_at IS NOT NULL", [userId])).rows[0]
    if (!account) throw new BillingConflict()
    try {
      await syncAccount(client, account, gateway)
      let sub = (await client.query('SELECT * FROM billing_subscriptions WHERE account_id=$1', [account.id])).rows[0]
      if (!sub) throw new BillingConflict()
      // No-op repeat still relies on canonical confirmation, never on the POST return URL.
      if (sub.cancel_at || sub.cancel_at_period_end || sub.provider_status === 'canceled') {
        await client.query("UPDATE billing_cancellations SET state='confirmed',confirmed_at=COALESCE(confirmed_at,clock_timestamp()) WHERE account_id=$1 AND (target_at=$2 OR $3='canceled')",[account.id,sub.cancel_at,sub.provider_status])
        return
      }
      const boundary = sub.provider_status === 'trialing' ? sub.trial_end : sub.period_end
      if (expectedEnd && boundary?.toISOString() !== expectedEnd) throw new BillingConflict()
      if (!['trialing','active','past_due','unpaid'].includes(sub.provider_status)) throw new BillingConflict()
      let operation = (await client.query('SELECT * FROM billing_cancellations WHERE account_id=$1', [account.id])).rows[0]
      if (!operation) {
        const target: Date | null = sub.provider_status === 'trialing' ? sub.trial_end : sub.period_end
        if (!target || target.getTime() <= Date.now()) throw new BillingConflict()
        operation = (await client.query('INSERT INTO billing_cancellations(account_id,id,stripe_subscription_id,target_at) VALUES($1,$2,$3,$4) RETURNING *', [account.id,randomUUID(),sub.stripe_subscription_id,target])).rows[0]
      }
      if (operation.state === 'confirmed' || operation.target_at.getTime() <= Date.now() || Date.now()-operation.created_at.getTime()>23*3600000) throw new BillingConflict()
      await gateway.cancel(operation.stripe_subscription_id, Math.floor(operation.target_at.getTime()/1000), operation.id)
      await syncAccount(client, account, gateway)
      sub = (await client.query('SELECT * FROM billing_subscriptions WHERE account_id=$1', [account.id])).rows[0]
      if (sub.provider_status !== 'canceled' && sub.cancel_at?.getTime() !== operation.target_at.getTime()) throw new BillingUnavailable()
      await client.query("UPDATE billing_cancellations SET state='confirmed',confirmed_at=clock_timestamp() WHERE account_id=$1", [account.id])
    } catch (error) { if (!(error instanceof BillingConflict)) await syncFailed(client, account.id); throw error }
  })
}
export type PortalAction = 'manage' | 'payment_method' | 'payments' | 'regularize'
export async function openPortal(userId: string, action: PortalAction, gateway: BillingGateway = stripeGateway()) {
  const { origin } = stripeSettings()
  const configuration = portalConfigurationId()
  if (!configuration) throw new BillingUnavailable()
  return locked(userId, async client => {
    const account: Account | undefined = (await client.query("SELECT a.* FROM billing_accounts a JOIN users u ON u.id=a.user_id WHERE u.id=$1 AND u.role='professional' AND u.email_verified_at IS NOT NULL", [userId])).rows[0]
    if (!account?.stripe_customer_id) throw new BillingConflict()
    try { await syncAccount(client, account, gateway) }
    catch (error) { await syncFailed(client,account.id); throw error }
    const sub = (await client.query('SELECT * FROM billing_subscriptions WHERE account_id=$1', [account.id])).rows[0]
    if (!sub) throw new BillingConflict()
    const config = await gateway.portalConfiguration(configuration)
    // Cancellation is deliberately handled by our confirmed, scheduled flow. No plan/quantity change.
    if (!validPortalConfiguration(config,configuration)) throw new BillingUnavailable()
    if (action === 'payment_method' && ['canceled','incomplete_expired'].includes(sub.provider_status)) throw new BillingConflict()
    if (action === 'regularize') {
      const invoice = (await client.query('SELECT status FROM billing_invoices WHERE stripe_invoice_id=$1 AND account_id=$2', [sub.latest_invoice_id,account.id])).rows[0]
      if (invoice?.status !== 'open') throw new BillingConflict()
    }
    const returnUrl = `${origin}/assinatura/gerenciar?retorno=portal`
    const session = await gateway.portal({ customer: account.stripe_customer_id, configuration, return_url: returnUrl })
    if (externalId(session.configuration) !== configuration || session.livemode || session.customer !== account.stripe_customer_id || session.return_url !== returnUrl) throw new BillingUnavailable()
    return { url: portalUrl(session.url) }
  })
}
