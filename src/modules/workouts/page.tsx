import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '@/modules/professional/access-monitor'
import {WorkoutArea,type WorkoutMode} from './area'
export async function WorkoutPage({mode,id,studentId,kind,applyTo}:{mode:WorkoutMode;id?:string;studentId?:string;kind?:'individual'|'template';applyTo?:string}){const access=await professionalAccess(await requireUser());if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;return <DashboardAccessMonitor><WorkoutArea key={mode+id+studentId+kind+applyTo} mode={mode} id={id} studentId={studentId} kind={kind} applyTo={applyTo}/></DashboardAccessMonitor>}
