import 'server-only'
import {createHash,randomUUID} from 'node:crypto'
import type {PoolClient} from 'pg'
import {transaction} from '../exercises/repository'
import {db} from '../db'
import type {Settings,Stage} from '@/modules/crm/schema'
export class CrmError extends Error{constructor(public status=409,public code='conflict'){super('CRM_OPERATION_REJECTED')}}
export const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
export async function ownerLock(c:PoolClient,owner:string){if(!(await c.query("SELECT 1 FROM users WHERE id=$1 AND role='professional' AND email_verified_at IS NOT NULL AND disabled_at IS NULL FOR SHARE",[owner])).rowCount)throw new CrmError(403,'account');await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,18018))',[owner])}
export async function audit(c:PoolClient,owner:string,kind:string,options:{student?:string;task?:string;from?:string;to?:string;origin?:string;validation?:unknown}={}){await c.query('INSERT INTO crm_events(professional_id,actor_id,kind,student_link_id,task_id,from_stage_id,to_stage_id,origin,validation) VALUES($1,$1,$2,$3,$4,$5,$6,$7,$8)',[owner,kind,options.student??null,options.task??null,options.from??null,options.to??null,options.origin??'manual',options.validation??{}])}
export async function initializeCrm(owner:string){if((await db().query('SELECT 1 FROM crm_settings WHERE professional_id=$1',[owner])).rowCount)return;return transaction(async c=>{
 // Canonical registration acquires 813008 first: maintain this order at initialization.
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,813008))',[owner]);await ownerLock(c,owner)
 if((await c.query('SELECT 1 FROM crm_settings WHERE professional_id=$1',[owner])).rowCount)return
 const names=['Novo aluno','Aguardando anamnese','Preparação de treino','Pronto para atendimento','Em acompanhamento','Atendimento concluído'],ids=names.map(()=>randomUUID())
 for(let i=0;i<names.length;i++)await c.query('INSERT INTO crm_stages(id,professional_id,name,name_key,description,color,position,rules) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[ids[i],owner,names[i],names[i].toLocaleLowerCase('pt-BR'),'Etapa operacional; não altera estados dos módulos.',(['lime','blue','violet','amber','lime','slate'])[i],i+1,JSON.stringify(i===3?[{key:'intake_reviewed',mode:'info'},{key:'workout_active',mode:'info'},{key:'assessment_recent',mode:'info'}]:[])])
 await c.query('INSERT INTO crm_settings(professional_id,initial_stage_id) VALUES($1,$2)',[owner,ids[0]])
 await c.query('INSERT INTO crm_memberships(professional_id,student_link_id,stage_id) SELECT professional_id,id,$2 FROM student_links WHERE professional_id=$1',[owner,ids[0]])
 await c.query("INSERT INTO crm_events(professional_id,actor_id,student_link_id,to_stage_id,kind,origin) SELECT professional_id,professional_id,student_link_id,stage_id,'enrolled','initialization' FROM crm_memberships WHERE professional_id=$1",[owner])
})}
export async function configuration(owner:string,c?:PoolClient){const runner=c??db();const s=await runner.query('SELECT version,initial_stage_id,recent_days,auto_review,auto_workout,auto_assessment FROM crm_settings WHERE professional_id=$1',[owner]);if(!s.rowCount)throw new CrmError(409,'initialize');const stages=await runner.query('SELECT id,name,description,color,position,active,archived,operator,rules FROM crm_stages WHERE professional_id=$1 ORDER BY position,id',[owner]);return {settings:s.rows[0] as Settings,stages:stages.rows as Stage[]}}
export async function checkBoard(c:PoolClient,owner:string,version:number){const r=await c.query('SELECT version FROM crm_settings WHERE professional_id=$1 FOR UPDATE',[owner]);if(!r.rowCount||r.rows[0].version!==version)throw new CrmError(409,'board_version')}
export async function bump(c:PoolClient,owner:string){await c.query('UPDATE crm_settings SET version=version+1 WHERE professional_id=$1',[owner])}
export async function studentLock(c:PoolClient,owner:string,id:string){const r=await c.query('SELECT id,status FROM student_links WHERE professional_id=$1 AND id=$2 FOR SHARE',[owner,id]);if(!r.rowCount)throw new CrmError(404,'not_found');if(r.rows[0].status!=='active')throw new CrmError(409,'student_archived')}
export async function mutation<T extends object>(owner:string,key:string,input:unknown,subject:string|null,fn:(c:PoolClient)=>Promise<T>):Promise<T>{return transaction(async c=>{await ownerLock(c,owner);const digest=hash(input),prior=await c.query('SELECT digest,result,invalidated_at FROM crm_operations WHERE professional_id=$1 AND operation_key=$2',[owner,key]);if(prior.rowCount){const p=prior.rows[0];if(p.invalidated_at||p.digest!==digest)throw new CrmError(409,'operation_key');return p.result as T}const result=await fn(c);await c.query('INSERT INTO crm_operations(professional_id,operation_key,digest,subject_id,result) VALUES($1,$2,$3,$4,$5)',[owner,key,digest,subject,result]);return result})}
export {transaction}
