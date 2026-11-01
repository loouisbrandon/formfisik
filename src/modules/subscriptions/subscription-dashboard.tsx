'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, CreditCard, FileText, LoaderCircle, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import { proPlan, proPrice } from './plan'
import type { SubscriptionView } from './status'
import { AccessStatus, BillingCard, billingLink, InvoiceHistory, SubscriptionBadge } from './billing-components'
import { billingDate, stateCopy } from './presentation'
import { SubscriptionPeriod } from './subscription-period'

type Action = 'cancel' | 'manage' | 'payment_method' | 'payments' | 'regularize'
export function SubscriptionDashboard() {
  const [attempt, setAttempt] = useState(0)
  const [view, setView] = useState<SubscriptionView | null>(null)
  const [checkedAt, setCheckedAt] = useState(0)
  const [busy, setBusy] = useState(true)
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const feedbackRef = useRef<HTMLParagraphElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const controller = new AbortController()
    async function check() {
      try {
        const response = await fetch(endpoints.billingStatus + '?refresh=1', { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) { window.location.replace('/login?reason=session'); return }
        if (!response.ok) throw new Error('UNAVAILABLE')
        const data = await response.json()
        if (!controller.signal.aborted) { setView(data); setCheckedAt(Date.now()) }
      } catch { if (!controller.signal.aborted) setError('Não foi possível atualizar sua assinatura. Tente novamente em instantes.') }
      finally { if (!controller.signal.aborted) setBusy(false) }
    }
    void check()
    return () => controller.abort()
  }, [attempt])
  useEffect(() => { if (feedback) feedbackRef.current?.focus() }, [feedback])
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])
  function refresh() { setBusy(true); setError(''); setView(null); setFeedback(''); setAttempt(a => a + 1) }
  async function action(kind: Action) {
    if (busy) return
    dialog.current?.close()
    setBusy(true); setActiveAction(kind); setError(''); setFeedback('')
    try {
      const response = await fetch(kind === 'cancel' ? endpoints.cancelSubscription : endpoints.billingPortal, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'cancel' ? { confirm: true, expectedEnd: view?.financialStatus === 'trialing' ? view.trialEnd : view?.periodEnd } : { action: kind }),
      })
      if (response.status === 401) { window.location.replace('/login?reason=session'); return }
      const data = await response.json()
      if (!response.ok) throw new Error('ACTION_UNAVAILABLE')
      if (kind === 'cancel') { setView(data.subscription); setCheckedAt(Date.now()); setFeedback('Renovação cancelada. Confira a data de término do seu acesso abaixo.') }
      else {
        const url = new URL(data.url)
        if (url.protocol !== 'https:' || url.hostname !== 'billing.stripe.com' || url.port || url.username || url.password) throw new Error('INVALID_PORTAL_URL')
        window.location.assign(url.href)
      }
    } catch { setView(null); setError('Não foi possível confirmar sua solicitação. Atualize a assinatura para conferir a situação antes de tentar de novo.') }
    finally { setBusy(false); setActiveAction(null) }
  }
  const copy = view ? stateCopy(view) : null
  const empty = view && ['none', 'checkout_pending', 'unavailable'].includes(view.state)
  const hasPaymentActions = view && (view.actions.portal || view.actions.paymentMethod || view.actions.payments || view.actions.regularize)
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p id="billing-feedback" ref={feedbackRef} tabIndex={feedback ? -1 : undefined} role="status" className="flex min-h-6 items-center gap-2 rounded-lg text-xs leading-6 text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        {busy ? <><LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />{activeAction === 'cancel' ? 'Confirmando cancelamento…' : activeAction ? 'Abrindo pagamentos…' : 'Atualizando sua assinatura…'}</> : feedback ? <><Check className="size-4 shrink-0 text-primary" aria-hidden="true" />{feedback}</> : 'Acompanhe os detalhes do seu plano.'}
      </p>
      <Button variant="ghost" disabled={busy} className="min-h-11 gap-2 font-ui text-base" onClick={refresh}><RefreshCw className="size-4" aria-hidden="true" />Atualizar assinatura</Button>
    </div>
    {error && <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm leading-7 text-red-300 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><h2 className="mb-1 font-semibold">Vamos tentar novamente?</h2><p>{error}</p></div>}
    <div aria-busy={busy}>
      {!view && busy && <div aria-hidden="true" className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))' }}>{[0, 1].map(i => <div key={i} className="premium-surface min-h-64 animate-pulse space-y-6 rounded-2xl border border-border p-7 motion-reduce:animate-none"><div className="h-3 w-24 max-w-full rounded bg-muted" /><div className="h-10 w-40 max-w-full rounded bg-muted" /><div className="h-5 w-48 max-w-full rounded bg-muted" /><div className="h-16 rounded-xl bg-muted" /></div>)}</div>}
      {view && <div className="grid items-start gap-5 lg:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))' }}>
        <div className="min-w-0 space-y-5 lg:space-y-6">
          <BillingCard title="Meu plano" id="subscription-overview" className="relative overflow-hidden border-t-primary/60">
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-heading text-4xl tracking-wide">{proPlan.name}</h3><p className="mt-2 font-ui text-4xl font-semibold tabular-nums">{proPrice}<span className="ml-1 text-base font-medium text-muted-foreground">/mês</span></p></div><SubscriptionBadge view={view} /></div>
            <div className="mt-6"><AccessStatus view={view} /></div>
            {copy && <div className="mt-5 border-t border-border pt-5"><h3 className="text-sm font-semibold">{copy.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{copy.description}</p>
              {empty && view.state !== 'unavailable' && <Link href="/assinatura" className={`${billingLink} mt-3`}>{view.state === 'checkout_pending' ? 'Continuar contratação' : 'Conhecer o FormFisik Pro'}<ArrowRight className="size-4" aria-hidden="true" /></Link>}
            </div>}
          </BillingCard>
          {!empty && <SubscriptionPeriod view={view} now={checkedAt} />}
        </div>
        <BillingCard title="Gerenciamento" id="subscription-actions">
          <h3 className="text-heading mt-4 text-3xl">Você no controle</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">Consulte pagamentos e mantenha seu plano em dia.</p>
          <div className="mt-5 space-y-3">
            {view.actions.regularize && <Button disabled={busy} className="h-auto min-h-12 w-full gap-3 whitespace-normal px-4 py-3 font-ui text-base font-semibold" onClick={() => void action('regularize')}>Regularizar pagamento<ArrowRight className="size-4" aria-hidden="true" /></Button>}
            {view.actions.portal && <Button variant={view.actions.regularize ? 'outline' : 'default'} disabled={busy} className="h-auto min-h-12 w-full justify-between gap-3 whitespace-normal px-4 py-3 font-ui text-base font-semibold" onClick={() => void action('manage')}><span className="flex items-center gap-3"><CreditCard className="size-4" aria-hidden="true" />Gerenciar pagamento</span><ArrowRight className="size-4" aria-hidden="true" /></Button>}
            {view.actions.paymentMethod && <Button variant="outline" disabled={busy} className="h-auto min-h-12 w-full justify-start gap-3 whitespace-normal px-4 py-3 font-ui text-base" onClick={() => void action('payment_method')}><CreditCard className="size-4" aria-hidden="true" />Atualizar cartão</Button>}
            {view.actions.payments && <Button variant="outline" disabled={busy} className="h-auto min-h-12 w-full justify-start gap-3 whitespace-normal px-4 py-3 font-ui text-base" onClick={() => void action('payments')}><FileText className="size-4" aria-hidden="true" />Consultar faturas</Button>}
          </div>
          {!hasPaymentActions && <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4"><p className="text-sm font-medium">Opções de pagamento indisponíveis</p><p className="mt-2 text-xs leading-6 text-muted-foreground">As ações aparecerão aqui quando estiverem disponíveis para sua assinatura.</p>{view.state === 'unavailable' && <Button variant="link" className="mt-2 h-auto min-h-11 whitespace-normal p-0 text-left" disabled={busy} onClick={refresh}>Tentar novamente</Button>}</div>}
          {hasPaymentActions && <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-muted-foreground"><ShieldCheck className="mt-1 size-4 shrink-0" aria-hidden="true" />Seus dados de pagamento são gerenciados com segurança pela Stripe. Use apenas cartões de teste neste ambiente.</p>}
          {view.actions.cancel && <div className="mt-6 border-t border-border pt-4"><Button variant="ghost" disabled={busy} className="h-auto min-h-11 justify-start gap-2 whitespace-normal px-0 font-ui text-base text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={() => dialog.current?.showModal()}><X className="size-4" aria-hidden="true" />Cancelar renovação</Button><p className="mt-1 text-xs leading-6 text-muted-foreground">Você mantém o acesso até o fim do período, se o teste ou pagamento estiver regular.</p></div>}
          {view.cancellationPending && <p role="status" className="mt-5 rounded-xl border border-border p-4 text-sm leading-7 text-muted-foreground">Seu pedido de cancelamento ainda não foi confirmado. Atualize a assinatura para conferir a situação.</p>}
        </BillingCard>
        <BillingCard title="Histórico de faturas" id="recent-invoices" className="col-span-full">
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-6 text-muted-foreground">{view.invoices.length ? 'Últimas faturas disponíveis. Consulte a lista completa na área de pagamentos.' : 'Seus pagamentos, organizados em um só lugar.'}</p>{view.actions.payments && <Button variant="link" disabled={busy} className="h-auto min-h-11 whitespace-normal px-0" onClick={() => void action('payments')}>Ver todas as faturas<ArrowRight className="size-4" aria-hidden="true" /></Button>}</div>
          <InvoiceHistory invoices={view.invoices} />
        </BillingCard>
      </div>}
    </div>
    <dialog ref={dialog} aria-labelledby="cancel-title" aria-describedby="cancel-description" className="auth-surface m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border p-6 text-foreground backdrop:bg-black/80 sm:p-8">
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Seu plano Pro</p><h2 id="cancel-title" className="text-heading mt-3 text-4xl">Cancelar renovação?</h2>
      <div id="cancel-description" className="my-5 space-y-4 text-sm leading-7 text-muted-foreground"><p>A renovação será encerrada em <strong className="font-semibold text-foreground">{billingDate(view?.financialStatus === 'trialing' ? view?.trialEnd ?? null : view?.periodEnd ?? null, true)}</strong>.</p><p>Você mantém o acesso até essa data, desde que o teste ou pagamento esteja regular. {view?.financialStatus === 'trialing' ? 'Não haverá primeira cobrança desta assinatura.' : 'Não haverá nova renovação.'}</p><p className="text-xs leading-6">O cancelamento não gera reembolso automático e não elimina faturas que já estejam em aberto.</p></div>
      <div className="flex flex-col gap-3"><Button variant="outline" autoFocus className="min-h-12 font-ui text-base" onClick={() => dialog.current?.close()}>Manter assinatura</Button><Button className="min-h-12 font-ui text-base font-semibold" disabled={busy} onClick={() => void action('cancel')}>Confirmar cancelamento</Button></div>
    </dialog>
  </div>
}
