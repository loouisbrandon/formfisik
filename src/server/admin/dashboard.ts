import 'server-only'
import type {Identity} from '../sessions'
import {db} from '../db'

export function isAdministrator(user: Pick<Identity,'role'> | null): boolean {
  return user?.role === 'admin'
}
// Authorization belongs at the data boundary as well as in the layout.
export async function adminDashboard(user: Identity) {
  if(!isAdministrator(user))throw new Error('ADMIN_ACCESS_DENIED')
  const {rows}=await db().query(`WITH months AS (
    SELECT m FROM generate_series(date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo')-interval '5 months',date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo'),interval '1 month') m
  ) SELECT
    (SELECT count(*)::int FROM users WHERE role='professional') AS professionals,
    (SELECT count(*)::int FROM student_records) AS students,
    (SELECT count(*)::int FROM users) AS users,
    (SELECT count(*)::int FROM exercise_requests WHERE state='pending') AS pending_exercises,
    coalesce((SELECT json_agg(preview) FROM (SELECT id,left(proposal->>'name',160) AS name FROM exercise_requests WHERE state='pending' ORDER BY created_at,id LIMIT 5) preview),'[]') AS exercise_preview,
    (SELECT coalesce(sum(amount_paid),0)::text FROM billing_invoices WHERE status='paid' AND currency='brl') AS revenue,
    (SELECT json_agg(series ORDER BY series.month) FROM (
      SELECT to_char(m,'YYYY-MM') AS month,count(u.id)::int AS count
      FROM months LEFT JOIN users u ON u.created_at >= (m AT TIME ZONE 'America/Sao_Paulo')
        AND u.created_at < ((m+interval '1 month') AT TIME ZONE 'America/Sao_Paulo') AND u.created_at<=now()
      GROUP BY m
    ) series) AS months`)
  const row=rows[0]
  return {professionals:Number(row.professionals),students:Number(row.students),users:Number(row.users),revenueCents:String(row.revenue),pendingExercises:Number(row.pending_exercises),exercisePreview:row.exercise_preview as {id:string;name:string}[],months:row.months as {month:string;count:number}[]}
}
