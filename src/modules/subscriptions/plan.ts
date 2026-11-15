// Commercial catalog only. This is not proof of a subscription or entitlement.
export const proPlan = {
  id: 'formfisik-pro',
  name: 'FormFisik Pro',
  monthlyPriceCents: 13990,
  currency: 'BRL',
  trialDays: 30,
  requiresCard: true,
  interval: 'month',
} as const
export const proPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: proPlan.currency }).format(proPlan.monthlyPriceCents / 100)

export const subscriptionPlans = {
  standard: { id: 'standard', name: 'FormFisik Standard', monthlyPriceCents: 4990, studentLimit: 30 },
  premium: { id: 'premium', name: 'FormFisik Premium', monthlyPriceCents: 8990, studentLimit: 50 },
  pro: { id: 'pro', name: proPlan.name, monthlyPriceCents: proPlan.monthlyPriceCents, studentLimit: null },
} as const
export type PlanId = keyof typeof subscriptionPlans
export type BillingInterval = 'month' | 'year'
export type PlanSelection = { plan: PlanId; interval: BillingInterval }
export const defaultSelection: PlanSelection = { plan: 'pro', interval: 'month' }
export function planAmount(selection: PlanSelection) {
  const monthly = subscriptionPlans[selection.plan].monthlyPriceCents
  return selection.interval === 'year' ? monthly * 12 * 80 / 100 : monthly
}
export function formatPlanAmount(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}
