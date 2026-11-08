import 'server-only'
import type {PoolClient} from 'pg'
import {db} from '../db'
import type {Card,CrmQuery,Stage,RuleResult} from '@/modules/crm/schema'
import {CrmError} from './core'
import {crmCheckinFacts} from '../checkins/queries'
import {agendaCrmFacts} from '../agenda/queries'
import {crmCommercialFacts} from '../consultancies/queries'
// Every domain is read canonically in one SQL snapshot, without sensitive JSON/measurements.
export const factsSql=`WITH task_counts AS (
 SELECT student_link_id,count(*) FILTER(WHERE status IN('pending','in_progress','waiting'))::int AS pending,
 count(*) FILTER(WHERE status IN('pending','in_progress','waiting') AND due_at<clock_timestamp())::int AS overdue,
 count(*) FILTER(WHERE status<>'completed' AND required)::int AS required_open,
 min(due_at) FILTER(WHERE status IN('pending','in_progress','waiting')) AS next_due_at
 FROM crm_tasks WHERE professional_id=$1 AND NOT archived GROUP BY student_link_id
), workout_counts AS (
 SELECT p.student_link_id,CASE WHEN bool_or(p.state='active') THEN 'active' WHEN bool_or(p.state='draft') THEN 'draft' ELSE 'archived' END AS workout,
 max(p.updated_at) AS workout_updated_at,bool_or(EXISTS(SELECT 1 FROM workout_versions v WHERE v.owner_id=$1 AND v.plan_id=p.id AND v.state='active')) AS prescribed
 FROM workout_plans p WHERE p.owner_id=$1 AND p.kind='individual' GROUP BY p.student_link_id
), assessment_counts AS (
 SELECT student_link_id,max(assessment_date) AS assessment_date FROM physical_assessments WHERE professional_id=$1 AND state='active' GROUP BY student_link_id
), commercial AS (${crmCommercialFacts}), agenda AS (${agendaCrmFacts}), checkins AS (${crmCheckinFacts}), facts AS MATERIALIZED (
 SELECT l.id,s.full_name,l.status,l.created_at AS registered_at,m.stage_id,m.version,m.entered_at,greatest(0,floor(extract(epoch FROM clock_timestamp()-m.entered_at)/86400))::int AS days_in_stage,
 CASE WHEN r.revoked_at IS NOT NULL THEN 'revoked' WHEN r.submitted_at IS NULL AND r.expires_at<=clock_timestamp() THEN 'expired' ELSE COALESCE(r.state,'none') END AS intake,
 r.id AS intake_id,r.submitted_at AS intake_submitted_at,COALESCE(w.workout,'none') AS workout,w.workout_updated_at,COALESCE(w.prescribed,false) AS prescribed,
 a.assessment_date,((clock_timestamp() AT TIME ZONE 'America/Sao_Paulo')::date-a.assessment_date) AS assessment_age,
 COALESCE(a.assessment_date>((clock_timestamp() AT TIME ZONE 'America/Sao_Paulo')::date-cfg.recent_days),false) AS assessment_recent,
 COALESCE(t.pending,0)::int AS pending,COALESCE(t.overdue,0)::int AS overdue,COALESCE(t.required_open,0)::int AS required_open,t.next_due_at,COALESCE(b.contract_count,0)::int AS contract_count,COALESCE(b.contract_active,false) AS contract_active,COALESCE(b.contract_near,false) AS contract_near,COALESCE(b.delivery_pending,false) AS delivery_pending,COALESCE(b.delivery_overdue,false) AS delivery_overdue,COALESCE(b.service_completed,false) AS service_completed,g.next_appointment,g.next_appointment_id,g.next_appointment_title,COALESCE(g.attendance_pending,false) AS attendance_pending,COALESCE(k.checkin_overdue,0)::int AS checkin_overdue,COALESCE(k.checkin_review,0)::int AS checkin_review
 FROM student_links l JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id
 JOIN crm_memberships m ON m.professional_id=l.professional_id AND m.student_link_id=l.id
 JOIN crm_settings cfg ON cfg.professional_id=l.professional_id
 LEFT JOIN LATERAL(SELECT id,state,expires_at,revoked_at,submitted_at FROM intake_requests WHERE professional_id=$1 AND student_link_id=l.id ORDER BY created_at DESC,id DESC LIMIT 1)r ON true
 LEFT JOIN task_counts t ON t.student_link_id=l.id LEFT JOIN workout_counts w ON w.student_link_id=l.id LEFT JOIN assessment_counts a ON a.student_link_id=l.id
 LEFT JOIN commercial b ON b.student_link_id=l.id LEFT JOIN agenda g ON g.student_link_id=l.id LEFT JOIN checkins k ON k.student_link_id=l.id
 WHERE l.professional_id=$1
)`
export const cardFields='id,full_name,status,stage_id,version,entered_at,days_in_stage,intake,intake_id,intake_submitted_at,workout,workout_updated_at,prescribed,assessment_date,assessment_recent,pending,overdue,required_open,next_due_at,contract_count,contract_active,contract_near,delivery_pending,delivery_overdue,service_completed,next_appointment,next_appointment_id,next_appointment_title,attendance_pending,checkin_overdue,checkin_review'
export type Fact=Card&{assessment_age:number|null}
export async function fact(c:PoolClient,owner:string,id:string){const r=await c.query(factsSql+' SELECT * FROM facts WHERE id=$2',[owner,id]);if(!r.rowCount)throw new CrmError(404,'not_found');return r.rows[0] as Fact}
const filters=`($3='all' OR status=$3) AND lower(full_name) LIKE $2 ESCAPE '\\' AND ($4::uuid IS NULL OR stage_id=$4)
 AND ($5='all' OR intake=$5) AND ($6='all' OR workout=$6)
 AND ($7='all' OR ($7='none' AND assessment_date IS NULL) OR ($7='recent' AND assessment_recent) OR ($7='old' AND assessment_date IS NOT NULL AND NOT assessment_recent))
 AND ($8='all' OR (pending>0)=($8='yes')) AND ($9='all' OR (overdue>0)=($9='yes'))
 AND ($10::date IS NULL OR registered_at>=($10::date AT TIME ZONE 'America/Sao_Paulo')) AND ($11::date IS NULL OR registered_at<(($11::date+1) AT TIME ZONE 'America/Sao_Paulo'))
 AND entered_at<=clock_timestamp()-$12::int*interval '1 day' AND ($13::uuid IS NULL OR id=$13) AND ($14='all' OR EXISTS(SELECT 1 FROM crm_tasks ft WHERE ft.professional_id=$1 AND ft.student_link_id=facts.id AND NOT ft.archived AND ft.status IN('pending','in_progress','waiting') AND ft.priority=$14))`
export function filterValues(owner:string,q:CrmQuery){return [owner,'%'+q.q.toLowerCase().replace(/[\\%_]/g,'\\$&')+'%',q.status,q.stageId??null,q.intake,q.workout,q.assessment,q.pending,q.overdue,q.from??null,q.to??null,q.minDays,q.studentId??null,q.priority]}
export async function cards(owner:string,q:CrmQuery){const order={name:'lower(full_name),id',entered:'entered_at DESC,id',oldest:'entered_at,id'}[q.sort],values=filterValues(owner,q),size=q.view==='cards'?10:20
 const r=await db().query(factsSql+`, filtered AS(SELECT * FROM facts WHERE ${filters}) SELECT (SELECT count(*)::int FROM filtered) AS total,COALESCE((SELECT json_agg(p) FROM(SELECT ${cardFields} FROM filtered ORDER BY ${order} LIMIT $15 OFFSET $16)p),'[]') AS items`,[...values,size,(q.page-1)*size]);return {...r.rows[0],page:q.page,pageSize:size}}
export async function board(owner:string,q:CrmQuery,initialId:string,c?:PoolClient){
 const order={name:'lower(full_name),id',entered:'entered_at DESC,id',oldest:'entered_at,id'}[q.sort],values=filterValues(owner,q),focus=q.focus==='initial'?initialId:q.focus==='all'?null:q.focus
 const r=await (c??db()).query(factsSql+`, filtered AS(SELECT * FROM facts WHERE ${filters}), ranked AS(SELECT *,row_number() OVER(PARTITION BY stage_id ORDER BY ${order}) AS rank,row_number() OVER(ORDER BY ${order}) AS list_rank FROM filtered)
 SELECT (SELECT count(*)::int FROM facts WHERE status='active') AS portfolio,
 (SELECT count(*)::int FROM facts WHERE status='active' AND registered_at>=date_trunc('month',clock_timestamp() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo') AS new_this_month,
 (SELECT count(*)::int FROM filtered) AS total,
 (SELECT count(*)::int FROM filtered WHERE intake='waiting') AS awaiting_response,
 (SELECT count(*)::int FROM filtered WHERE intake IN('received','reviewing')) AS awaiting_review,
 (SELECT count(*)::int FROM filtered WHERE workout<>'active') AS workout_pending,
 (SELECT COALESCE(sum(pending),0)::int FROM filtered) AS open_tasks,(SELECT COALESCE(sum(overdue),0)::int FROM filtered) AS overdue_tasks,
 COALESCE((SELECT json_agg(a) FROM(SELECT stage_id,count(*)::int AS count,avg(extract(epoch FROM clock_timestamp()-entered_at))::float8 AS average_seconds FROM filtered GROUP BY stage_id)a),'[]') AS counts,
 COALESCE((SELECT json_agg(p) FROM(SELECT ${cardFields} FROM ranked WHERE (($16::boolean AND list_rank>$17 AND list_rank<=$17+20) OR (NOT $16::boolean AND rank<=10 AND ($15::uuid IS NULL OR stage_id=$15))) ORDER BY list_rank)p),'[]') AS items`,[...values,focus,q.mode==='list',(q.page-1)*20]);return {...r.rows[0],focus:focus??'all',pageSize:q.mode==='list'?20:10,page:q.page}
}
export function conditions(source:Stage,target:Stage,f:Fact,defaultDays:number):RuleResult[]{
 const evaluate=(key:string,days:number)=>{switch(key){case'intake_requested':return !['none','expired','revoked'].includes(f.intake);case'intake_answered':return ['received','reviewing','reviewed'].includes(f.intake);case'intake_reviewed':return f.intake==='reviewed';case'workout_prescribed':return f.prescribed;case'workout_active':return f.workout==='active';case'workout_pending':return f.workout!=='active';case'assessment_recorded':return !!f.assessment_date;case'assessment_recent':return f.assessment_age!==null&&f.assessment_age>=0&&f.assessment_age<days;case'assessment_pending':return f.assessment_age===null||f.assessment_age>=days;case'tasks_required_done':return f.required_open===0;case'tasks_pending':return f.pending>0;case'tasks_overdue':return f.overdue>0;case'contract_exists':return f.contract_count>0;case'contract_active':return f.contract_active;case'contract_near':return f.contract_near;case'delivery_pending':return f.delivery_pending;case'delivery_overdue':return f.delivery_overdue;case'service_completed':return f.service_completed;default:throw new CrmError(409,'rule')}}
 const result:RuleResult[]=[]
 for(const [stage,phase,modes]of [[source,'exit',['exit']],[target,'entry',['entry','recommended','info']]] as const){for(const mode of modes){const rules=stage.rules.filter(r=>r.mode===mode);if(!rules.length)continue;const checks=rules.map(r=>({key:r.key,...(r.days?{days:r.days}:{}),passed:evaluate(r.key,r.days??defaultDays)}));result.push({phase,mode,operator:stage.operator,checks,passed:stage.operator==='all'?checks.every(c=>c.passed):checks.some(c=>c.passed)})}}
 return result
}
