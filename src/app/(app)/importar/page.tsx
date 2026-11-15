import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {DashboardAccessMonitor,AccessUnavailable} from '@/modules/professional/access-monitor'
import {ImportArea} from '@/modules/imports/area'
export const metadata={title:'Importar dados | FormFisik'}
export default async function Page(){const user=await requireUser(),access=await professionalAccess(user);if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;return <DashboardAccessMonitor><ImportArea/></DashboardAccessMonitor>}
