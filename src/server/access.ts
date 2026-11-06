import 'server-only'
import { subscriptionStatus } from './subscriptions/status'
import type { Identity } from './sessions'

// Server-owned entitlement from persisted provider-validated trial or paid period.
// Subscription lifecycle is centralized; provider failure denies commercial access.
export function destinationFor(user: Pick<Identity, 'role'>) {
  return user.role === 'professional' ? '/dashboard' : '/conta'
}
export async function accessFor(user: Pick<Identity, 'role'> & Partial<Pick<Identity, 'id'>>, fresh = false) {
  let status: Awaited<ReturnType<typeof subscriptionStatus>> | null = null
  if (user.role === 'professional' && user.id) {
    try { status = await subscriptionStatus(user.id,fresh,undefined,false) }
    catch { console.error('commercial_verification_unavailable') }
  }
  return {
    account: user.role === 'professional' ? 'confirmed_professional' : 'unsupported_role',
    commercial: status?.state ?? 'unavailable',
    paidAccess: status?.paidAccess ?? false,
    destination: destinationFor(user),
  } as const
}
