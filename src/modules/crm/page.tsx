import {redirect,notFound} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {db} from '@/server/db'
import {AccessUnavailable,DashboardAccessMonitor} from '../professional/access-monitor'
import {CrmArea} from './area'
export async function CrmPage({studentId}:{studentId?:string}){const user=await requireUser(),access=await professionalAccess(user);if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;if(studentId&&!(await db().query('SELECT 1 FROM student_links WHERE professional_id=$1 AND id=$2',[user.id,studentId])).rowCount)notFound();return <DashboardAccessMonitor><CrmArea studentId={studentId}/></DashboardAccessMonitor>}
