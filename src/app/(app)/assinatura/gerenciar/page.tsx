import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import { SubscriptionDashboard } from '@/modules/subscriptions/subscription-dashboard'
import { billingLink } from '@/modules/subscriptions/billing-components'
export const metadata = { title: 'Minha assinatura | FormFisik', robots: { index: false, follow: false } }
export default async function ManageSubscription() {
  const user = await requireUser()
  if (user.role !== 'professional') redirect('/conta')
  return <div  className="min-w-0">
    <div className="mx-auto max-w-6xl">
      
      <div id="subscription-content" tabIndex={-1} className="outline-none scroll-mt-6 pb-7 pt-7 sm:pb-8 sm:pt-9">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2"><p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-primary">Seu espaço FormFisik</p><span className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground">Ambiente de testes · sem cobranças reais</span></div>
        <h1 className="text-heading mt-3 text-5xl sm:text-6xl">Minha assinatura</h1>
        <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">Tudo sobre seu plano, seu período e seus pagamentos.</p>
      </div>
      <SubscriptionDashboard />
      <footer className="mt-8 border-t border-border pt-5"><Link href="/dashboard" className={billingLink}><ArrowLeft className="size-4" aria-hidden="true" />Retornar ao dashboard</Link></footer>
    </div>
  </div>
}
