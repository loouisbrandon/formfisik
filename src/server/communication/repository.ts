import 'server-only'
import {randomUUID} from 'node:crypto'
import type {PoolClient} from 'pg'
import {transaction,ownerLock,studentLock,hash,CrmError,initializeCrm} from '../crm/core'
import {saveTask,taskStatus} from '../crm/tasks'
import {contextSummary} from './contexts'
import {notificationRowsFor} from './notifications'
import {contextLabels,messageBody,type RecordFields,type CommunicationCommand} from '@/modules/communication/schema'
export async function audit(c:PoolClient,owner:string,kind:string,student:string|null=null,subject:string|null=null){await c.query('INSERT INTO communication_events(professional_id,actor_id,kind,student_link_id,subject_id) VALUES($1,$1,$2,$3,$4)',[owner,kind,student,subject])}
export async function prepare(c:PoolClient,owner:string,f:RecordFields){await studentLock(c,owner,f.studentId);const names=await c.query('SELECT s.full_name,u.full_name AS professional FROM student_links l JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id JOIN users u ON u.id=l.professional_id WHERE l.professional_id=$1 AND l.id=$2 FOR SHARE OF s',[owner,f.studentId]);if(!names.rowCount)throw new CrmError(404,'student')
 if(f.templateId){const t=await c.query('SELECT v.body FROM communication_template_versions v JOIN communication_templates t ON t.professional_id=v.professional_id AND t.id=v.template_id WHERE v.professional_id=$1 AND v.template_id=$2 AND v.version=$3 AND NOT t.archived FOR SHARE OF t',[owner,f.templateId,f.templateVersion]);if(!t.rowCount||t.rows[0].body!==f.body)throw new CrmError(409,'template_changed')}
 const context=f.context?await contextSummary(c,owner,f.studentId,f.context,true):null
 let appointment:{starts_at:Date;timezone:string}|undefined
 if(/\{\{compromisso\.(data|hora)\}\}/.test(f.body)){
  if(f.context?.kind!=='appointment')throw new CrmError(400,'appointment_required')
  appointment=(await c.query('SELECT starts_at,timezone FROM agenda_occurrences WHERE professional_id=$1 AND student_link_id=$2 AND id=$3 AND version=$4 FOR SHARE',[owner,f.studentId,f.context.id,f.context.version])).rows[0]
  if(!appointment)throw new CrmError(409,'appointment_changed')
 }
 const values:Record<string,string>={'aluno.nome':names.rows[0].full_name,'aluno.primeiroNome':names.rows[0].full_name.trim().split(/\s+/)[0],'compromisso.data':appointment?appointment.starts_at.toLocaleDateString('pt-BR',{timeZone:appointment.timezone}):'','compromisso.hora':appointment?appointment.starts_at.toLocaleTimeString('pt-BR',{timeZone:appointment.timezone,hour:'2-digit',minute:'2-digit'}):'','profissional.nome':names.rows[0].professional,'contexto.tipo':f.context?contextLabels[f.context.kind]:'Acompanhamento','hoje':new Date().toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}
 const body=f.body.replace(/\{\{([^{}]+)\}\}/g,(_,name:string)=>values[name]);if(!messageBody.safeParse(body).success)throw new CrmError(400,'render_limit')
 if(f.occurredAt&&new Date(f.occurredAt).getTime()>Date.now()+60000)throw new CrmError(400,'future_contact')
 if(f.correctsId){const r=await c.query('SELECT kind FROM communication_records WHERE professional_id=$1 AND student_link_id=$2 AND id=$3 FOR SHARE',[owner,f.studentId,f.correctsId]);if(!r.rowCount||r.rows[0].kind!==f.kind||(await c.query('SELECT 1 FROM communication_records WHERE professional_id=$1 AND corrects_id=$2',[owner,f.correctsId])).rowCount)throw new CrmError(409,'correction')}
 return {body,context,digest:hash({fields:f,body,context})}
}
export async function preview(owner:string,fields:RecordFields){return transaction(async c=>{await ownerLock(c,owner);return prepare(c,owner,fields)})}
export async function execute(owner:string,input:CommunicationCommand):Promise<object>{
 if(input.action==='preview')return preview(owner,input.fields)
 if(input.action==='task_save'){await initializeCrm(owner);return saveTask(owner,input)}
 if(input.action==='task_status')return taskStatus(owner,input)
 return transaction(async c=>{await ownerLock(c,owner);const digest=hash(input),prior=await c.query('SELECT digest,result,invalidated_at FROM communication_operations WHERE professional_id=$1 AND operation_key=$2',[owner,input.operationKey]);if(prior.rowCount){if(prior.rows[0].invalidated_at||prior.rows[0].digest!==digest)throw new CrmError(409,'operation_key');return prior.rows[0].result}
 let result:object,student:string|null=null
 if(input.action==='template_save'){const id=input.id??randomUUID(),f=input.fields;let version=1;if(input.id){const r=await c.query('UPDATE communication_templates SET title=$3,body=$4,version=version+1,updated_at=clock_timestamp() WHERE professional_id=$1 AND id=$2 AND version=$5 AND NOT archived RETURNING version',[owner,id,f.title,f.body,input.version]);if(!r.rowCount)throw new CrmError(409,'template_version');version=r.rows[0].version}else await c.query('INSERT INTO communication_templates(id,professional_id,title,body) VALUES($1,$2,$3,$4)',[id,owner,f.title,f.body]);await c.query('INSERT INTO communication_template_versions(professional_id,template_id,version,title,body,actor_id) VALUES($1,$2,$3,$4,$5,$1)',[owner,id,version,f.title,f.body]);await audit(c,owner,'template_saved',null,id);result={id,version}}
 else if(input.action==='template_archive'){if(!(await c.query('UPDATE communication_templates SET archived=$3,version=version+1,updated_at=clock_timestamp() WHERE professional_id=$1 AND id=$2 AND version=$4 RETURNING id',[owner,input.id,input.archived,input.version])).rowCount)throw new CrmError(409,'template_version');await c.query('INSERT INTO communication_template_versions(professional_id,template_id,version,title,body,actor_id) SELECT professional_id,id,version,title,body,professional_id FROM communication_templates WHERE professional_id=$1 AND id=$2',[owner,input.id]);await audit(c,owner,input.archived?'template_archived':'template_reactivated',null,input.id);result={id:input.id}}
 else if(input.action==='record_save'){const f=input.fields,p=await prepare(c,owner,f);if(p.digest!==input.digest)throw new CrmError(409,'preview_changed');student=f.studentId;const id=randomUUID();await c.query('INSERT INTO communication_records(id,professional_id,student_link_id,kind,channel,body,occurred_at,actor_id,template_id,template_version,context,corrects_id) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7::timestamptz,clock_timestamp()),$2,$8,$9,$10,$11)',[id,owner,f.studentId,f.kind,f.channel,p.body,f.occurredAt,f.templateId,f.templateVersion,f.context,f.correctsId]);await audit(c,owner,f.correctsId?'record_corrected':'recorded',student,id);result={id}}
 else{const notificationRows=await notificationRowsFor(owner,c);const n=await c.query('SELECT source_key,student_link_id FROM('+notificationRows+')n WHERE source_key=$3',[owner,null,input.sourceKey]);if(!n.rowCount)throw new CrmError(404,'notification');student=n.rows[0].student_link_id;await studentLock(c,owner,student!);const r=await c.query('INSERT INTO communication_reads(professional_id,source_key,student_link_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING source_key',[owner,input.sourceKey,student]);if(r.rowCount)await audit(c,owner,'notification_read',student);result={read:true}}
 await c.query('INSERT INTO communication_operations(professional_id,operation_key,digest,student_link_id,result) VALUES($1,$2,$3,$4,$5)',[owner,input.operationKey,digest,student,result]);return result
 })
}
