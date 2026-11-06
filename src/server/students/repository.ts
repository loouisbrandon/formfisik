import 'server-only'
import { randomUUID, createHash } from 'node:crypto'
import { db } from '../db'
import type {PoolClient} from 'pg'
import type { Student,StudentFields,StudentQuery } from '../../modules/students/schema'
export class StudentConflict extends Error { constructor(public reason:'duplicate'|'version'|'key'){super(reason)} }
export class StudentNotFound extends Error {}
export class ExportLimit extends Error {}
const select=`SELECT l.*,s.full_name,s.email,s.phone,to_char(s.birth_date,'YYYY-MM-DD') AS birth_date,s.admin_notes FROM student_links l JOIN student_records s ON s.id=l.student_id AND s.professional_id=l.professional_id`
type Row={id:string;full_name:string;email:string|null;phone:string|null;birth_date:string|null;admin_notes:string;status:'active'|'archived';version:number;created_at:Date;updated_at:Date;archived_at:Date|null;reactivated_at:Date|null}
const view=(r:Row):Student=>({history:[],id:r.id,fullName:r.full_name,email:r.email??'',phone:r.phone??'',birthDate:r.birth_date??'',adminNotes:r.admin_notes,status:r.status,version:r.version,createdAt:r.created_at.toISOString(),updatedAt:r.updated_at.toISOString(),archivedAt:r.archived_at?.toISOString()??null,reactivatedAt:r.reactivated_at?.toISOString()??null})
export async function getStudent(owner:string,id:string){const r=await db().query(select+' WHERE l.professional_id=$1 AND l.id=$2',[owner,id]);if(!r.rowCount)throw new StudentNotFound();const history=await db().query('SELECT kind,version,occurred_at FROM student_administrative_events WHERE professional_id=$1 AND link_id=$2 ORDER BY version DESC LIMIT 20',[owner,id]);return {...view(r.rows[0]),history:history.rows.map(event=>({kind:event.kind,version:event.version,occurredAt:event.occurred_at.toISOString()}))}}
function criteria(owner:string,q:StudentQuery){return {values:[owner,q.status,'%'+q.q.toLowerCase().replace(/[\\%_]/g,'\\$&')+'%'],where:`l.professional_id=$1 AND ($2='all' OR l.status=$2) AND lower(s.full_name) LIKE $3 ESCAPE '\\'`}}
const orders={name_asc:'lower(s.full_name) ASC,l.id ASC',name_desc:'lower(s.full_name) DESC,l.id ASC',newest:'l.created_at DESC,l.id ASC',oldest:'l.created_at ASC,l.id ASC'}
export async function listStudents(owner:string,q:StudentQuery,exporting=false){
 const {values,where}=criteria(owner,q),pageSize=20
 // A single statement provides a consistent count and page, including empty pages.
 const result=await db().query(`WITH filtered AS (${select} WHERE ${where}), counted AS (SELECT count(*)::int AS total FROM filtered)
 SELECT counted.total,COALESCE((SELECT json_agg(r) FROM (SELECT id,full_name,status,version,created_at,updated_at FROM filtered s ORDER BY ${orders[q.sort].replaceAll('l.','s.')} LIMIT $4 OFFSET $5) r),'[]') AS items FROM counted`,[...values,exporting?501:pageSize,exporting?0:(q.page-1)*pageSize])
 const row=result.rows[0];if(exporting&&row.total>500)throw new ExportLimit()
 const items=row.items.map((r:Pick<Row,'id'|'full_name'|'status'|'version'|'created_at'|'updated_at'>)=>({id:r.id,fullName:r.full_name,status:r.status,version:r.version,createdAt:new Date(r.created_at).toISOString(),updatedAt:new Date(r.updated_at).toISOString()}))
 return {items,total:row.total,page:q.page,pageSize,pages:Math.max(1,Math.ceil(row.total/pageSize)),filters:q}
}
export async function createStudentInTransaction(client:PoolClient,owner:string,input:StudentFields&{creationKey:string;allowDuplicate?:boolean}){
 const digest=createHash('sha256').update(JSON.stringify([input.fullName,input.email,input.phone,input.birthDate,input.adminNotes])).digest('hex')
 let id=''
 await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,813008))',[owner])
 await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,18018))',[owner])
  const prior=await client.query('SELECT id,creation_digest FROM student_links WHERE professional_id=$1 AND creation_key=$2',[owner,input.creationKey])
  if(prior.rowCount){if(prior.rows[0].creation_digest!==digest)throw new StudentConflict('key');id=prior.rows[0].id}
  else{
   const duplicate=await client.query(`SELECT 1 FROM student_records WHERE professional_id=$1 AND lower(full_name)=lower($2) AND COALESCE(email,'')=$3 AND COALESCE(phone,'')=$4 AND COALESCE(to_char(birth_date,'YYYY-MM-DD'),'')=$5 LIMIT 1`,[owner,input.fullName,input.email,input.phone,input.birthDate])
   if(duplicate.rowCount&&!input.allowDuplicate)throw new StudentConflict('duplicate')
   const studentId=randomUUID();id=randomUUID()
   await client.query('INSERT INTO student_records(id,professional_id,full_name,email,phone,birth_date,admin_notes) VALUES($1,$2,$3,$4,$5,$6,$7)',[studentId,owner,input.fullName,input.email||null,input.phone||null,input.birthDate||null,input.adminNotes])
   await client.query('INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) VALUES($1,$2,$3,$4,$5)',[id,owner,studentId,input.creationKey,digest]);await client.query("INSERT INTO student_administrative_events(professional_id,link_id,kind,version) VALUES($1,$2,'created',1)",[owner,id])
  }
 // CRM enrollment is conditional on initialized settings, atomic with the canonical registration.
 await client.query(`WITH enrolled AS(INSERT INTO crm_memberships(professional_id,student_link_id,stage_id) SELECT professional_id,$2,initial_stage_id FROM crm_settings WHERE professional_id=$1 ON CONFLICT DO NOTHING RETURNING *) INSERT INTO crm_events(professional_id,actor_id,student_link_id,to_stage_id,kind,origin) SELECT professional_id,professional_id,student_link_id,stage_id,'enrolled','initialization' FROM enrolled`,[owner,id])
 return id
}
export async function createStudent(owner:string,input:StudentFields&{creationKey:string;allowDuplicate?:boolean}){
 const client=await db().connect();let id=''
 try{await client.query('BEGIN');id=await createStudentInTransaction(client,owner,input);await client.query('COMMIT')}
 catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 return getStudent(owner,id)
}
export async function updateStudent(owner:string,id:string,version:number,change:StudentFields|{status:'active'|'archived'}){
 const client=await db().connect()
 try{
  await client.query('BEGIN');const row=await client.query('SELECT * FROM student_links WHERE professional_id=$1 AND id=$2 FOR UPDATE',[owner,id])
  if(!row.rowCount)throw new StudentNotFound();if(row.rows[0].version!==version)throw new StudentConflict('version')
  let event:string|null=null
  if('status' in change){if(change.status!==row.rows[0].status){event=change.status==='active'?'reactivated':'archived';await client.query(`UPDATE student_links SET status=$3,archived_at=CASE WHEN $3='archived' THEN now() ELSE NULL END,reactivated_at=CASE WHEN $3='active' THEN now() ELSE reactivated_at END,updated_at=now(),version=version+1 WHERE professional_id=$1 AND id=$2`,[owner,id,change.status])}}
  else{event='updated';await client.query('UPDATE student_records SET full_name=$3,email=$4,phone=$5,birth_date=$6,admin_notes=$7 WHERE professional_id=$1 AND id=$2',[owner,row.rows[0].student_id,change.fullName,change.email||null,change.phone||null,change.birthDate||null,change.adminNotes]);await client.query('UPDATE student_links SET updated_at=now(),version=version+1 WHERE professional_id=$1 AND id=$2',[owner,id])}
  if(event)await client.query('INSERT INTO student_administrative_events(professional_id,link_id,kind,version) SELECT professional_id,id,$3,version FROM student_links WHERE professional_id=$1 AND id=$2',[owner,id,event])
  await client.query('COMMIT')
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 return getStudent(owner,id)
}
export async function studentCounts(owner:string){const result=await db().query("SELECT count(*) FILTER(WHERE status='active')::int AS active,count(*) FILTER(WHERE status='archived')::int AS archived FROM student_links WHERE professional_id=$1",[owner]);return result.rows[0] as {active:number;archived:number}}
