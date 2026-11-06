import {redirect,notFound} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {professionalAccess} from '@/server/professional-dashboard'
import {z} from '@/lib/validation'
import {db} from '@/server/db'
import {DashboardAccessMonitor,AccessUnavailable} from '../professional/access-monitor'
import {CommunicationArea} from './area'
export async function CommunicationPage({studentId}:{studentId?:string}){const user=await requireUser(),access=await professionalAccess(user);if(access.status==='denied')redirect(access.destination);if(access.status==='unavailable')return <AccessUnavailable/>;let student;if(studentId&&!z.uuid().safeParse(studentId).success)notFound();if(studentId){const r=await db().query('SELECT l.id,s.full_name AS "fullName" FROM student_links l JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id WHERE l.professional_id=$1 AND l.id=$2',[user.id,studentId]);if(!r.rowCount)notFound();student=r.rows[0]}return <DashboardAccessMonitor><CommunicationArea student={student}/></DashboardAccessMonitor>}
