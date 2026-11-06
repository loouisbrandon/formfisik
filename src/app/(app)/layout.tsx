import { requireUser } from '@/server/current-user'
import { ProfessionalShell } from '@/modules/professional/shell'
import {sessionContext} from '@/server/sessions'
export const metadata = { robots: { index: false, follow: false } }
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return <ProfessionalShell identityContext={sessionContext(user.id)} fullName={user.fullName} professional={user.role === 'professional'}>{children}</ProfessionalShell>
}
