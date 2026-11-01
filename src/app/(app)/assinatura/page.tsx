import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Check, CreditCard, CalendarDays, ShieldCheck } from 'lucide-react'
import { requireUser } from '@/server/current-user'
import { proPlan, proPrice } from '@/modules/subscriptions/plan'
import { CheckoutStatus } from '@/modules/subscriptions/checkout-status'
export const metadata = { title: 'FormFisik Pro | Assinatura', robots: { index: false, follow: false } }
export default async function SubscriptionPage() {
  const user = await requireUser()
  if (user.role !== 'professional') redirect('/conta')
  return <div className="min-w-0">
    <div className="mx-auto max-w-5xl space-y-10">
      
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <section className="space-y-6" aria-labelledby="plan-heading">
          <p className="text-ui text-sm font-semibold uppercase tracking-[0.2em] text-primary">Um único plano. Uma direção.</p>
          <h1 id="plan-heading" className="text-heading text-5xl uppercase sm:text-6xl">Sua próxima evolução<br /><span className="text-primary">com o Pro.</span></h1>
          <p className="max-w-lg leading-7 text-muted-foreground">Conheça o {proPlan.name}, o plano da plataforma web de gestão de treinos para profissionais de educação física e seus alunos.</p>
          <h2 className="text-heading text-3xl">O que o plano contempla</h2>
          <ul className="space-y-4 text-sm leading-6">
            {['Sistema web de gestão de treinos.', 'Plataforma voltada ao trabalho do profissional com seus alunos.', 'Acesso completo à plataforma durante o teste e enquanto a assinatura estiver ativa.'].map(text => <li key={text} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><span>{text}</span></li>)}
          </ul>
          <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm leading-6 text-muted-foreground">Você está no ambiente de testes da FormFisik. Os módulos de gestão de treinos ainda estão em desenvolvimento. A contratação só é concluída após a confirmação do pagamento ou do período gratuito.</p>
          
        </section>
        <section className="premium-surface space-y-6 rounded-2xl border border-border p-6 sm:p-8" aria-labelledby="pro-heading">
          <div><p className="text-ui text-sm uppercase tracking-widest text-primary">Plano único</p><h2 id="pro-heading" className="text-heading mt-2 text-4xl">{proPlan.name}</h2></div>
          <p className="flex flex-wrap items-baseline gap-2"><span className="text-heading text-5xl">{proPrice}</span><span className="text-muted-foreground">/mês</span></p>
          <p className="text-ui text-xl font-semibold text-primary">{proPlan.trialDays} dias gratuitos</p>
          <ul className="space-y-4 border-y border-border py-6 text-sm leading-6">
            <li className="flex gap-3"><CreditCard aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" /><span>Cartão obrigatório para iniciar o teste.</span></li>
            <li className="flex gap-3"><CalendarDays aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" /><span>Após os {proPlan.trialDays} dias, cobrança automática de {proPrice} por mês, salvo cancelamento anterior.</span></li>
            <li className="flex gap-3"><ShieldCheck aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" /><span>Cancele antes do fim do teste para evitar a primeira cobrança. Gerencie o cancelamento da renovação no painel de assinatura.</span></li>
          </ul>
          <CheckoutStatus />
          <Link href="/assinatura/gerenciar" className="block min-h-11 py-3 text-sm text-primary underline">Gerenciar minha assinatura</Link>
          <p className="text-xs leading-5 text-muted-foreground">Pagamento gerenciado pela Stripe. Use somente cartões de teste neste ambiente. A FormFisik não armazena os dados completos do seu cartão.</p>
        </section>
      </div>
    </div>
  </div>
}
