import {db} from '@/server/db'
import {subscriptionPlans,type PlanId} from '@/modules/subscriptions/plan'
import { requireUser } from '@/server/current-user'
import { ProfessionalShell } from '@/modules/professional/shell'
import {settingsAvatarVersion} from '@/server/settings/identity'
import {accessFor} from '@/server/access'
import {sessionContext} from '@/server/sessions'
export const metadata = { robots: { index: false, follow: false } }
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const onboarding = user.role === 'professional' && !(await accessFor(user)).paidAccess
  const avatarVersion=user.role==='professional'?await settingsAvatarVersion(user.id):undefined
  let planLabel = 'Sem plano'
  if(user.role==='professional') { try { const row=(await db().query('SELECT s.plan_id FROM billing_subscriptions s JOIN billing_accounts a ON a.id=s.account_id WHERE a.user_id=$1',[user.id])).rows[0]; if(row?.plan_id && row.plan_id in subscriptionPlans) planLabel=subscriptionPlans[row.plan_id as PlanId].name.replace('FormFisik ','') } catch { planLabel='Plano indisponível' } }
  return <ProfessionalShell onboarding={onboarding} planLabel={planLabel} avatarVersion={avatarVersion} identityContext={sessionContext(user.id)} fullName={user.fullName} professional={user.role === 'professional'}>{children}</ProfessionalShell>
}
