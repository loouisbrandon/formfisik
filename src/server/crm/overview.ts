import 'server-only'
import type {CrmQuery} from '@/modules/crm/schema'
import {agendaQuery} from '@/modules/agenda/schema'
import {addDays,localParts,weekday} from '@/modules/agenda/time'
import {queryAgenda} from '../agenda/queries'
import {transaction} from './core'

/** Bounded operational projection; all sources remain owned by their canonical modules. */
export async function overview(owner:string,q:CrmQuery){return transaction(async c=>{
 await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY')
 const timezone=(await c.query('SELECT timezone FROM agenda_settings WHERE professional_id=$1',[owner])).rows[0]?.timezone??'America/Sao_Paulo'
 const today=localParts(Date.now(),timezone).date,week=addDays(today,-((weekday(today)+6)%7))
 const agenda=await queryAgenda(owner,agendaQuery.parse({view:'list',date:today,page:q.page,studentId:q.studentId}),c)
 const metrics=await c.query(`SELECT
 (SELECT count(*)::int FROM student_links WHERE professional_id=$1 AND status='active' AND ($2::uuid IS NULL OR id=$2)) AS students,
 (SELECT count(*)::int FROM crm_tasks WHERE professional_id=$1 AND NOT archived AND status IN('pending','in_progress','waiting') AND ($2::uuid IS NULL OR student_link_id=$2) AND (due_at AT TIME ZONE $3)::date=$4::date) AS today,
 (SELECT count(*)::int FROM crm_tasks WHERE professional_id=$1 AND NOT archived AND status IN('pending','in_progress','waiting') AND ($2::uuid IS NULL OR student_link_id=$2) AND due_at<clock_timestamp()) AS overdue,
 (SELECT count(*)::int FROM crm_tasks WHERE professional_id=$1 AND NOT archived AND status='completed' AND ($2::uuid IS NULL OR student_link_id=$2)) AS completed,
 (SELECT count(*)::int FROM agenda_occurrences WHERE professional_id=$1 AND kind<>'block' AND state<>'canceled' AND ($2::uuid IS NULL OR student_link_id=$2) AND starts_at>=($5::date AT TIME ZONE $3) AND starts_at<(($5::date+7) AT TIME ZONE $3)) AS week,
 (SELECT count(*)::int FROM student_links l WHERE l.professional_id=$1 AND l.status='active' AND ($2::uuid IS NULL OR l.id=$2) AND NOT EXISTS(SELECT 1 FROM crm_tasks t WHERE t.professional_id=$1 AND t.student_link_id=l.id AND NOT t.archived AND t.status IN('pending','in_progress','waiting')) AND NOT EXISTS(SELECT 1 FROM agenda_occurrences o WHERE o.professional_id=$1 AND o.student_link_id=l.id AND o.state='scheduled' AND o.starts_at>=clock_timestamp())) AS without_action`,[owner,q.studentId??null,timezone,today,week])
 const tasks=await c.query(`SELECT t.id,t.title,t.student_link_id,s.full_name,t.status,t.priority,t.version,t.due_at AS "dueAt" FROM crm_tasks t LEFT JOIN student_links l ON l.professional_id=t.professional_id AND l.id=t.student_link_id LEFT JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id WHERE t.professional_id=$1 AND NOT t.archived AND t.status IN('pending','in_progress','waiting') AND ($2::uuid IS NULL OR t.student_link_id=$2) ORDER BY CASE WHEN t.due_at<clock_timestamp() THEN 0 WHEN (t.due_at AT TIME ZONE $3)::date=$4::date THEN 1 WHEN t.priority IN('urgent','high') THEN 2 ELSE 3 END,t.due_at NULLS LAST,CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 ELSE 2 END,t.id LIMIT 6`,[owner,q.studentId??null,timezone,today])
 // The canonical Agenda list has a larger internal DTO; CRM intentionally projects only these fields.
 return {metrics:metrics.rows[0],date:today,timezone,agenda:{total:agenda.total,page:q.page,items:agenda.items?.map((a:{id:string;title:string;full_name:string|null;starts_at:string;projected_state:string;student_link_id:string|null})=>({id:a.id,title:a.title,full_name:a.full_name,starts_at:a.starts_at,state:a.projected_state,studentId:a.student_link_id}))??[]},tasks:tasks.rows}
})}
