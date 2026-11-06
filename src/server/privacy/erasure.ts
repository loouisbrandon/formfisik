import 'server-only'
import {randomUUID} from 'node:crypto'
import type {PoolClient} from 'pg'
import {z} from '@/lib/validation'
import {db} from '../db'
import {transaction} from '../exercises/repository'
import type {PrivatePhotoStore} from '../progress-photos/storage'

const uuid=z.uuid().transform(value=>value.toLowerCase())
export const erasureInput=z.object({id:uuid,ownerId:uuid,scope:z.enum(['student','professional']),subjectId:uuid,approvalReference:uuid}).strict()
type Input=z.infer<typeof erasureInput>
type Job={id:string;owner_id:string;scope:Input['scope'];subject_id:string;approval_reference:string;state:string;not_before:Date}
export class ErasureError extends Error {constructor(public code:string){super(code)}}
const fail=(code:string):never=>{throw new ErasureError(code)}
export async function requestErasure(input:Input){
 const p=erasureInput.parse(input)
 if(p.scope==='professional'&&p.subjectId!==p.ownerId)fail('INVALID_SCOPE')
 return transaction(async c=>{
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,16016))',[p.ownerId])
  const old=await c.query('SELECT * FROM privacy_erasure_jobs WHERE id=$1 OR (owner_id=$2 AND scope=$3 AND subject_id=$4) FOR UPDATE',[p.id,p.ownerId,p.scope,p.subjectId])
  if(old.rowCount){if(old.rowCount!==1)fail('ERASURE_CONFLICT');const r=old.rows[0];if(r.owner_id!==p.ownerId||r.scope!==p.scope||r.subject_id!==p.subjectId||r.approval_reference!==p.approvalReference)fail('ERASURE_CONFLICT');return r.id as string}
  const user=await c.query("SELECT disabled_at FROM users WHERE id=$1 AND role='professional' FOR UPDATE",[p.ownerId])
  if(!user.rowCount||!user.rows[0].disabled_at)fail('ACCOUNT_MUST_BE_SUSPENDED')
  if(p.scope==='student'&&!(await c.query('SELECT 1 FROM student_links WHERE professional_id=$1 AND id=$2',[p.ownerId,p.subjectId])).rowCount)fail('SUBJECT_NOT_FOUND')
  await c.query('INSERT INTO privacy_erasure_jobs(id,owner_id,scope,subject_id,approval_reference) VALUES($1,$2,$3,$4,$5)',[p.id,p.ownerId,p.scope,p.subjectId,p.approvalReference]);return p.id
 })
}
async function blockers(c:PoolClient,j:Job){
 const user=await c.query('SELECT disabled_at FROM users WHERE id=$1 FOR SHARE',[j.owner_id])
 if(user.rowCount&&!user.rows[0].disabled_at)return 'account_not_suspended'
 if((await c.query("SELECT 1 FROM finance_agreements WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3) LIMIT 1",[j.owner_id,j.scope,j.subject_id])).rowCount)return 'financial_retention'
 if(j.scope==='professional'){
  if((await c.query("SELECT 1 FROM exercise_videos WHERE owner_id=$1 AND scope='official' UNION ALL SELECT 1 FROM media_publishers WHERE user_id=$1 OR granted_by=$1 UNION ALL SELECT 1 FROM media_events WHERE actor_id=$1 AND owner_id<>$1 LIMIT 1",[j.owner_id])).rowCount)return 'shared_contribution'
  if((await c.query("SELECT 1 FROM exercise_video_versions r JOIN exercise_videos v ON v.id=r.video_id WHERE v.owner_id=$1 AND r.source='stream' AND(r.external_id IS NULL OR r.processing<>'deleted') LIMIT 1",[j.owner_id])).rowCount)return 'media_cleanup_required'
  if((await c.query('SELECT 1 FROM finance_accounts WHERE professional_id=$1 LIMIT 1',[j.owner_id])).rowCount)return 'financial_retention'
  if((await c.query('SELECT 1 FROM billing_accounts WHERE user_id=$1 LIMIT 1',[j.owner_id])).rowCount)return 'financial_retention'
  if((await c.query('SELECT 1 FROM student_records WHERE professional_id=$1 LIMIT 1',[j.owner_id])).rowCount)return 'related_history'
  if((await c.query("SELECT 1 FROM intake_requests WHERE professional_id=$1 AND student_link_id IS NULL AND submitted_at IS NOT NULL LIMIT 1",[j.owner_id])).rowCount)return 'related_history'
  // Shared/public contribution history is never silently rewritten to satisfy erasure.
  if((await c.query(`SELECT 1 WHERE EXISTS(SELECT 1 FROM exercise_requests WHERE requested_by=$1 OR decided_by=$1)
   OR EXISTS(SELECT 1 FROM exercise_moderators WHERE user_id=$1 OR granted_by=$1)
   OR EXISTS(SELECT 1 FROM exercise_moderator_events WHERE user_id=$1)
   OR EXISTS(SELECT 1 FROM exercise_request_events WHERE actor_id=$1)
   OR EXISTS(SELECT 1 FROM workout_versions WHERE actor_id=$1 AND owner_id<>$1)
   OR EXISTS(SELECT 1 FROM exercise_versions v JOIN exercise_entries e ON e.id=v.exercise_id WHERE v.actor_id=$1 AND e.owner_id IS DISTINCT FROM $1)
   OR EXISTS(SELECT 1 FROM exercise_events v JOIN exercise_entries e ON e.id=v.exercise_id WHERE v.actor_id=$1 AND e.owner_id IS DISTINCT FROM $1)
   OR EXISTS(SELECT 1 FROM exercise_entries a JOIN exercise_entries b ON b.id=a.variation_of WHERE b.owner_id=$1 AND a.owner_id IS DISTINCT FROM $1)
   OR EXISTS(SELECT 1 FROM workout_exercise_references r JOIN exercise_entries e ON e.id=r.exercise_id WHERE e.owner_id=$1 AND r.owner_id<>$1)`,[j.owner_id])).rowCount)return 'shared_contribution'
 }
 const target="SELECT id FROM workout_plans WHERE owner_id=$1 AND (($2::text='professional' AND kind='template') OR ($2::text='student' AND student_link_id=$3))"
 if((await c.query(`SELECT 1 FROM workout_plans WHERE owner_id=$1 AND id NOT IN (${target}) AND (source_template_id IN (${target}) OR copied_from_id IN (${target})) LIMIT 1`,[j.owner_id,j.scope,j.subject_id])).rowCount)return 'related_history'
 return null
}
async function mark(c:PoolClient,id:string,state:string,blocker:string|null){await c.query('UPDATE privacy_erasure_jobs SET state=$2,blocker=$3 WHERE id=$1',[id,state,blocker])}
async function prepare(j:Job,lease:string){return transaction(async c=>{
 const r=await c.query('SELECT * FROM privacy_erasure_jobs WHERE id=$1 AND lease_id=$2 AND lease_until>clock_timestamp() FOR UPDATE',[j.id,lease]);if(!r.rowCount)fail('LEASE_LOST')
 if(r.rows[0].state==='completed')return true
 const blocker=await blockers(c,j);if(blocker){await mark(c,j.id,'blocked',blocker);return false}
 // Same owner locks used by upload/workout services. Reservations precede external PUT.
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,13013))',[j.owner_id])
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,10010))',[j.owner_id])
 if(j.scope==='professional'){await mark(c,j.id,'cleaning',null);return true}
 const added=await c.query(`INSERT INTO privacy_erasure_objects(job_id,object_key)
  SELECT $1,object_key FROM progress_photo_images WHERE professional_id=$2 AND ($3::text='professional' OR student_link_id=$4) ON CONFLICT DO NOTHING`,[j.id,j.owner_id,j.scope,j.subject_id])
 if(added.rowCount)await c.query("UPDATE privacy_erasure_jobs SET not_before=clock_timestamp()+interval '1 day' WHERE id=$1",[j.id])
 await c.query("UPDATE photo_authorizations SET revoked_at=COALESCE(revoked_at,clock_timestamp()) WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",[j.owner_id,j.scope,j.subject_id])
 await c.query("UPDATE progress_photo_images SET state='deleting',cleanup_due_at=clock_timestamp() WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3) AND state<>'deleted'",[j.owner_id,j.scope,j.subject_id])
 await c.query(`DELETE FROM workout_documents WHERE owner_id=$1 AND ($2::text='professional' OR student_link_id=$3 OR plan_id IN (SELECT id FROM workout_plans WHERE owner_id=$1 AND student_link_id=$3))`,[j.owner_id,j.scope,j.subject_id])
 await mark(c,j.id,'cleaning',null);return true
})}
async function finalize(j:Job,lease:string){return transaction(async c=>{
 const r=await c.query('SELECT * FROM privacy_erasure_jobs WHERE id=$1 AND lease_id=$2 AND lease_until>clock_timestamp() FOR UPDATE',[j.id,lease]);if(!r.rowCount)fail('LEASE_LOST');if(r.rows[0].state==='completed')return
 const blocker=await blockers(c,j);if(blocker){await mark(c,j.id,'blocked',blocker);return}
 const unready=await c.query(`SELECT 1 FROM privacy_erasure_objects WHERE job_id=$1 AND (last_deleted_at IS NULL OR last_deleted_at<$2) LIMIT 1`,[j.id,r.rows[0].not_before])
 if(unready.rowCount){await mark(c,j.id,'waiting','quiescence');return}
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,13013))',[j.owner_id])
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,10010))',[j.owner_id])
 // Detect any reservation committed after prepare; capture it on the next pass.
 if((await c.query(`SELECT 1 FROM progress_photo_images i WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3) AND NOT EXISTS(SELECT 1 FROM privacy_erasure_objects o WHERE o.job_id=$4 AND o.object_key=i.object_key) LIMIT 1`,[j.owner_id,j.scope,j.subject_id,j.id])).rowCount){await mark(c,j.id,'waiting','quiescence');return}
 // Import026: pending datasets cannot be associated reliably by contact; discard all pending owner payloads.
 await c.query("UPDATE professional_import_rows SET input=NULL,state=CASE WHEN state IN('valid','invalid','duplicate','conflict') THEN 'rejected' ELSE state END,error_code=CASE WHEN state IN('valid','invalid','duplicate','conflict') THEN 'privacy' ELSE error_code END WHERE professional_id=$1",[j.owner_id])
 await c.query("UPDATE professional_imports SET request_digest=repeat('0',64),state=CASE WHEN state IN('preview','processing') THEN 'canceled' ELSE state END,version=version+1 WHERE professional_id=$1",[j.owner_id])
 await c.query("UPDATE professional_import_rows SET result_id=NULL,student_link_id=NULL,state='erased',error_code='privacy' WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",[j.owner_id,j.scope,j.subject_id])
 if(j.scope==='professional'){await c.query('DELETE FROM professional_import_events WHERE professional_id=$1',[j.owner_id]);await c.query('DELETE FROM professional_import_rows WHERE professional_id=$1',[j.owner_id]);await c.query('DELETE FROM professional_imports WHERE professional_id=$1',[j.owner_id])}
 // Communication024 precedes its canonical references; no external delivery claims survive erasure.
 const communicationArgs=[j.owner_id,j.scope,j.subject_id]
 await c.query("UPDATE communication_operations SET student_link_id=NULL,result='{}',digest=repeat('0',64),invalidated_at=clock_timestamp() WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",communicationArgs)
 for(const table of ['communication_reads','communication_events','communication_records'])await c.query("DELETE FROM "+table+" WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",communicationArgs)
 if(j.scope==='professional'){await c.query('DELETE FROM communication_operations WHERE professional_id=$1',[j.owner_id]);await c.query('DELETE FROM communication_template_versions WHERE professional_id=$1',[j.owner_id]);await c.query('DELETE FROM communication_templates WHERE professional_id=$1',[j.owner_id])}
 // Check-ins022 reference prescriptions and published forms; erase before canonical dependencies.
 const checkinArgs=[j.owner_id,j.scope,j.subject_id]
 await c.query("UPDATE checkin_operations SET student_link_id=NULL,result='{}',invalidated_at=clock_timestamp() WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",checkinArgs)
 const checkinTarget="SELECT id FROM checkin_occurrences WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)"
 for(const table of ['checkin_reviews','checkin_submissions','checkin_invitations'])await c.query('DELETE FROM '+table+' WHERE professional_id=$1 AND occurrence_id IN('+checkinTarget+')',checkinArgs)
 for(const table of ['checkin_events','checkin_occurrences','checkin_assignments'])await c.query("DELETE FROM "+table+" WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",checkinArgs)
 if(j.scope==='professional')await c.query('DELETE FROM checkin_operations WHERE professional_id=$1',[j.owner_id])
 // Agenda021 must release execution references before 019 and canonical student deletion.
 const agendaArgs=[j.owner_id,j.scope,j.subject_id]
 await c.query("UPDATE agenda_operations SET student_link_id=NULL,result='{}',digest='',invalidated_at=clock_timestamp() WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3 OR result->>'studentId'=$3::text)",agendaArgs)
 await c.query("DELETE FROM agenda_events WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",agendaArgs)
 await c.query("DELETE FROM agenda_fulfillments WHERE professional_id=$1 AND occurrence_id IN(SELECT id FROM agenda_occurrences WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3))",agendaArgs)
 await c.query("DELETE FROM agenda_occurrences WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",agendaArgs)
 await c.query("UPDATE agenda_series SET parent_id=NULL WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",agendaArgs)
 await c.query("DELETE FROM agenda_series WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",agendaArgs)
 // Commercial019 is administrative only. Erase its references before canonical evidence.
 const commercialArgs=[j.owner_id,j.scope,j.subject_id]
 const commercialTarget="SELECT id FROM professional_contracts WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)"
 await c.query("UPDATE professional_commercial_operations SET student_link_id=NULL,result='{}',digest='',invalidated_at=clock_timestamp() WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3 OR result->>'studentId'=$3::text)",commercialArgs)
 await c.query("DELETE FROM professional_commercial_events WHERE professional_id=$1 AND ($2::text='professional' OR student_link_id=$3)",commercialArgs)
 await c.query('DELETE FROM professional_delivery_executions WHERE professional_id=$1 AND delivery_id IN(SELECT id FROM professional_deliveries WHERE professional_id=$1 AND contract_id IN('+commercialTarget+'))',commercialArgs)
 await c.query('DELETE FROM professional_deliveries WHERE professional_id=$1 AND contract_id IN('+commercialTarget+')',commercialArgs)
 await c.query('DELETE FROM professional_contract_versions WHERE professional_id=$1 AND contract_id IN('+commercialTarget+')',commercialArgs)
 await c.query('UPDATE professional_contracts SET previous_id=NULL WHERE professional_id=$1 AND id IN('+commercialTarget+')',commercialArgs)
 await c.query('DELETE FROM professional_contracts WHERE professional_id=$1 AND id IN('+commercialTarget+')',commercialArgs)
 const args=[j.owner_id,j.scope,j.subject_id],plans="SELECT id FROM workout_plans WHERE owner_id=$1 AND (($2::text='professional' AND kind='template') OR ($2::text='student' AND student_link_id=$3))"
 await c.query(`UPDATE workout_operation_keys SET result_ids=ARRAY(SELECT unnest(result_ids) EXCEPT ${plans}),invalidated_at=clock_timestamp() WHERE owner_id=$1 AND result_ids && ARRAY(${plans})`,args)
 await c.query(`DELETE FROM workout_exercise_references WHERE owner_id=$1 AND plan_id IN (${plans})`,args)
 await c.query(`UPDATE workout_plans SET source_template_id=NULL,source_template_version=NULL,copied_from_id=NULL,copied_from_version=NULL WHERE owner_id=$1 AND id IN (${plans})`,args)
 await c.query(`DELETE FROM workout_versions WHERE owner_id=$1 AND plan_id IN (${plans})`,args)
 await c.query(`DELETE FROM workout_plans WHERE owner_id=$1 AND id IN (${plans})`,args)
 if(j.scope==='student'){
 await c.query("UPDATE crm_operations SET subject_id=NULL,result='{}',digest='',invalidated_at=clock_timestamp() WHERE professional_id=$1 AND (subject_id=$2 OR result->>'next'=$2::text)",[j.owner_id,j.subject_id])
 await c.query('DELETE FROM crm_events WHERE professional_id=$1 AND student_link_id=$2',[j.owner_id,j.subject_id])
 await c.query('DELETE FROM crm_tasks WHERE professional_id=$1 AND student_link_id=$2',[j.owner_id,j.subject_id])
 await c.query('DELETE FROM crm_memberships WHERE professional_id=$1 AND student_link_id=$2',[j.owner_id,j.subject_id])
 await c.query('DELETE FROM intake_requests WHERE professional_id=$1 AND student_link_id=$2',[j.owner_id,j.subject_id])
 for(const table of ['physical_assessment_events','physical_assessments','photo_record_events','photo_removal_operations','progress_photo_images','photo_records','photo_authorizations','student_administrative_events']){
  const filter=table==='physical_assessment_events'?'assessment_id IN (SELECT id FROM physical_assessments WHERE professional_id=$1 AND student_link_id=$3)':table==='photo_record_events'||table==='photo_removal_operations'?'record_id IN (SELECT id FROM photo_records WHERE professional_id=$1 AND student_link_id=$3)':table==='student_administrative_events'?'link_id=$3':'student_link_id=$3'
  await c.query(`DELETE FROM ${table} WHERE professional_id=$1 AND ($2::text='professional' OR ${filter})`,args)
 }
 const records=await c.query("DELETE FROM student_links WHERE professional_id=$1 AND ($2::text='professional' OR id=$3) RETURNING student_id",args)
 if(records.rowCount)await c.query('DELETE FROM student_records WHERE professional_id=$1 AND id=ANY($2::uuid[])',[j.owner_id,records.rows.map(r=>r.student_id)])
 }
 if(j.scope==='professional'){
  await c.query('DELETE FROM exercise_video_sets WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM media_events WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM media_operations WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM exercise_video_versions WHERE video_id IN(SELECT id FROM exercise_videos WHERE owner_id=$1)',[j.owner_id])
  await c.query('DELETE FROM exercise_videos WHERE owner_id=$1',[j.owner_id])
  for(const table of ['agenda_operations','agenda_events','agenda_session_types','agenda_exceptions','agenda_settings'])await c.query('DELETE FROM '+table+' WHERE professional_id=$1',[j.owner_id])
  for(const table of ['professional_commercial_events','professional_commercial_operations','professional_plan_versions','professional_service_plans','professional_services'])await c.query(`DELETE FROM ${table} WHERE professional_id=$1`,[j.owner_id])
  for(const table of ['crm_events','crm_operations','crm_tasks','crm_memberships','crm_settings','crm_stages'])await c.query(`DELETE FROM ${table} WHERE professional_id=$1`,[j.owner_id])
  await c.query('DELETE FROM intake_requests WHERE professional_id=$1',[j.owner_id])
  await c.query('DELETE FROM intake_forms WHERE professional_id=$1',[j.owner_id])
  await c.query('DELETE FROM exercise_creation_keys WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM exercise_events WHERE exercise_id IN(SELECT id FROM exercise_entries WHERE owner_id=$1)',[j.owner_id])
  await c.query('DELETE FROM exercise_versions WHERE exercise_id IN(SELECT id FROM exercise_entries WHERE owner_id=$1)',[j.owner_id])
  await c.query('UPDATE exercise_entries SET variation_of=NULL WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM exercise_entries WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM workout_operation_keys WHERE owner_id=$1',[j.owner_id])
  await c.query('DELETE FROM account_security_events WHERE user_id=$1',[j.owner_id])
  await c.query('DELETE FROM pending_registrations WHERE email=(SELECT email FROM users WHERE id=$1)',[j.owner_id])
  await c.query('DELETE FROM users WHERE id=$1',[j.owner_id]) // credentials/sessions/reset/presentation cascade; finance/contributions preflight blocked.
 }
 await c.query("UPDATE privacy_erasure_jobs SET state='completed',blocker=NULL,completed_at=clock_timestamp() WHERE id=$1",[j.id])
})}
/** One fenced worker; bounded external I/O outside DB transactions. No HTTP endpoint. */
export async function processErasure(id:string,store:PrivatePhotoStore|null){
 z.uuid().parse(id);const lease=randomUUID()
 const claimed=await db().query("UPDATE privacy_erasure_jobs SET lease_id=$2,lease_until=clock_timestamp()+interval '15 minutes' WHERE id=$1 AND (lease_until IS NULL OR lease_until<clock_timestamp()) RETURNING *",[id,lease])
 if(!claimed.rowCount)return {state:'busy_or_missing',removed:0,failed:0}
 const j=claimed.rows[0] as Job;let removed=0,failed=0
 try{
  if(!await prepare(j,lease)){const blocked=await db().query('SELECT blocker FROM privacy_erasure_jobs WHERE id=$1',[id]);return {state:'blocked',blocker:blocked.rows[0].blocker as string,removed,failed}}
  const objects=await db().query('SELECT object_key FROM privacy_erasure_objects WHERE job_id=$1 AND cleanup_due_at<=clock_timestamp() ORDER BY object_key LIMIT 20',[id])
  for(const o of objects.rows){try{
   if(!store)throw Error('STORAGE_UNAVAILABLE')
   await store.remove(o.object_key)
   await db().query("UPDATE privacy_erasure_objects SET last_deleted_at=clock_timestamp(),attempts=attempts+1,cleanup_due_at=clock_timestamp()+interval '1 day' WHERE job_id=$1 AND object_key=$2 AND EXISTS(SELECT 1 FROM privacy_erasure_jobs WHERE id=$1 AND lease_id=$3 AND lease_until>clock_timestamp())",[id,o.object_key,lease]);removed++
  }catch{failed++;await db().query("UPDATE privacy_erasure_objects SET attempts=attempts+1,cleanup_due_at=clock_timestamp()+interval '5 minutes' WHERE job_id=$1 AND object_key=$2 AND EXISTS(SELECT 1 FROM privacy_erasure_jobs WHERE id=$1 AND lease_id=$3 AND lease_until>clock_timestamp())",[id,o.object_key,lease])}}
  if(failed&&j.state!=='completed')await db().query("UPDATE privacy_erasure_jobs SET state='blocked',blocker='external_storage' WHERE id=$1 AND lease_id=$2",[id,lease]);else await finalize(j,lease)
  const result=await db().query('SELECT state,blocker FROM privacy_erasure_jobs WHERE id=$1',[id]);return {...result.rows[0] as {state:string;blocker:string|null},removed,failed}
 }finally{await db().query('UPDATE privacy_erasure_jobs SET lease_id=NULL,lease_until=NULL WHERE id=$1 AND lease_id=$2',[id,lease])}
}

/** Scheduler-ready local command; only already approved jobs, bounded selection. */
export async function processErasureQueue(store:PrivatePhotoStore|null,limit=5){
 z.number().int().min(1).max(10).parse(limit)
 const due=await db().query(`SELECT j.id FROM privacy_erasure_jobs j
  WHERE (lease_until IS NULL OR lease_until<clock_timestamp()) AND
   (state IN ('pending','cleaning') OR EXISTS(SELECT 1 FROM privacy_erasure_objects o WHERE o.job_id=j.id AND o.cleanup_due_at<=clock_timestamp()))
  ORDER BY created_at,id LIMIT $1`,[limit])
 const result={scanned:due.rows.length,completed:0,waiting:0,blocked:0,failed:0}
 for(const j of due.rows){try{const r=await processErasure(j.id,store);if(r.failed)result.failed++;if(r.state==='completed')result.completed++;else if(r.state==='blocked')result.blocked++;else result.waiting++}catch{result.failed++}}
 return result
}
