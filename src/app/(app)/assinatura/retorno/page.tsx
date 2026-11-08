import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import styles from '@/modules/subscriptions/subscriptions.module.css'
import { SubscriptionHeader } from '@/modules/subscriptions/subscription-header'
import { SubscriptionResult } from '@/modules/subscriptions/subscription-result'
export const metadata = { title: 'Confirmação da assinatura | FormFisik', robots: { index: false, follow: false } }
export default async function CheckoutReturn() {
  const user = await requireUser()
  if (user.role !== 'professional') redirect('/conta')
  return <div className={styles.page}><SubscriptionHeader title="Confirmação da assinatura" description="Seu plano e os próximos passos, com a situação de acesso atualizada." active="return"/><SubscriptionResult/></div>
}
