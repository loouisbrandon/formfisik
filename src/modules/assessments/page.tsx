import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '@/modules/professional/access-monitor'
import {AssessmentArea} from './area'
export async function AssessmentPage({studentId}:{studentId?:string}){const access=await professionalAccess(await requireUser());if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;return <DashboardAccessMonitor><AssessmentArea key={studentId??'choose'} studentId={studentId}/></DashboardAccessMonitor>}
