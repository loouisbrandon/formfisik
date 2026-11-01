import { redirect } from 'next/navigation'
import { requireUser } from '@/server/current-user'
import { professionalAccess } from '@/server/professional-dashboard'
import { AccessUnavailable,DashboardAccessMonitor } from '@/modules/professional/access-monitor'
import { StudentArea } from './student-area'
export async function StudentPage({mode,id}:{mode:'list'|'new'|'profile'|'edit';id?:string}){
 const access=await professionalAccess(await requireUser())
 if(access.status==='denied')redirect(access.destination)
 if(access.status==='unavailable')return <AccessUnavailable />
 return <DashboardAccessMonitor><StudentArea key={mode+id} mode={mode} id={id}/></DashboardAccessMonitor>
}
