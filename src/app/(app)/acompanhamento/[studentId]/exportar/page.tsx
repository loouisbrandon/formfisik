import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '@/modules/professional/access-monitor'
import {PhysicalReportExport} from '@/modules/physical-reports/export-area'
export const metadata={title:'Exportar evolução física | FormFisik',robots:{index:false,follow:false}}
export default async function Page({params}:{params:Promise<{studentId:string}>}){const {studentId}=await params,access=await professionalAccess(await requireUser());if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;return <DashboardAccessMonitor><PhysicalReportExport key={studentId} studentId={studentId}/></DashboardAccessMonitor>}
