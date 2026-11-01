import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import { professionalDashboard } from '@/server/professional-dashboard'
import { DashboardContent } from '@/modules/professional/dashboard-content'
import { AccessUnavailable, DashboardAccessMonitor } from '@/modules/professional/access-monitor'
export const metadata = { title: 'Dashboard profissional | FormFisik' }
export default async function DashboardPage() {
  const result = await professionalDashboard(await requireUser())
  if (result.status === 'denied') redirect(result.destination)
  if (result.status === 'unavailable') return <AccessUnavailable />
  return <DashboardAccessMonitor><DashboardContent data={result.data} /></DashboardAccessMonitor>
}
