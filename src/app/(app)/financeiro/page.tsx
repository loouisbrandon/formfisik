import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '@/modules/professional/access-monitor'
import {FinanceArea} from '@/modules/finance/area'
export const metadata={title:'Financeiro profissional | FormFisik'}
export default async function Page(){const user=await requireUser(),access=await professionalAccess(user);if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;return <DashboardAccessMonitor><FinanceArea/></DashboardAccessMonitor>}
