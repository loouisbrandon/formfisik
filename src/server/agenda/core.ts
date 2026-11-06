import 'server-only'
import type {PoolClient} from 'pg'
import {randomUUID} from 'node:crypto'
import {db} from '../db'
import {transaction,ownerLock,hash} from '../crm/core'
import {defaultAvailability} from '@/modules/agenda/schema'
export class AgendaError extends Error{constructor(public status:number,public code:string){super('AGENDA_OPERATION_REJECTED')}}
export const missing=()=>new AgendaError(404,'not_found')
export async function initialize(c:PoolClient,owner:string){await c.query('INSERT INTO agenda_settings(professional_id,weekly) VALUES($1,$2) ON CONFLICT DO NOTHING',[owner,JSON.stringify(defaultAvailability().weekly)])}
export async function settings(c:PoolClient,owner:string){await initialize(c,owner);return (await c.query('SELECT timezone,weekly,version FROM agenda_settings WHERE professional_id=$1',[owner])).rows[0] as {timezone:string;weekly:ReturnType<typeof defaultAvailability>['weekly'];version:number}}
export async function audit(c:PoolClient,owner:string,kind:string,version:number,options:{student?:string|null;occurrence?:string;detail?:object;reason?:string}={}){await c.query('INSERT INTO agenda_events(professional_id,actor_id,kind,version,student_link_id,occurrence_id,detail,reason) VALUES($1,$1,$2,$3,$4,$5,$6,$7)',[owner,kind,version,options.student??null,options.occurrence??null,options.detail??{},options.reason??''])}
export async function mutation<T extends object>(owner:string,key:string,input:unknown,subject:string|null,fn:(c:PoolClient)=>Promise<T>){return transaction(async c=>{await ownerLock(c,owner);await initialize(c,owner);const digest=hash(input),old=await c.query('SELECT digest,result,invalidated_at FROM agenda_operations WHERE professional_id=$1 AND operation_key=$2',[owner,key]);if(old.rowCount){if(old.rows[0].invalidated_at||old.rows[0].digest!==digest)throw new AgendaError(409,'operation_key');return old.rows[0].result as T}const result=await fn(c);await c.query('INSERT INTO agenda_operations(professional_id,operation_key,digest,student_link_id,result) VALUES($1,$2,$3,$4,$5)',[owner,key,digest,subject??((result as Record<string,unknown>).studentId as string|undefined)??null,result]);return result})}
export async function occurrence(c:PoolClient,owner:string,id:string){const r=await c.query("SELECT *,to_char(local_date,'YYYY-MM-DD') AS date FROM agenda_occurrences WHERE professional_id=$1 AND id=$2 FOR UPDATE",[owner,id]);if(!r.rowCount)throw missing();return r.rows[0]}
export {db,transaction,ownerLock,hash,randomUUID}
