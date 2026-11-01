import {redirect} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {AccessUnavailable,DashboardAccessMonitor} from '@/modules/professional/access-monitor'
import {ExerciseArea} from '@/modules/exercises/area'
export const metadata={title:'Exercícios | FormFisik'}
export default async function Page(){const access=await professionalAccess(await requireUser());if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;return <DashboardAccessMonitor><ExerciseArea/></DashboardAccessMonitor>}
