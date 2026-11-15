import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { BillingCard } from './billing-components'
import { billingDate, billingMoney, trialDaysRemaining } from './presentation'
import { proPrice, formatPlanAmount } from './plan'
import type { SubscriptionView } from './status'

export function SubscriptionPeriod({ view, now }: { view: SubscriptionView; now: number }) {
  const trial = view.financialStatus === 'trialing' && ['trialing', 'cancel_scheduled', 'expired'].includes(view.state)
  const remaining = trialDaysRemaining(view.trialEnd, now)
  const stopped = !!view.cancelAt || !!view.endedAt || view.state === 'canceled'
  return <BillingCard title="Meu período" id="subscription-period">
    {trial ? <>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">{view.state === 'expired' ? 'Seu teste gratuito terminou em' : 'Seu teste gratuito termina em'}</p><p className="mt-2 font-ui text-3xl font-semibold tabular-nums">{billingDate(view.trialEnd)}</p></div>
        {remaining !== null && <p className={cn('rounded-xl border px-4 py-3 font-ui text-lg font-semibold', view.state === 'expired' ? 'border-border bg-muted/30 text-muted-foreground' : 'border-primary/20 bg-primary/5 text-primary')}>{view.state === 'expired' ? 'Teste encerrado' : remaining === 0 ? 'Termina hoje' : `${remaining} ${remaining === 1 ? 'dia restante' : 'dias restantes'}`}</p>}
      </div>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">{view.state === 'expired' ? 'Não há acesso ativo confirmado após o teste.' : stopped ? 'A renovação está cancelada. Não haverá primeira cobrança desta assinatura.' : `Depois do teste, a cobrança de ${view.contractedAmount ? formatPlanAmount(view.contractedAmount) : proPrice} por ${view.billingInterval === 'year' ? 'ano' : 'mês'} é automática, salvo cancelamento anterior.`}</p>
    </> : <>
      <div className="mt-5 flex items-start gap-3"><CalendarDays className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden="true" /><div><p className="text-sm text-muted-foreground">{stopped ? view.state === 'canceled' ? 'Assinatura encerrada em' : 'Fim da renovação' : 'Próxima cobrança'}</p><p className="mt-2 font-ui text-3xl font-semibold tabular-nums">{stopped ? billingDate(view.state === 'canceled' ? view.endedAt ?? view.cancelAt : view.cancelAt ?? view.endedAt) : view.nextBillingAt ? billingDate(view.nextBillingAt) : 'Sem data prevista'}</p></div></div>
      {!stopped && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="text-sm text-muted-foreground">Valor previsto</p><p className="font-ui text-xl font-semibold tabular-nums">{billingMoney(view.nextBillingAmount)}</p></div>}
    </>}
    <div className="mt-5 flex flex-wrap items-start justify-between gap-2 border-t border-border pt-4 text-xs leading-6"><span className="text-muted-foreground">Renovação</span><span className="max-w-full text-right">{stopped ? 'Cancelada' : ['active', 'trialing'].includes(view.state) ? 'Automática' : 'Consulte a situação dos pagamentos'}</span></div>
    {view.startedAt && <p className="mt-3 text-xs leading-6 text-muted-foreground">Assinatura iniciada em {billingDate(view.startedAt)}.</p>}
    {view.periodStart && view.periodEnd && !trial && <p className="mt-3 text-xs leading-6 text-muted-foreground">Período atual: {billingDate(view.periodStart)} a {billingDate(view.periodEnd)}.</p>}
  </BillingCard>
}
