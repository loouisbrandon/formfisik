import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import styles from '@/modules/subscriptions/subscriptions.module.css'
import { SubscriptionHeader } from '@/modules/subscriptions/subscription-header'
import { SubscriptionDashboard } from '@/modules/subscriptions/subscription-dashboard'
import { billingLink } from '@/modules/subscriptions/billing-components'
export const metadata = { title: 'Minha assinatura | FormFisik', robots: { index: false, follow: false } }
export default async function ManageSubscription() {
  const user = await requireUser()
  if (user.role !== 'professional') redirect('/conta')
  return <div className={styles.page}><SubscriptionHeader title="Minha assinatura" description="Seu plano, próximos vencimentos e faturas em um só lugar." active="manage"/><SubscriptionDashboard/><footer className="mt-6 border-t border-border pt-4"><Link href="/dashboard" className={billingLink}><ArrowLeft size={16} aria-hidden/>Retornar ao dashboard</Link></footer></div>
}
