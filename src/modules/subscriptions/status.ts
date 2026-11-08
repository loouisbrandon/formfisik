export const subscriptionLabels = {
  unavailable: 'Indisponível', none: 'Sem assinatura', checkout_pending: 'Contratação em andamento', trialing: 'Teste ativo', active: 'Assinatura ativa', payment_pending: 'Pagamento pendente', payment_failed: 'Pagamento recusado', past_due: 'Pagamento em atraso', cancel_scheduled: 'Cancelamento agendado', canceled: 'Cancelada', expired: 'Expirada', paused: 'Pausada', blocked: 'Acesso bloqueado',
} as const
export type SubscriptionState = keyof typeof subscriptionLabels
export type SubscriptionView = {
  planId?: import('./plan').PlanId; billingInterval?: import('./plan').BillingInterval; contractedAmount?: number; studentLimit?: number | null
  state: SubscriptionState; paidAccess: boolean; financialStatus: string | null; invoiceStatus: string | null; paymentIssue: string | null
  trialStart: string | null; trialEnd: string | null; trialUsed: boolean; startedAt: string | null
  periodStart: string | null; periodEnd: string | null; cancelAt: string | null; canceledAt: string | null; endedAt: string | null
  accessUntil: string | null; nextBillingAt: string | null; nextBillingAmount: number | null; cancellationPending: boolean
  syncState: string; verifiedAt: string | null
  actions: { cancel: boolean; portal: boolean; paymentMethod: boolean; payments: boolean; regularize: boolean }
  invoices: { status: string; amountDue: number; amountPaid: number; createdAt: string; attempts: number }[]
}
