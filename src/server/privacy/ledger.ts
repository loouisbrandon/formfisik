import 'server-only'
import {createHmac,timingSafeEqual} from 'node:crypto'
import {z} from '@/lib/validation'
import {config} from '../config'
import {db} from '../db'
import {transaction} from '../exercises/repository'
import {erasureInput,ErasureError} from './erasure'
const object=z.object({jobId:z.uuid(),key:z.string().regex(/^progress\/[a-f0-9]{64}\.jpg$/)}).strict()
const payloadSchema=z.object({version:z.literal(1),jobs:z.array(erasureInput).max(5000),objects:z.array(object).max(10000),mediaRevocations:z.array(z.object({id:z.uuid(),owner:z.uuid()}).strict()).max(10000).optional(),mediaCleanup:z.array(z.string().regex(/^[a-f0-9]{32}$/)).max(10000).optional()}).strict()
const envelopeSchema=z.object({payload:z.string().max(10000000),mac:z.string().regex(/^[a-f0-9]{64}$/)}).strict()
const sign=(value:string)=>createHmac('sha256',config().abuseSecret).update('formfisik-erasure-ledger-v1\0').update(value).digest('hex')
/** Restricted operational artifact: identifiers/object keys, never profile or credentials. */
export async function exportErasureLedger(){
 return transaction(async c=>{
  await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ')
  const jobs=await c.query('SELECT id,owner_id,scope,subject_id,approval_reference FROM privacy_erasure_jobs ORDER BY id LIMIT 5001')
  const objects=await c.query('SELECT job_id,object_key FROM privacy_erasure_objects ORDER BY job_id,object_key LIMIT 10001')
  const mediaRevocations=await c.query("SELECT id,owner_id AS owner FROM exercise_videos WHERE state='revoked' ORDER BY id LIMIT 10001"),mediaCleanup=await c.query('SELECT provider_id FROM media_cleanup ORDER BY provider_id LIMIT 10001')
  const payload=JSON.stringify(payloadSchema.parse({version:1,mediaRevocations:mediaRevocations.rows,mediaCleanup:mediaCleanup.rows.map(r=>r.provider_id),jobs:jobs.rows.map(j=>({id:j.id,ownerId:j.owner_id,scope:j.scope,subjectId:j.subject_id,approvalReference:j.approval_reference})),objects:objects.rows.map(o=>({jobId:o.job_id,key:o.object_key}))}))
  return JSON.stringify({payload,mac:sign(payload)})
 })
}
/** Only during isolated maintenance after restore, before opening any application traffic. */
export async function replayErasureLedger(raw:string){
 if(Buffer.byteLength(raw)>11000000)throw new ErasureError('LEDGER_TOO_LARGE')
 const envelope=envelopeSchema.parse(JSON.parse(raw)),expected=Buffer.from(sign(envelope.payload),'hex'),actual=Buffer.from(envelope.mac,'hex')
 if(!timingSafeEqual(expected,actual))throw new ErasureError('LEDGER_AUTHENTICATION_FAILED')
 const data=payloadSchema.parse(JSON.parse(envelope.payload)),ids=new Set(data.jobs.map(j=>j.id))
 if(ids.size!==data.jobs.length||data.objects.some(o=>!ids.has(o.jobId))||data.jobs.some(j=>j.scope==='professional'&&j.subjectId!==j.ownerId))throw new ErasureError('INVALID_LEDGER_SCOPE')
 await transaction(async c=>{
  for(const v of data.mediaRevocations??[])await c.query("UPDATE exercise_videos SET state='revoked' WHERE id=$1 AND owner_id=$2",[v.id,v.owner])
  for(const id of data.mediaCleanup??[])await c.query('INSERT INTO media_cleanup(provider_id) VALUES($1) ON CONFLICT(provider_id) DO UPDATE SET deleted_at=NULL,due_at=clock_timestamp()',[id])
  for(const j of data.jobs){
   const old=await c.query('SELECT *,lease_until>clock_timestamp() AS active_lease FROM privacy_erasure_jobs WHERE id=$1 OR (owner_id=$2 AND scope=$3 AND subject_id=$4) FOR UPDATE',[j.id,j.ownerId,j.scope,j.subjectId])
   if(old.rowCount&&(old.rowCount!==1||old.rows[0].id!==j.id||old.rows[0].owner_id!==j.ownerId||old.rows[0].scope!==j.scope||old.rows[0].subject_id!==j.subjectId||old.rows[0].approval_reference!==j.approvalReference||old.rows[0].active_lease))throw new ErasureError('LEDGER_CONFLICT')
   // Restored accounts remain suspended; trigger revokes credentials active in the snapshot.
   await c.query('UPDATE users SET disabled_at=COALESCE(disabled_at,clock_timestamp()) WHERE id=$1',[j.ownerId])
   await c.query(`INSERT INTO privacy_erasure_jobs(id,owner_id,scope,subject_id,approval_reference) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT(id) DO UPDATE SET state='pending',blocker=NULL,completed_at=NULL,lease_id=NULL,lease_until=NULL,not_before=clock_timestamp()+interval '1 day'`,[j.id,j.ownerId,j.scope,j.subjectId,j.approvalReference])
  }
  for(const o of data.objects)await c.query(`INSERT INTO privacy_erasure_objects(job_id,object_key) VALUES($1,$2) ON CONFLICT(job_id,object_key) DO UPDATE SET last_deleted_at=NULL,cleanup_due_at=clock_timestamp()`,[o.jobId,o.key])
 })
 return {jobs:data.jobs.length,objects:data.objects.length}
}
/** Paginated operator view deliberately omits identities, references and object keys. */
export async function erasureStatus(page=1){
 z.number().int().min(1).max(100000).parse(page)
 const r=await db().query('SELECT id,scope,state,blocker,created_at,completed_at FROM privacy_erasure_jobs ORDER BY created_at DESC,id LIMIT 20 OFFSET $1',[(page-1)*20])
 const total=Number((await db().query('SELECT count(*) FROM privacy_erasure_jobs')).rows[0].count)
 return {items:r.rows,total,page,pages:Math.max(1,Math.ceil(total/20)),pageSize:20}
}
