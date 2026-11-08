import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import { z } from '@/lib/validation'
import { SubscriptionHeader } from '@/modules/subscriptions/subscription-header'
import styles from '@/modules/subscriptions/subscriptions.module.css'
import { CheckoutStatus } from '@/modules/subscriptions/checkout-status'
export const metadata = { title: 'Planos FormFisik | Assinatura', robots: { index: false, follow: false } }
export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const user = await requireUser()
  if (user.role !== 'professional') redirect('/conta')
  const query = await searchParams
  const selection = z.object({ plan: z.enum(['standard','premium','pro']).default('pro'), interval: z.enum(['month','year']).default('month') }).safeParse(query)
  return <div className={styles.page}><SubscriptionHeader title="Seu plano, seu ritmo." description="Compare os planos e escolha a capacidade para sua carteira de alunos." active="plans"/><CheckoutStatus initialSelection={selection.success ? selection.data : undefined}/><Link className="inline-block py-3 text-sm text-muted-foreground underline underline-offset-4" href="/assinatura/gerenciar">Consultar pagamentos e faturas</Link></div>
}
