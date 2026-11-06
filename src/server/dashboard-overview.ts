import 'server-only'
import { db } from './db'
import { queryAgenda } from './agenda/queries'
import { agendaQuery } from '@/modules/agenda/schema'
import { queryFinance } from './finance/queries'
import { financeQuery } from '@/modules/finance/schema'
import type { DashboardOverview } from '@/modules/professional/dashboard'

// Read-only, bounded projections. No clinical detail, synthesized history, or new persistence.
export async function dashboardOverview(owner: string): Promise<DashboardOverview> {
  const asOf = new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Sao_Paulo'}).format(new Date())
  const [months, attention, recent, agenda, finance] = await Promise.all([
    db().query(`SELECT to_char(m,'YYYY-MM') AS month,count(l.id)::int AS count
      FROM generate_series(date_trunc('month',$2::date)-interval '5 months',date_trunc('month',$2::date),interval '1 month') m
      LEFT JOIN student_links l ON l.professional_id=$1 AND l.created_at>=(m::timestamp AT TIME ZONE 'America/Sao_Paulo') AND l.created_at<((m+interval '1 month')::timestamp AT TIME ZONE 'America/Sao_Paulo') AND l.created_at<=clock_timestamp()
      GROUP BY m ORDER BY m`,[owner,asOf]),
    db().query(`SELECT l.id,s.full_name AS name,to_char((SELECT max(a.assessment_date) FROM physical_assessments a WHERE a.professional_id=l.professional_id AND a.student_link_id=l.id AND a.state='active' AND a.assessment_date<=$2::date),'YYYY-MM-DD') AS last_assessment
      FROM student_links l JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id
      WHERE l.professional_id=$1 AND l.status='active' AND NOT EXISTS(SELECT 1 FROM physical_assessments a WHERE a.professional_id=l.professional_id AND a.student_link_id=l.id AND a.state='active' AND a.assessment_date BETWEEN $2::date-29 AND $2::date)
      ORDER BY lower(s.full_name),l.id LIMIT 3`,[owner,asOf]),
    db().query(`SELECT l.id,s.full_name AS name,l.created_at FROM student_links l JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id WHERE l.professional_id=$1 ORDER BY l.created_at DESC,l.id DESC LIMIT 3`,[owner]),
    queryAgenda(owner,agendaQuery.parse({view:'list',date:asOf})),
    queryFinance(owner,financeQuery.parse({view:'overview',from:asOf.slice(0,7)+'-01',to:asOf})),
  ])
  const appointments=agenda as {items:{id:string;title:string;full_name:string|null;local_time:string;projected_state:string}[];total:number;timezone:string}
  const money=finance as unknown as {provider_received:string}
  return {asOf,receivedCents:money.provider_received,months:months.rows.map(r=>({month:r.month,count:r.count})),
    appointments:appointments.items.slice(0,3).map(r=>({id:r.id,title:r.title,student:r.full_name,time:r.local_time.slice(0,5),state:r.projected_state})),appointmentTotal:appointments.total,timezone:appointments.timezone,
    attention:attention.rows.map(r=>({id:r.id,name:r.name,lastAssessment:r.last_assessment})),recentStudents:recent.rows.map(r=>({id:r.id,name:r.name,createdAt:r.created_at.toISOString()}))}
}
