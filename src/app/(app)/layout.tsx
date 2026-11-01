import { requireUser } from '@/server/current-user'
import { ProfessionalShell } from '@/modules/professional/shell'
export const metadata = { robots: { index: false, follow: false } }
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return <ProfessionalShell fullName={user.fullName} professional={user.role === 'professional'}>{children}</ProfessionalShell>
}
