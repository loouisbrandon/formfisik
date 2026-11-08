'use client'
import {useFeedbackMessage} from '@/modules/feedback/hooks'
import {errorFallbacks} from '@/modules/feedback/messages'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Info, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { endpoints } from '@/services/api/endpoints'
import { proPlan, subscriptionPlans, planAmount, formatPlanAmount, defaultSelection, type PlanSelection } from './plan'
import { PlanCards } from './plan-cards'
import type { SubscriptionView } from './status'
import s from './subscriptions.module.css'

export function CheckoutStatus({ initialSelection = defaultSelection }: { initialSelection?: PlanSelection }) {
  const [selection, setSelection] = useState(initialSelection)
  const initializedPlan = useRef(false)
  const [view, setView] = useState<SubscriptionView | null>(null)
  const [state, setState] = useState<'loading' | 'unavailable' | 'error' | 'forbidden' | 'ready' | 'ineligible' | 'starting'>('loading')
  const [message, setMessage] = useFeedbackMessage('',errorFallbacks.default)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function check() {
      try {
        const response = await fetch(endpoints.checkoutAvailability + '?' + new URLSearchParams(selection), { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) { window.location.replace('/login?reason=session'); return }
        if (response.status === 403) { setState('forbidden'); return }
        const result = await response.json()
        if (!controller.signal.aborted) { setState(response.ok && ['unavailable','ready','ineligible'].includes(result.status) ? result.status : 'error'); setView(result.subscription ?? null); if (!initializedPlan.current && result.subscription?.planId) { initializedPlan.current = true; setSelection({ plan: result.subscription.planId, interval: result.subscription.billingInterval ?? 'month' }) } }
      } catch { if (!controller.signal.aborted) setState('error') }
    }
    void check()
    return () => controller.abort()
  }, [attempt, selection])
  async function start() {
    if (state !== 'ready') return
    setState('starting'); setMessage('')
    try {
      const response = await fetch(endpoints.checkout, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selection) })
      const result = await response.json()
      if (response.status === 401) { window.location.replace('/login?reason=session'); return }
      if (!response.ok) { setState(response.status === 409 ? 'ineligible' : 'error'); setMessage(response.status === 409 ? 'Sua contratação já foi iniciada ou seu teste já foi utilizado. Consulte sua assinatura para continuar.' : 'Não foi possível abrir a página de pagamento. Tente novamente em instantes.'); return }
      const url = new URL(result.url)
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.port || url.username || url.password) throw new Error('INVALID_CHECKOUT_URL')
      window.location.assign(url.href)
    } catch { setState('error'); setMessage('Não foi possível abrir a página de pagamento. Atualize a disponibilidade antes de tentar novamente.') }
  }
  return <div aria-busy={state === 'loading' || state === 'starting'}>
    {view?.planId && <div className={s.summary}><span className={s.summaryIcon}><CreditCard size={24} aria-hidden/></span><div><p className={s.eyebrow}>Seu plano contratado</p><h2>{subscriptionPlans[view.planId].name}</h2><p>{view.contractedAmount ? formatPlanAmount(view.contractedAmount) : 'Valor em verificação'} / {view.billingInterval === 'year' ? 'ano' : 'mês'} · {view.paidAccess ? 'Acesso confirmado' : 'Confira a situação do acesso'}</p></div><Link href="/assinatura/gerenciar">Gerenciar assinatura →</Link></div>}
    <PlanCards selection={selection} onSelect={next => { setState('loading'); setMessage(''); setSelection(next) }} view={view} disabled={state === 'starting'}/>
    <div className={s.checkout}><div><p className={s.eyebrow}>{state === 'ineligible' ? 'Compare seus benefícios' : 'Sua escolha'}</p><h2>{subscriptionPlans[selection.plan].name} · {selection.interval === 'year' ? 'Anual' : 'Mensal'}</h2><p>{formatPlanAmount(planAmount(selection))} {selection.interval === 'year' ? 'em cobrança única por ano' : 'por mês'}. {state === 'ineligible' ? 'Esta comparação não altera seu plano atual. Mudanças de plano ainda não estão disponíveis.' : `${proPlan.trialDays} dias de teste com cartão obrigatório. Cancele antes do fim do teste para evitar a primeira cobrança.`}</p></div><div className="space-y-3">
      {state === 'ineligible' ? <Link href="/assinatura/gerenciar" className={s.select}>Ver minha assinatura →</Link> : <Button onClick={start} disabled={state !== 'ready'} aria-describedby="checkout-status" className="font-ui min-h-12 w-full text-base font-semibold">{(state === 'loading' || state === 'starting') && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none"/>}{state === 'starting' ? 'Abrindo página de pagamento…' : `Iniciar teste de ${proPlan.trialDays} dias`}</Button>}
      <p id="checkout-status" role={state === 'error' ? 'alert' : 'status'} className="text-sm leading-6 text-muted-foreground">{message || (state === 'loading' ? 'Verificando disponibilidade…' : state === 'starting' ? 'Aguarde enquanto abrimos a página segura de pagamento.' : state === 'ready' ? 'Use somente cartões de teste no Checkout da Stripe.' : state === 'ineligible' ? 'Seu teste já foi utilizado ou existe uma contratação em andamento.' : state === 'forbidden' ? 'A contratação não está disponível para este perfil.' : state === 'error' ? 'Não foi possível verificar a disponibilidade agora.' : 'Contratação indisponível no momento. Nenhum teste ou cobrança foi iniciado.')}</p>
      {state === 'error' && <Button variant="outline" className="min-h-11 w-full" onClick={() => { setState('loading'); setMessage(''); setAttempt(a=>a+1) }}>Tentar verificar novamente</Button>}
    </div></div>
    <div className={s.notice}><Info size={18} aria-hidden/><p>IA e parceria de comissionamento estão em desenvolvimento. O teste é único por conta, independentemente do plano ou periodicidade. A assinatura FormFisik é separada dos pagamentos dos seus alunos.</p></div>
  </div>
}
