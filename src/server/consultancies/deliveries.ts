import 'server-only'
import type {PoolClient} from 'pg'
import {audit,CommercialError,missing,newId,operation} from './core'
import {contractWritable,contractRecord} from './contracts'
import {student} from './core'
export type Evidence={type:'workout'|'assessment'|'intake';id:string;version:number}
export async function deliveryRecord(c:PoolClient,owner:string,id:string){const r=await c.query('SELECT d.*,to_char(due_on,\'YYYY-MM-DD\') AS due FROM professional_deliveries d WHERE professional_id=$1 AND id=$2 FOR UPDATE',[owner,id]);if(!r.rowCount)throw missing();return r.rows[0]}
export async function evidenceRecord(c:PoolClient,owner:string,studentId:string,e:Evidence,lock=false){
 if(e.type==='workout'){const r=await c.query(`SELECT v.version,to_char(v.created_at AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS date,p.state AS current_state FROM workout_versions v JOIN workout_plans p ON p.owner_id=v.owner_id AND p.id=v.plan_id WHERE v.owner_id=$1 AND v.plan_id=$2 AND v.version=$3 AND v.state='active' AND p.kind='individual' AND p.student_link_id=$4${lock?' FOR SHARE OF p':''}`,[owner,e.id,e.version,studentId]);if(!r.rowCount)throw missing();return r.rows[0]}
 if(e.type==='assessment'){const r=await c.query(`SELECT version,to_char(assessment_date,'YYYY-MM-DD') AS date,state AS current_state FROM physical_assessments WHERE professional_id=$1 AND id=$2 AND version=$3 AND student_link_id=$4 AND state='active'${lock?' FOR SHARE':''}`,[owner,e.id,e.version,studentId]);if(!r.rowCount)throw missing();return r.rows[0]}
 const r=await c.query(`SELECT v.number AS version,to_char((SELECT max(occurred_at) FROM intake_events WHERE professional_id=$1 AND request_id=r.id AND kind='reviewed') AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS date,r.state AS current_state FROM intake_requests r JOIN intake_versions v ON v.professional_id=r.professional_id AND v.id=r.version_id WHERE r.professional_id=$1 AND r.id=$2 AND v.number=$3 AND r.student_link_id=$4 AND r.state='reviewed' AND r.revoked_at IS NULL${lock?' FOR SHARE OF r':''}`,[owner,e.id,e.version,studentId]);if(!r.rowCount||!r.rows[0].date)throw missing();return r.rows[0]
}
export async function changeDelivery(owner:string,input:{operationKey:string;id:string;version:number;action:'start'|'cancel'|'reopen'|'execute';reason:string;units?:number;evidence?:Evidence;confirmed:true}){return operation(owner,input.operationKey,input,null,async c=>{const d=await deliveryRecord(c,owner,input.id);if(d.version!==input.version)throw new CommercialError(409,'version');const contract=await contractWritable(c,owner,d.contract_id);let state=d.state,completedAt:string|null=null
 if(input.action==='start'){if(d.state!=='pending')throw new CommercialError(409,'transition');state='in_progress'}
 if(input.action==='cancel'){if(!['pending','in_progress'].includes(d.state)||input.reason.length<5)throw new CommercialError(409,'transition');state='canceled'}
 if(input.action==='reopen'){if(!['completed','canceled'].includes(d.state)||input.reason.length<5)throw new CommercialError(409,'reason');await c.query('UPDATE professional_delivery_executions SET voided_at=clock_timestamp(),void_reason=$3 WHERE professional_id=$1 AND delivery_id=$2 AND voided_at IS NULL',[owner,input.id,input.reason]);state='pending'}
 if(input.action==='execute'&&!input.evidence&&!['workout','assessment','intake'].includes(d.type)){const result=await manualExecution(c,owner,d,input.units??0,input.reason);return {id:d.id,version:result.version,studentId:d.student_link_id}}
 if(input.action==='execute'){if(!['pending','in_progress'].includes(d.state))throw new CommercialError(409,'transition');const units=input.units;if(!units||!Number.isInteger(units)||units<1||units>1000)throw new CommercialError(400,'units');const sum=Number((await c.query('SELECT COALESCE(sum(units),0) AS n FROM professional_delivery_executions WHERE professional_id=$1 AND delivery_id=$2 AND voided_at IS NULL',[owner,input.id])).rows[0].n);if(sum+units>d.quantity)throw new CommercialError(422,'units');const needs=['workout','assessment','intake'].includes(d.type);if(needs&&(!input.evidence||input.evidence.type!==d.type)||!input.evidence&&input.reason.length<5)throw new CommercialError(422,'evidence');let date:string|null=null
 if(input.evidence){if(units!==1)throw new CommercialError(422,'evidence_units');const e=await evidenceRecord(c,owner,d.student_link_id,input.evidence,true);date=e.date;if(date!<contract.start||date!>contract.finish||input.evidence.type==='workout'&&e.current_state!=='active')throw new CommercialError(422,'evidence_period');if((await c.query('SELECT 1 FROM professional_delivery_executions WHERE professional_id=$1 AND delivery_id=$2 AND evidence_type=$3 AND evidence_id=$4 AND evidence_version=$5 AND voided_at IS NULL',[owner,input.id,input.evidence.type,input.evidence.id,input.evidence.version])).rowCount)throw new CommercialError(409,'evidence_duplicate')}
 await c.query('INSERT INTO professional_delivery_executions(id,professional_id,delivery_id,student_link_id,units,evidence_type,evidence_id,evidence_version,evidence_date,note,actor_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$2)',[newId(),owner,input.id,d.student_link_id,units,input.evidence?.type??null,input.evidence?.id??null,input.evidence?.version??null,date,input.reason]);state=sum+units===d.quantity?'completed':'in_progress';completedAt=state==='completed'?'yes':null}
 await c.query('UPDATE professional_deliveries SET state=$3,completed_at=CASE WHEN $4::text IS NOT NULL THEN clock_timestamp() ELSE NULL END,version=version+1 WHERE professional_id=$1 AND id=$2',[owner,input.id,state,completedAt]);await audit(c,owner,'delivery_'+input.action,d.version+1,{student:d.student_link_id,contract:d.contract_id,delivery:d.id,detail:{from:d.state,to:state,units:input.units??null,evidenceType:input.evidence?.type??null},reason:input.action==='reopen'||input.action==='cancel'?input.reason:''});return {id:d.id,version:d.version+1,studentId:d.student_link_id}})}

/** Shared manual execution invariant; caller must establish the applicable contract/time authorization. */
async function manualExecution(c:PoolClient,owner:string,d:Awaited<ReturnType<typeof deliveryRecord>>,units:number,reason:string){
 if(!['pending','in_progress'].includes(d.state))throw new CommercialError(409,'transition')
 if(['workout','assessment','intake'].includes(d.type)||reason.trim().length<5)throw new CommercialError(422,'evidence')
 if(!Number.isInteger(units)||units<1||units>1000)throw new CommercialError(400,'units')
 const sum=Number((await c.query('SELECT COALESCE(sum(units),0) AS n FROM professional_delivery_executions WHERE professional_id=$1 AND delivery_id=$2 AND voided_at IS NULL',[owner,d.id])).rows[0].n)
 if(sum+units>d.quantity)throw new CommercialError(422,'units')
 const executionId=newId(),state=sum+units===d.quantity?'completed':'in_progress'
 await c.query('INSERT INTO professional_delivery_executions(id,professional_id,delivery_id,student_link_id,units,note,actor_id) VALUES($1,$2,$3,$4,$5,$6,$2)',[executionId,owner,d.id,d.student_link_id,units,reason])
 await c.query("UPDATE professional_deliveries SET state=$3,completed_at=CASE WHEN $3='completed' THEN clock_timestamp() ELSE NULL END,version=version+1 WHERE professional_id=$1 AND id=$2",[owner,d.id,state])
 await audit(c,owner,'delivery_execute',d.version+1,{student:d.student_link_id,contract:d.contract_id,delivery:d.id,detail:{from:d.state,to:state,units,evidenceType:null}})
 return {executionId,version:d.version+1}
}
/** Agenda021 authorizes by the effective date, never by a client-selectable bypass on the 019 endpoint. */
export async function fulfillSessionAttendance(c:PoolClient,owner:string,input:{deliveryId:string;deliveryVersion:number;studentId:string;contractId:string;date:string;reason:string}){
 const d=await deliveryRecord(c,owner,input.deliveryId)
 if(d.version!==input.deliveryVersion||d.type!=='session'||d.student_link_id!==input.studentId||d.contract_id!==input.contractId)throw new CommercialError(409,'version')
 const contract=await contractRecord(c,owner,d.contract_id);await student(c,owner,input.studentId)
 if(contract.state!=='active'||input.date<contract.start||input.date>contract.finish)throw new CommercialError(409,'contract_inactive')
 return (await manualExecution(c,owner,d,1,input.reason)).executionId
}

/** Explicit reversal of this agenda execution only, preserving other executions and the immutable original. */
export async function reverseSessionAttendance(c:PoolClient,owner:string,input:{executionId:string;deliveryId:string;deliveryVersion:number;reason:string}){
 const d=await deliveryRecord(c,owner,input.deliveryId),contract=await contractRecord(c,owner,d.contract_id)
 if(d.version!==input.deliveryVersion||d.type!=='session'||!['active','suspended'].includes(contract.state)||input.reason.trim().length<5)throw new CommercialError(409,'version')
 const r=await c.query('UPDATE professional_delivery_executions SET voided_at=clock_timestamp(),void_reason=$4 WHERE professional_id=$1 AND id=$2 AND delivery_id=$3 AND voided_at IS NULL RETURNING units',[owner,input.executionId,input.deliveryId,input.reason]);if(!r.rowCount)throw new CommercialError(409,'version')
 const sum=Number((await c.query('SELECT COALESCE(sum(units),0) AS n FROM professional_delivery_executions WHERE professional_id=$1 AND delivery_id=$2 AND voided_at IS NULL',[owner,d.id])).rows[0].n),state=sum>=d.quantity?'completed':sum>0?'in_progress':'pending'
 await c.query("UPDATE professional_deliveries SET state=$3,completed_at=CASE WHEN $3='completed' THEN completed_at ELSE NULL END,version=version+1 WHERE professional_id=$1 AND id=$2",[owner,d.id,state]);await audit(c,owner,'delivery_execution_voided',d.version+1,{student:d.student_link_id,contract:d.contract_id,delivery:d.id,reason:input.reason,detail:{from:d.state,to:state,units:r.rows[0].units}})
}
