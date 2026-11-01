import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import { SubscriptionResult } from '@/modules/subscriptions/subscription-result'
export const metadata = { title: 'Confirmação da assinatura | FormFisik', robots: { index: false, follow: false } }
export default async function CheckoutReturn() {
  const user = await requireUser()
  if (user.role !== 'professional') redirect('/conta')
  return <div className="auth-surface flex  items-center justify-center px-4 py-10"><section className="premium-surface w-full max-w-lg space-y-6 rounded-2xl border border-border p-6 sm:p-8">
    <p className="text-ui uppercase tracking-widest text-primary">FormFisik Pro • modo teste</p>
    <h1 className="text-heading text-4xl">Confirmação da assinatura</h1>
    <p className="text-sm leading-6 text-muted-foreground">Confira a situação atual do seu plano antes de continuar.</p>
    <SubscriptionResult />
  </section></div>
}
