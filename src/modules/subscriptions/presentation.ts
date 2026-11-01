import type { SubscriptionView } from './status'

export function billingDate(value: string | null, withTime = false) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Data não disponível'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value))
}
export function billingMoney(value: number | null) {
  return value === null ? 'Valor ainda não disponível' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100)
}
export function trialDaysRemaining(end: string | null, now: number) {
  if (!end || !Number.isFinite(Date.parse(end))) return null
  return Math.max(0, Math.ceil((Date.parse(end) - now) / 86400000))
}
export function stateCopy(view: SubscriptionView) {
  switch (view.state) {
    case 'none': return { title: 'Seu plano começa por aqui', description: 'Conheça o FormFisik Pro e escolha quando dar o próximo passo.' }
    case 'checkout_pending': return { title: 'Falta concluir sua contratação', description: 'Volte à página do plano para continuar. Seu acesso será liberado após a confirmação.' }
    case 'unavailable': return { title: 'Não foi possível consultar sua assinatura', description: 'O serviço está indisponível no momento. Tente atualizar novamente. Nenhuma alteração ou cobrança foi confirmada nesta consulta.' }
    case 'payment_pending': return { title: 'Seu pagamento está pendente', description: 'Consulte a cobrança para concluir o pagamento e recuperar o acesso.' }
    case 'payment_failed': return view.paymentIssue === 'action_required'
      ? { title: 'Seu pagamento precisa de uma confirmação', description: 'Abra a cobrança e siga as instruções para concluir o pagamento.' }
      : { title: 'Não conseguimos confirmar seu pagamento', description: 'Confira a cobrança ou atualize seu cartão para regularizar o acesso.' }
    case 'past_due': return { title: 'Há um pagamento em atraso', description: 'Regularize a cobrança para voltar a acessar os recursos do seu plano.' }
    case 'canceled': return { title: 'Sua assinatura foi cancelada', description: 'Não há renovação programada. Você ainda pode consultar as faturas disponíveis.' }
    case 'expired': return { title: view.financialStatus === 'trialing' ? 'Seu teste gratuito terminou' : 'Seu período de acesso terminou', description: 'Não há acesso ativo no momento. Consulte os pagamentos e as opções disponíveis abaixo.' }
    case 'paused': return { title: 'Sua assinatura está pausada', description: 'O acesso não está ativo. Consulte os dados e pagamentos disponíveis da sua assinatura.' }
    case 'blocked': return { title: 'Seu acesso não está ativo', description: 'Atualize a assinatura para consultar a situação mais recente e as opções disponíveis.' }
    case 'cancel_scheduled': return { title: 'Renovação cancelada', description: view.paidAccess ? 'Você pode continuar usando seu plano até a data indicada. Depois disso, não haverá renovação.' : 'A renovação está cancelada. O acesso continua sujeito à situação dos seus pagamentos.' }
    default: return null
  }
}
