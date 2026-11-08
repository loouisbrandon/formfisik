import 'server-only'
import { z } from '@/lib/validation'
import Stripe from 'stripe'
import { db } from '../db'
import { boundedBody, BodyTooLarge, failure, jsonBody, limit, reply, sameOrigin } from '../http'
import { readSession, sessionToken } from '../sessions'
import { startCheckout, processBillingEvent } from './service'
import { BillingConflict, BillingUnavailable, stripeSettings, type BillingGateway } from './stripe'
import { subscriptionStatus } from './status'
import { cancelSubscription, openPortal, type PortalAction } from './management'

export async function checkout(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return reply({ message: 'Entre com sua conta confirmada.' }, 401)
    if (user.role !== 'professional') return reply({ message: 'Perfil não permitido.' }, 403)
    const input = await jsonBody(request)
    const selected = z.object({ plan: z.enum(['standard','premium','pro']).default('pro'), interval: z.enum(['month','year']).default('month') }).strict().safeParse(input)
    if (!selected.success) return reply({ message: 'Selecione um plano e uma periodicidade válidos.' }, 400)
    await limit(`checkout:user:${user.id}`, 10, 60)
    return reply(await startCheckout(user.id, undefined, selected.data), 200)
  } catch (error) {
    if (error instanceof BillingConflict) return reply({ message: 'Já existe uma contratação ou tentativa em verificação para esta conta. Atualize o estado da assinatura antes de tentar novamente.' }, 409)
    if (error instanceof BillingUnavailable) return reply({ message: 'Checkout de teste indisponível. Verifique a configuração local ou tente novamente.' }, 503)
    return failure(error, 'checkout_unavailable')
  }
}
export async function billingStatus(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return reply({ message: 'Entre com sua conta confirmada.' }, 401)
    if (user.role !== 'professional') return reply({ message: 'Perfil não permitido.' }, 403)
    await limit(`billing-status:${user.id}`, 90, 60)
    // IDs supplied by the browser are deliberately not accepted or used.
    const refresh = new URL(request.url).searchParams.get('refresh') === '1'
    if (refresh) await limit(`billing-refresh:${user.id}`, 30, 60)
    return reply(await subscriptionStatus(user.id, refresh), 200)
  } catch (error) { return failure(error, 'subscription_status_unavailable') }
}
export function createStripeWebhookHandler(gateway?: BillingGateway, readTimeoutMs=15000) {
  return async function stripeWebhook(request: Request) {
    let event: Stripe.Event
    try {
      const settings = stripeSettings()
      const signature = request.headers.get('stripe-signature')
      if (!signature) return reply({ message: 'Assinatura inválida.' }, 400)
      const raw=await boundedBody(request,262144,readTimeoutMs)
      // Official SDK validates signature/timestamp on EXACT raw bytes, before JSON processing.
      event = new Stripe(settings.key).webhooks.constructEvent(raw, signature, settings.webhookSecret)
      if (event.livemode) return reply({ message: 'Somente eventos de teste são aceitos.' }, 400)
    } catch (error) {
      if (error instanceof BillingUnavailable) return reply({ message: 'Webhook de teste não configurado.' }, 503)
      if (error instanceof BodyTooLarge) return reply({ message: 'Corpo excede o limite.' }, 413)
      return reply({ message: 'Assinatura ou corpo inválido.' }, 400)
    }
    try {
      // Fast path is safe; processing itself checks again under the account lock.
      if (!(await db().query('SELECT 1 FROM billing_events WHERE stripe_event_id=$1', [event.id])).rowCount) await processBillingEvent(event, gateway)
      return reply({ received: true }, 200)
    } catch { console.error('stripe_webhook_processing_failed'); return reply({ message: 'Não foi possível processar. Reenvie o evento.' }, 503) }
  }
}
export const stripeWebhook = createStripeWebhookHandler()

export function createManagementHandlers(gateway?: BillingGateway) {
  async function handle(request: Request, kind: 'cancel' | 'portal') {
    try {
      if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
      const user = await readSession(sessionToken(request.headers.get('cookie')))
      if (!user) return reply({ message: 'Entre com sua conta confirmada.' }, 401)
      if (user.role !== 'professional') return reply({ message: 'Perfil não permitido.' }, 403)
      const body = await jsonBody(request)
      if (!body || typeof body !== 'object' || Array.isArray(body)) return reply({ message: 'Solicitação inválida.' }, 400)
      const input = body as Record<string, unknown>
      if (kind === 'cancel') {
        if (Object.keys(input).length !== 2 || input.confirm !== true || typeof input.expectedEnd !== 'string' || !Number.isFinite(Date.parse(input.expectedEnd))) return reply({ message: 'Confirme explicitamente o cancelamento.' }, 400)
        await limit(`billing-cancel:${user.id}`,10,60)
        await cancelSubscription(user.id,gateway,input.expectedEnd as string)
        return reply({ message: 'Cancelamento confirmado no provedor.', subscription: await subscriptionStatus(user.id,false,gateway) },200)
      }
      if (Object.keys(input).length !== 1 || !['manage','payment_method','payments','regularize'].includes(String(input.action))) return reply({ message: 'Ação inválida.' },400)
      await limit(`billing-portal:${user.id}`,10,60)
      return reply(await openPortal(user.id,input.action as PortalAction,gateway),200)
    } catch (error) {
      if (error instanceof BillingConflict) return reply({ message: 'Ação indisponível neste estado ou operação em reconciliação. Atualize a assinatura.' },409)
      if (error instanceof BillingUnavailable) return reply({ message: 'Stripe de teste ou Portal indisponível. Nenhuma alteração foi confirmada.' },503)
      return failure(error,'billing_management_unavailable')
    }
  }
  return { cancel: (request: Request) => handle(request,'cancel'), portal: (request: Request) => handle(request,'portal') }
}
export const managementHandlers = createManagementHandlers()
