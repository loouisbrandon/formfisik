import type { ReactNode } from 'react'
import { Check, CircleAlert, Clock3, FileText, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscriptionLabels, type SubscriptionView } from './status'
import { billingDate, billingMoney } from './presentation'

export const billingLink = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
export function BillingCard({ title, id, children, className }: { title: string; id: string; children: ReactNode; className?: string }) {
  return <section aria-labelledby={id} className={cn('min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>
    <h2 id={id} className="font-ui text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">{title}</h2>
    {children}
  </section>
}
export function SubscriptionBadge({ view }: { view: SubscriptionView }) {
  const attention = ['payment_failed', 'past_due', 'blocked'].includes(view.state)
  const positive = view.paidAccess && ['active', 'trialing'].includes(view.state)
  const Icon = attention ? CircleAlert : positive ? Check : Clock3
  return <span data-testid="subscription-state" className={cn('inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 font-ui text-base font-semibold leading-tight', positive ? 'border-primary/30 bg-primary/10 text-primary' : attention ? 'border-destructive/30 bg-destructive/10 text-red-300' : 'border-border bg-muted/40 text-foreground')}>
    <Icon className="size-4 shrink-0" aria-hidden="true" />{subscriptionLabels[view.state]}
  </span>
}
export function AccessStatus({ view }: { view: SubscriptionView }) {
  return <div className={cn('flex items-start gap-3 rounded-xl border p-4', view.paidAccess ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30')}>
    <ShieldCheck className={cn('mt-0.5 size-5 shrink-0', view.paidAccess ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
    <div><p className="text-sm font-semibold">{view.paidAccess ? 'Acesso liberado' : view.state === 'unavailable' ? 'Acesso não confirmado' : 'Acesso aos recursos do plano não está ativo'}</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{view.paidAccess ? `Disponível até ${billingDate(view.accessUntil, true)}.` : 'Sua conta e as opções disponíveis de pagamento continuam acessíveis.'}</p>
    </div>
  </div>
}
const invoiceLabel: Record<string, string> = { draft: 'Em preparação', open: 'Em aberto', paid: 'Paga', void: 'Anulada', uncollectible: 'Pagamento não recebido' }
export function InvoiceHistory({ invoices }: { invoices: SubscriptionView['invoices'] }) {
  return !invoices.length ? <div className="flex flex-col items-center px-2 py-8 text-center sm:py-10">
    <div className="mb-4 rounded-xl border border-border bg-muted/40 p-3"><FileText className="size-6 text-muted-foreground" aria-hidden="true" /></div>
    <h3 className="text-sm font-semibold">Nenhuma fatura disponível</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Quando houver uma cobrança, você poderá acompanhar as faturas disponíveis nesta seção.</p>
  </div> : <ul className="mt-4 divide-y divide-border">
    {invoices.map((invoice, index) => <li key={index} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-3"><FileText className="hidden size-5 shrink-0 text-muted-foreground sm:block" aria-hidden="true" /><div><p className="text-sm font-medium">{invoice.amountDue===0&&invoice.amountPaid===0?'Fatura sem cobrança':'Fatura da assinatura'}</p><time dateTime={invoice.createdAt} className="mt-1 block text-xs leading-5 text-muted-foreground">{billingDate(invoice.createdAt)}</time></div></div>
      <span className={cn('justify-self-end rounded-lg px-2 py-1 font-ui text-sm font-semibold sm:justify-self-start', invoice.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground')}>{invoice.status==='paid'&&invoice.amountDue===0&&invoice.amountPaid===0?'Sem valor a pagar':invoiceLabel[invoice.status] ?? 'Em análise'}</span>
      <div className="col-span-2 text-sm tabular-nums sm:col-span-1 sm:text-right"><p className="font-semibold">{billingMoney(invoice.amountDue)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{invoice.status === 'paid' ? `Pago: ${billingMoney(invoice.amountPaid)}` : `Valor pago: ${billingMoney(invoice.amountPaid)}`}</p></div>
    </li>)}
  </ul>
}
