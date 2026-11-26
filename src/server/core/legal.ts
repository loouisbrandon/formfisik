import 'server-only'
import {createHash,randomUUID} from 'node:crypto'
import type {PoolClient} from 'pg'
import {db} from '../db'
import type {LegalMetadata,LegalDocument} from '@/modules/auth/registration-contract'
import {legalAcceptance,legalDocumentSchema} from '@/modules/auth/registration-contract'
export class LegalError extends Error{constructor(readonly code:'legal_unpublished'|'legal_version_changed'){super(code)}}
export type LegalEvidence={documentIds:string[];presentedAt:string;operationId:string;issuer:string;requestId:string}
function syntheticAllowed(){
 try{const u=new URL(process.env.DATABASE_URL??'');return process.env.NODE_ENV!=='production'&&process.env.CORE_SERVICE_ENVIRONMENT==='local'&&process.env.CORE_LEGAL_SYNTHETIC_ENABLED==='true'&&['127.0.0.1','localhost'].includes(u.hostname)&&u.pathname.endsWith('_test')}catch{return false}
}
export async function legalMetadata(client?:PoolClient,lock=false):Promise<LegalMetadata & {ids:string[]}>{
 const stage=process.env.CORE_SERVICE_ENVIRONMENT
 if(!['local','staging','production'].includes(stage??''))throw new LegalError('legal_unpublished')
 const store=client??db()
 const rows=await store.query(`SELECT d.*,p.kind AS published_kind,d.effective_at<=clock_timestamp() AS effective FROM account_legal_publications p JOIN account_legal_documents d ON d.id=p.document_id WHERE p.environment=$1 ORDER BY p.kind ${lock?'FOR SHARE OF p,d':''}`,[stage])
 const available=rows.rows.length===2&&rows.rows.every(r=>r.kind===r.published_kind&&r.effective&&typeof r.content==='string'&&Buffer.byteLength(r.content,'utf8')<=12288&&createHash('sha256').update(r.content).digest('hex')===r.sha256&&(r.synthetic?syntheticAllowed()&&r.url===null:validUrl(r.url)))
 const documents:LegalDocument[]=available?rows.rows.map(r=>({kind:r.kind,version:r.version,sha256:r.sha256,title:r.title,content:r.content,url:r.url,effectiveAt:r.effective_at.toISOString(),synthetic:r.synthetic})):[]
 if(documents.some(d=>!legalDocumentSchema.safeParse(d).success))throw new LegalError('legal_unpublished')
 if(Buffer.byteLength(JSON.stringify({registrationAvailable:available,documents,reason:available?null:'legal_unpublished',acceptanceRequired:true}),'utf8')>64*1024)throw new LegalError('legal_unpublished')
 return {registrationAvailable:available&&process.env.CORE_PERSONAL_REGISTRATION_ENABLED==='true',documents,reason:available?null:'legal_unpublished',ids:available?rows.rows.map(r=>r.id):[]}
}
function validUrl(value:unknown){try{if(typeof value!=='string'||value.length>2048||/[\u0000-\u0020\u007f]/.test(value))return false;const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.hash&&url.hostname.length>0}catch{return false}}
export async function captureLegal(c:PoolClient,input:unknown,operationId:string,issuer:string,requestId:string,requireRegistration=true):Promise<LegalEvidence>{
 const legal=legalAcceptance.parse(input),current=await legalMetadata(c,true)
 if(current.ids.length!==2||(requireRegistration&&!current.registrationAvailable))throw new LegalError('legal_unpublished')
 if(!current.documents.every(d=>legal.documents.some(v=>v.kind===d.kind&&v.version===d.version&&v.sha256===d.sha256)))throw new LegalError('legal_version_changed')
 const now=(await c.query('SELECT clock_timestamp() AS now')).rows[0].now.toISOString()
 return {documentIds:current.ids,presentedAt:now,operationId,issuer,requestId}
}
export async function confirmLegal(c:PoolClient,evidence:LegalEvidence){
 const current=await legalMetadata(c,true)
 if(!current.registrationAvailable)throw new LegalError('legal_unpublished')
 if(current.ids.length!==evidence.documentIds.length||current.ids.some(id=>!evidence.documentIds.includes(id)))throw new LegalError('legal_version_changed')
}
export async function recordLegal(c:PoolClient,userId:string,evidence:LegalEvidence){
 for(const id of evidence.documentIds)await c.query("INSERT INTO account_legal_acceptances(id,user_id,document_id,operation_id,presented_at,source,service_issuer,request_id) VALUES($1,$2,$3,$4,$5,'mobile',$6,$7) ON CONFLICT(user_id,document_id) DO NOTHING",[randomUUID(),userId,id,evidence.operationId,evidence.presentedAt,evidence.issuer,evidence.requestId])
}
export async function legalStatus(c:PoolClient,userId:string){
 const current=await legalMetadata(c)
 const accepted=await c.query('SELECT document_id FROM account_legal_acceptances WHERE user_id=$1 AND document_id=ANY($2::uuid[])',[userId,current.ids])
 return {registrationAvailable:current.registrationAvailable,documents:current.documents,reason:current.reason,acceptanceRequired:current.ids.length===2&&accepted.rowCount!==current.ids.length}
}
