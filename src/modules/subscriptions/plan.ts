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
