import 'server-only'
import { z } from '@/lib/validation'
import { readSession, sessionToken } from '../sessions'
import { failure, reply } from '../http'
import { billingConfigured } from './stripe'
import { subscriptionStatus } from './status'
export async function checkoutAvailability(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return reply({ message: 'Entre com sua conta de e-mail confirmado.' }, 401)
    if (user.role !== 'professional') return reply({ message: 'Contratação disponível apenas para contas profissionais.' }, 403)
    const selection = z.object({ plan: z.enum(['standard','premium','pro']).default('pro'), interval: z.enum(['month','year']).default('month') }).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams))
    if (!selection.success) return reply({ message: 'Plano ou periodicidade inválidos.' }, 400)
    if (!billingConfigured(selection.data)) return reply({ status: 'unavailable', reason: 'test_configuration_missing' }, 200)
    const state = await subscriptionStatus(user.id)
    return reply({ status: state.trialUsed ? 'ineligible' : 'ready', reason: state.trialUsed ? 'trial_already_used' : 'test_mode', subscription: state }, 200)
  } catch (error) { return failure(error, 'subscription_availability_unavailable') }
}
