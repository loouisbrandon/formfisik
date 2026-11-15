import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '@/modules/professional/access-monitor'
import {ExportArea} from '@/modules/workout-documents/export-area'
export const metadata={title:'Exportar ficha | FormFisik',robots:{index:false,follow:false}}
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{version?:string}>}){const access=await professionalAccess(await requireUser());if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;const {id}=await params,{version}=await searchParams;return <DashboardAccessMonitor><ExportArea id={id} initialVersion={version===undefined?undefined:Number(version)}/></DashboardAccessMonitor>}
