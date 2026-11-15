import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '../professional/access-monitor'
import {ECoachChat} from './chat'
export async function ECoachPage(){
  const access=await professionalAccess(await requireUser())
  if(access.status==='denied')redirect(access.destination)
  if(access.status==='unavailable')return <AccessUnavailable/>
  return <DashboardAccessMonitor><ECoachChat/></DashboardAccessMonitor>
}
