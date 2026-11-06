import 'server-only'
import {randomUUID} from 'node:crypto'
import type {PoolClient} from 'pg'
import type {StageFields,MovePreview,Stage,Settings} from '@/modules/crm/schema'
import {audit,bump,checkBoard,configuration,CrmError,hash,mutation,ownerLock,transaction} from './core'
import {conditions,fact,factsSql,type Fact} from './facts'
export async function saveStage(owner:string,input:{operationKey:string;boardVersion:number;id?:string;fields:StageFields}){return mutation(owner,input.operationKey,input,null,async c=>{
 await checkBoard(c,owner,input.boardVersion);const cfg=await configuration(owner,c),old=cfg.stages.find(s=>s.id===input.id)
 if(input.id&&(!old||old.archived))throw new CrmError(404,'not_found')
 if(old?.id===cfg.settings.initial_stage_id&&!input.fields.active)throw new CrmError(409,'initial_stage')
 if(input.fields.active&&!old?.active&&cfg.stages.filter(s=>s.active).length>=16)throw new CrmError(422,'stage_limit')
 if(!old&&cfg.stages.length>=40)throw new CrmError(422,'stage_limit')
 const nameKey=input.fields.name.toLocaleLowerCase('pt-BR').replace(/\s+/g,' ')
 if(cfg.stages.some(s=>!s.archived&&s.id!==old?.id&&s.name.toLocaleLowerCase('pt-BR').replace(/\s+/g,' ')===nameKey))throw new CrmError(409,'stage_name')
 const id=old?.id??randomUUID(),f=input.fields
 if(old)await c.query('UPDATE crm_stages SET name=$3,name_key=$4,description=$5,color=$6,active=$7,rules=$8,operator=$9 WHERE professional_id=$1 AND id=$2',[owner,id,f.name,nameKey,f.description,f.color,f.active,JSON.stringify(f.rules),f.operator])
 else await c.query('INSERT INTO crm_stages(id,professional_id,name,name_key,description,color,active,rules,operator,position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,owner,f.name,nameKey,f.description,f.color,f.active,JSON.stringify(f.rules),f.operator,Math.max(0,...cfg.stages.map(s=>s.position))+1])
 await audit(c,owner,old?'stage_edited':'stage_created',{to:id});await bump(c,owner);return {id}
})}
export async function reorderStages(owner:string,input:{operationKey:string;boardVersion:number;ids:string[]}){return mutation(owner,input.operationKey,input,null,async c=>{await checkBoard(c,owner,input.boardVersion);const cfg=await configuration(owner,c),ids=cfg.stages.filter(s=>!s.archived).map(s=>s.id);if(new Set(input.ids).size!==ids.length||input.ids.length!==ids.length||input.ids.some(id=>!ids.includes(id)))throw new CrmError(400,'stage_order');await c.query('UPDATE crm_stages s SET position=u.position FROM unnest($2::uuid[]) WITH ORDINALITY u(id,position) WHERE s.professional_id=$1 AND s.id=u.id',[owner,input.ids]);await bump(c,owner);await audit(c,owner,'stages_reordered');return {saved:true}})}
export async function settings(owner:string,input:{operationKey:string;boardVersion:number;initialStageId:string;recentDays:number;autoReview:boolean;autoWorkout:boolean;autoAssessment:boolean}){return mutation(owner,input.operationKey,input,null,async c=>{await checkBoard(c,owner,input.boardVersion);if(!(await c.query('SELECT 1 FROM crm_stages WHERE professional_id=$1 AND id=$2 AND active AND NOT archived',[owner,input.initialStageId])).rowCount)throw new CrmError(404,'not_found');await c.query('UPDATE crm_settings SET initial_stage_id=$2,recent_days=$3,auto_review=$4,auto_workout=$5,auto_assessment=$6,version=version+1 WHERE professional_id=$1',[owner,input.initialStageId,input.recentDays,input.autoReview,input.autoWorkout,input.autoAssessment]);await audit(c,owner,'settings_changed');return {saved:true}})}
async function position(c:PoolClient,owner:string,id:string,allowArchived=false){const r=await c.query('SELECT m.*,l.status FROM crm_memberships m JOIN student_links l ON l.id=m.student_link_id AND l.professional_id=m.professional_id WHERE m.professional_id=$1 AND m.student_link_id=$2 FOR UPDATE OF m FOR SHARE OF l',[owner,id]);if(!r.rowCount)throw new CrmError(404,'not_found');if(!allowArchived&&r.rows[0].status!=='active')throw new CrmError(409,'student_archived');return r.rows[0] as {stage_id:string;version:number;entered_at:Date}}
function evaluate(cfg:{stages:Stage[];settings:Settings},f:Fact,to:string):MovePreview{
 const source=cfg.stages.find(s=>s.id===f.stage_id),target=cfg.stages.find(s=>s.id===to)
 if(!source||!target||!target.active||target.archived||source.id===target.id)throw new CrmError(409,'stage_unavailable')
 const results=conditions(source,target,f,cfg.settings.recent_days)
 return {studentId:f.id,version:f.version,boardVersion:cfg.settings.version,from:source.id,to:target.id,allowed:results.filter(r=>r.mode==='entry'||r.mode==='exit').every(r=>r.passed),recommendationRequired:results.some(r=>r.mode==='recommended'&&!r.passed),results}
}
export async function previewMove(owner:string,studentId:string,to:string){return transaction(async c=>{await ownerLock(c,owner);await position(c,owner,studentId);const cfg=await configuration(owner,c),f=await fact(c,owner,studentId);return evaluate(cfg,f,to)})}
export async function move(owner:string,input:{operationKey:string;boardVersion:number;studentId:string;version:number;to:string;acknowledgedRecommendations:boolean;confirmed:true}){return mutation(owner,input.operationKey,input,input.studentId,async c=>{await checkBoard(c,owner,input.boardVersion);const p=await position(c,owner,input.studentId);if(p.version!==input.version)throw new CrmError(409,'position_version');const cfg=await configuration(owner,c),f=await fact(c,owner,input.studentId),evaluation=evaluate(cfg,f,input.to)
 if(!evaluation.allowed)throw new CrmError(422,'conditions');if(evaluation.recommendationRequired&&!input.acknowledgedRecommendations)throw new CrmError(422,'recommendations')
 await c.query('UPDATE crm_memberships SET stage_id=$3,version=version+1,entered_at=clock_timestamp() WHERE professional_id=$1 AND student_link_id=$2',[owner,input.studentId,input.to]);await audit(c,owner,'moved',{student:input.studentId,from:p.stage_id,to:input.to,validation:{results:evaluation.results,durationSeconds:Math.max(0,(Date.now()-p.entered_at.getTime())/1000)}});return {studentId:input.studentId,version:p.version+1}
})}
async function transferPreview(c:PoolClient,owner:string,stageId:string,to:string|undefined){const cfg=await configuration(owner,c),source=cfg.stages.find(s=>s.id===stageId);if(!source||source.archived)throw new CrmError(404,'not_found');if(cfg.settings.initial_stage_id===stageId)throw new CrmError(409,'initial_stage')
 const total=Number((await c.query('SELECT count(*) FROM crm_memberships WHERE professional_id=$1 AND stage_id=$2',[owner,stageId])).rows[0].count)
 const rows=await c.query(factsSql+' SELECT * FROM facts WHERE stage_id=$2 ORDER BY id LIMIT 100',[owner,stageId]);if(total&&!to)throw new CrmError(400,'target_required')
 const evaluations=rows.rows.map(r=>evaluate(cfg,r as Fact,to!)),digest=hash({stageId,to,boardVersion:cfg.settings.version,rows:evaluations})
 return {boardVersion:cfg.settings.version,total,batchSize:rows.rowCount??0,remaining:Math.max(0,total-100),allowed:evaluations.every(e=>e.allowed),recommendationRequired:evaluations.some(e=>e.recommendationRequired),digest,sample:rows.rows.slice(0,10).map(r=>({id:r.id,name:r.full_name})),evaluations}
}
export async function previewArchive(owner:string,stageId:string,to?:string){return transaction(async c=>{await ownerLock(c,owner);const p=await transferPreview(c,owner,stageId,to);const blockers:Record<string,number>={};for(const e of p.evaluations)for(const r of e.results)if(!r.passed&&(r.mode==='entry'||r.mode==='exit'))for(const check of r.checks)if(!check.passed)blockers[check.key]=(blockers[check.key]??0)+1;return {...p,blockers,evaluations:p.evaluations.slice(0,10)}})}
export async function archiveStage(owner:string,input:{operationKey:string;boardVersion:number;stageId:string;to?:string;digest:string;acknowledgedRecommendations:boolean;confirmed:true}){return mutation(owner,input.operationKey,input,null,async c=>{
 await checkBoard(c,owner,input.boardVersion);const p=await transferPreview(c,owner,input.stageId,input.to)
 if(p.digest!==input.digest)throw new CrmError(409,'preview_changed');if(!p.allowed)throw new CrmError(422,'conditions');if(p.recommendationRequired&&!input.acknowledgedRecommendations)throw new CrmError(422,'recommendations')
 for(const e of p.evaluations){await position(c,owner,e.studentId,true);await c.query('UPDATE crm_memberships SET stage_id=$3,version=version+1,entered_at=clock_timestamp() WHERE professional_id=$1 AND student_link_id=$2',[owner,e.studentId,input.to]);await audit(c,owner,'moved',{student:e.studentId,from:input.stageId,to:input.to,validation:{results:e.results,transfer:true}})}
 const archived=p.remaining===0;await c.query('UPDATE crm_stages SET active=false,archived=$3 WHERE professional_id=$1 AND id=$2',[owner,input.stageId,archived]);await bump(c,owner);await audit(c,owner,archived?'stage_archived':'stage_deactivated',{from:input.stageId});return {archived,moved:p.batchSize,remaining:p.remaining}
})}
