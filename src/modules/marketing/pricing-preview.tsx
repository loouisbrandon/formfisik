'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { proPlan, subscriptionPlans, planAmount, formatPlanAmount } from '@/modules/subscriptions/plan'
import s from './landing.module.css'

// Public catalog only: selection never grants subscription access.
const plans = Object.values(subscriptionPlans).map(plan => ({
  id: plan.id, name: plan.name.replace('FormFisik ', ''), cents: plan.monthlyPriceCents,
  students: plan.studentLimit === null ? 'Alunos ilimitados' : `Até ${plan.studentLimit} alunos`,
}))
const money = formatPlanAmount

export function PricingPreview() {
  const [annual, setAnnual] = useState(false)
  return <div className={s.pricingCatalog}>
    <header className={s.pricingHeader}>
      <p className={s.kicker}>PLANOS FORMFISIK</p>
      <h2 id="pro-title">Seu trabalho evolui.<br/><em>Seu plano acompanha.</em></h2>
      <p>As ferramentas para organizar seu atendimento, no ritmo da sua carteira de alunos.</p>
      <div className={s.pricingToggle} role="group" aria-label="Periodicidade dos planos">
        <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>Mensal</button>
        <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>Anual <span>−20%</span></button>
      </div>
    </header>
    <div className={s.pricingCards} aria-live="polite">
      {plans.map(plan => {
        const total = planAmount({ plan: plan.id, interval: 'year' })
        return <article key={plan.id} className={`${s.pricingCard} ${plan.id === 'pro' ? s.pricingPro : ''}`} aria-labelledby={`plan-${plan.id}`}>
          <div className={s.pricingCardTop}><h3 id={`plan-${plan.id}`}>{plan.name}</h3><span>{plan.id === 'pro' ? 'Mais completo' : 'Plano completo'}</span></div>
          <p className={s.catalogPrice}>{money(annual ? total / 12 : plan.cents)}<small>/mês</small></p>
          <p className={s.catalogPeriod}>{annual ? <>Equivalente mensal. Cobrança única de <strong>{money(total)}/ano</strong>.<br/>Economia de {money(plan.cents * 12 - total)} por ano.</> : 'Cobrança mensal.'}</p>
          <p className={s.studentAllowance}>{plan.students}</p>
          <ul>
            <li><Check size={18} aria-hidden/>App completo para gestão profissional</li>
            {plan.id === 'pro' && <li><Sparkles size={18} aria-hidden/><span>Recursos com IA <small>Em desenvolvimento</small></span></li>}
            <li><Sparkles size={18} aria-hidden/><span>Parceria de comissionamento<small>Você poderá ganhar com parcerias com a FormFisik. Em desenvolvimento.</small></span></li>
          </ul>
          {<Link className={s.catalogAction} href={`/assinatura?plan=${plan.id}&interval=${annual ? 'year' : 'month'}`}>Escolher plano <ArrowRight size={18} aria-hidden/></Link>}
          <p className={s.catalogFootnote}>{`${proPlan.trialDays} dias de teste · Cartão obrigatório. Depois, ${money(annual ? total : plan.cents)}/${annual ? 'ano' : 'mês'}. Cancele antes do fim do teste para evitar a cobrança.`}</p>
        </article>
      })}
    </div>
    <p className={s.catalogNotice}>IA e comissionamento são recursos futuros. Todos os planos têm {proPlan.trialDays} dias de teste com cartão obrigatório. Contratação disponível somente no ambiente de testes, conforme configuração.</p>
    <Link href="/assinatura" className={s.catalogAccount}>Já tem conta? Consulte sua assinatura <ArrowRight size={16} aria-hidden/></Link>
  </div>
}
