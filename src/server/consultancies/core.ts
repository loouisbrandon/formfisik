import 'server-only'
import {randomUUID} from 'node:crypto'
import type {PoolClient} from 'pg'
import {db} from '../db'
import {transaction,ownerLock,hash} from '../crm/core'
export class CommercialError extends Error{constructor(public status=409,public code='conflict'){super('COMMERCIAL_OPERATION_REJECTED')}}
export const missing=()=>new CommercialError(404,'not_found')
export async function student(c:PoolClient,owner:string,id:string,active=true){const r=await c.query('SELECT status FROM student_links WHERE professional_id=$1 AND id=$2 FOR SHARE',[owner,id]);if(!r.rowCount)throw missing();if(active&&r.rows[0].status!=='active')throw new CommercialError(409,'student_archived')}
export async function operation<T extends object>(owner:string,key:string,input:unknown,subject:string|null,work:(c:PoolClient)=>Promise<T>){return transaction(async c=>{await ownerLock(c,owner);const digest=hash(input),r=await c.query('SELECT digest,result,invalidated_at FROM professional_commercial_operations WHERE professional_id=$1 AND operation_key=$2',[owner,key]);if(r.rowCount){if(r.rows[0].invalidated_at||r.rows[0].digest!==digest)throw new CommercialError(409,'operation_key');return r.rows[0].result as T}const result=await work(c);await c.query('INSERT INTO professional_commercial_operations(professional_id,operation_key,digest,student_link_id,result) VALUES($1,$2,$3,$4,$5)',[owner,key,digest,subject??((result as Record<string,unknown>).studentId as string|undefined)??null,result]);return result})}
export async function audit(c:PoolClient,owner:string,kind:string,version:number,refs:{student?:string;service?:string;plan?:string;contract?:string;delivery?:string;detail?:object;reason?:string}={}){await c.query('INSERT INTO professional_commercial_events(professional_id,actor_id,kind,version,student_link_id,service_id,plan_id,contract_id,delivery_id,detail,reason) VALUES($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[owner,kind,version,refs.student??null,refs.service??null,refs.plan??null,refs.contract??null,refs.delivery??null,refs.detail??{},refs.reason??''])}
export const todaySql="(clock_timestamp() AT TIME ZONE 'America/Sao_Paulo')::date"
export const effectiveState=(alias='c')=>`CASE WHEN ${alias}.state IN('active','suspended') AND ${alias}.ends_on<${todaySql} THEN 'expired' WHEN ${alias}.state='active' AND ${alias}.starts_on>${todaySql} THEN 'scheduled' ELSE ${alias}.state END`
export const newId=randomUUID
export {db,transaction}
