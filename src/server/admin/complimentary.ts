import 'server-only'
import {randomUUID} from 'node:crypto'
import {db} from '../db'
import type {Identity} from '../sessions'
import {readSession,sessionToken} from '../sessions'
import {failure,reply,jsonBody,sameOrigin,limit} from '../http'
import {complimentaryEnvironment} from '../subscriptions/complimentary'
import {locked,transaction} from '../subscriptions/store'
import {guardAdminTransaction,AdminOperationConflict} from './transaction-guard'
import {complimentaryInput} from '@/modules/admin/complimentary-schema'
export async function manageComplimentary(actorId:string,token:string,raw:unknown){
 const input=complimentaryInput.parse(raw),environment=complimentaryEnvironment()
 if(!environment)throw new AdminOperationConflict('ENVIRONMENT_DISABLED')
 return locked(input.userId,c=>transaction(c,async()=>{
  await guardAdminTransaction(c,actorId,token)
  const user=(await c.query('SELECT role,email_verified_at,disabled_at FROM users WHERE id=$1 FOR UPDATE',[input.userId])).rows[0]
  if(!user||user.role!=='professional')throw new AdminOperationConflict('PROFESSIONAL_REQUIRED')
  if(input.operation==='grant'){
   if(!user.email_verified_at||user.disabled_at||(await c.query('SELECT 1 FROM account_closures WHERE user_id=$1',[input.userId])).rowCount)throw new AdminOperationConflict('ACCOUNT_UNAVAILABLE')
   // Same advisory lock as Checkout/reconciliation: no courtesy over an existing contract or open checkout.
   if((await c.query(`SELECT 1 FROM billing_accounts a WHERE a.user_id=$1 AND (
    EXISTS(SELECT 1 FROM billing_subscriptions s WHERE s.account_id=a.id AND s.provider_status NOT IN ('canceled','incomplete_expired'))
    OR EXISTS(SELECT 1 FROM billing_checkouts x WHERE x.account_id=a.id AND x.state IN ('creating','open'))
    OR EXISTS(SELECT 1 FROM billing_invoices i WHERE i.account_id=a.id AND i.status='open' AND i.amount_due>i.amount_paid))`,[input.userId])).rowCount)throw new AdminOperationConflict('BILLING_EXISTS')
   if(input.expiresAt&&(await c.query('SELECT $1::timestamptz<=clock_timestamp() AS past',[input.expiresAt])).rows[0].past)throw new AdminOperationConflict('FUTURE_EXPIRY_REQUIRED')
   if((await c.query('SELECT 1 FROM complimentary_access_grants WHERE user_id=$1 AND environment=$2 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>clock_timestamp())',[input.userId,environment])).rowCount)throw new AdminOperationConflict('ACTIVE_GRANT_EXISTS')
   // Expired grants remain in history, but must release the single unrevoked grant slot.
   const expired=await c.query('UPDATE complimentary_access_grants SET revoked_at=clock_timestamp() WHERE user_id=$1 AND environment=$2 AND revoked_at IS NULL RETURNING id',[input.userId,environment])
   for(const row of expired.rows)await c.query("INSERT INTO complimentary_access_events(grant_id,operation,authorization_reference,actor_id,justification) VALUES($1,'revoked',$2,$3,$4)",[row.id,randomUUID(),actorId,input.justification])
   const id=randomUUID(),reference=randomUUID()
   await c.query("INSERT INTO complimentary_access_grants(id,user_id,environment,reason,authorization_reference,expires_at) VALUES($1,$2,$3,'owner_authorized_test',$4,$5)",[id,input.userId,environment,reference,input.expiresAt])
   await c.query("INSERT INTO complimentary_access_events(grant_id,operation,authorization_reference,actor_id,justification) VALUES($1,'granted',$2,$3,$4)",[id,reference,actorId,input.justification]);return {id}
  }
  const row=(await c.query('UPDATE complimentary_access_grants SET revoked_at=clock_timestamp() WHERE id=$1 AND user_id=$2 AND environment=$3 AND revoked_at IS NULL RETURNING id',[input.grantId,input.userId,environment])).rows[0]
  if(!row)throw new AdminOperationConflict('STALE_GRANT')
  await c.query("INSERT INTO complimentary_access_events(grant_id,operation,authorization_reference,actor_id,justification) VALUES($1,'revoked',$2,$3,$4)",[row.id,randomUUID(),actorId,input.justification])
  await c.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE user_id=$1 AND revoked_at IS NULL',[input.userId]);return {id:row.id as string}
 }))
}
export async function complimentaryHandler(request:Request){try{
 if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token)
 if(!user||!token)return reply({message:'Entre novamente.'},401)
 if(user.role!=='admin')return reply({message:'Acesso não permitido.'},403)
 await limit('admin-courtesy:'+user.id,20,900)
 const input=complimentaryInput.safeParse(await jsonBody(request));if(!input.success)return reply({message:'Confira o profissional, o prazo e a justificativa (10 a 1000 caracteres).'},400)
 await manageComplimentary(user.id,token,input.data);return reply({message:input.data.operation==='grant'?'Cortesia concedida.':'Cortesia revogada e sessões encerradas.'},200)
 }catch(e){if(e instanceof AdminOperationConflict)return reply({message:'Não foi possível alterar: confira o ambiente, a confirmação e o bloqueio da conta, a existência de assinatura ou cortesia e se o prazo está no futuro. Atualize antes de tentar novamente.'},409);return failure(e,'admin_courtesy_unavailable')}}
export async function adminComplimentary(user:Identity,page:number,selected?:string,professional?:string){
 if(user.role!=='admin')throw Error('ADMIN_ACCESS_DENIED')
 const environment=complimentaryEnvironment()
 if(!environment)return {environment:null,items:[],total:0,pages:1,selected:null,target:null,events:[]}
 const target=professional?(await db().query("SELECT id,full_name FROM users WHERE id=$1 AND role='professional'",[professional])).rows[0]:null
 const result=await db().query(`WITH grants AS (SELECT g.id,g.user_id,u.full_name,g.granted_at,g.expires_at,g.revoked_at,
 CASE WHEN g.revoked_at IS NOT NULL THEN 'revoked' WHEN g.expires_at<=clock_timestamp() THEN 'expired' ELSE 'active' END AS state
 FROM complimentary_access_grants g LEFT JOIN users u ON u.id=g.user_id WHERE g.environment=$1)
 SELECT (SELECT count(*)::int FROM grants) AS total,
 coalesce((SELECT json_agg(x) FROM (SELECT * FROM grants ORDER BY granted_at DESC,id LIMIT 10 OFFSET $2) x),'[]') AS items`,[environment,(page-1)*10])
 const r=result.rows[0]
 const events=selected?(await db().query(`SELECT e.operation,e.justification,e.occurred_at,u.full_name AS actor FROM complimentary_access_events e JOIN complimentary_access_grants g ON g.id=e.grant_id LEFT JOIN users u ON u.id=e.actor_id WHERE g.id=$1 AND g.environment=$2 ORDER BY e.occurred_at DESC,e.id DESC LIMIT 10`,[selected,environment])).rows.map(e=>({operation:String(e.operation),justification:e.justification as string|null,at:(e.occurred_at as Date).toISOString(),actor:e.actor as string|null})):[]
 return {environment,target:target?{id:String(target.id),name:String(target.full_name)}:null,items:r.items as {id:string;user_id:string;full_name:string|null;granted_at:string;expires_at:string|null;revoked_at:string|null;state:string}[],total:Number(r.total),pages:Math.max(1,Math.ceil(r.total/10)),selected:selected??null,events}
}
export type ComplimentaryData=Awaited<ReturnType<typeof adminComplimentary>>
