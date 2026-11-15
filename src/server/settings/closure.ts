import 'server-only'
import argon2 from 'argon2'
import { randomUUID } from 'node:crypto'
import { z } from '@/lib/validation'
import { db } from '../db'
import { locked, transaction } from '../subscriptions/store'
import { cancelSubscription } from '../subscriptions/management'
import { subscriptionStatus } from '../subscriptions/status'
import type { BillingGateway } from '../subscriptions/stripe'
import { readSession, sessionToken, sessionDigest, clearSessionCookie } from '../sessions'
import { sameOrigin, jsonBody, reply, failure, limit } from '../http'

const input = z.object({ currentPassword:z.string().min(1).max(128), confirmation:z.literal('EXCLUIR MINHA CONTA') }).strict()
export class ClosureConflict extends Error {}
export class ClosureUnauthorized extends Error {}

export async function closureStatus(userId:string) {
 const row=(await db().query('SELECT effective_at,state FROM account_closures WHERE user_id=$1',[userId])).rows[0]
 return row?{effectiveAt:row.effective_at.toISOString() as string,state:row.state as 'scheduled'|'closed'}:null
}
async function guard(c:import('pg').PoolClient,userId:string,hash:string,password:string) {
 const row=(await c.query("SELECT u.id,c.password_hash FROM users u JOIN credentials c ON c.user_id=u.id WHERE u.id=$1 AND u.role='professional' AND u.disabled_at IS NULL AND u.email_verified_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) FOR UPDATE OF u",[userId])).rows[0]
 if(!row||!await argon2.verify(row.password_hash,password))throw new ClosureUnauthorized()
 const live=await c.query("SELECT 1 FROM sessions WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL AND expires_at>clock_timestamp() AND last_seen_at>clock_timestamp()-interval '30 minutes'",[userId,hash])
 if(!live.rowCount)throw new ClosureUnauthorized()
}
/** Session + password checked before provider I/O and again under the account lock. */
export async function requestClosure(userId:string,hash:string,password:string,gateway?:BillingGateway) {
 await locked(userId,c=>transaction(c,()=>guard(c,userId,hash,password)))
 const previous=await closureStatus(userId)
 if(previous)return previous
 const local=(await db().query('SELECT s.provider_status FROM billing_accounts a LEFT JOIN billing_subscriptions s ON s.account_id=a.id WHERE a.user_id=$1',[userId])).rows[0]
 if(local?.provider_status){
  const status=await subscriptionStatus(userId,true,gateway,false)
  if(status.state==='unavailable'||status.syncState!=='ok')throw new ClosureConflict()
  if(status.actions.cancel)await cancelSubscription(userId,gateway,status.financialStatus==='trialing'?status.trialEnd??undefined:status.periodEnd??undefined)
  else if(!['canceled','expired','cancel_scheduled'].includes(status.state))throw new ClosureConflict()
 }
 return locked(userId,c=>transaction(c,async()=>{
  await guard(c,userId,hash,password)
  const old=(await c.query('SELECT effective_at,state FROM account_closures WHERE user_id=$1',[userId])).rows[0]
  if(old)return {effectiveAt:old.effective_at.toISOString() as string,state:old.state as 'scheduled'|'closed'}
  const pending=await c.query("SELECT 1 FROM billing_checkouts c JOIN billing_accounts a ON a.id=c.account_id WHERE a.user_id=$1 AND c.state IN ('creating','open')",[userId])
  if(pending.rowCount)throw new ClosureConflict()
  const sub=(await c.query('SELECT s.* FROM billing_subscriptions s JOIN billing_accounts a ON a.id=s.account_id WHERE a.user_id=$1',[userId])).rows[0]
  let until:Date|null=null
  if(sub){
   if(!['canceled','incomplete_expired'].includes(sub.provider_status)){
    const boundary=sub.provider_status==='trialing'?sub.trial_end:sub.period_end
    if(!sub.cancel_at&&!sub.cancel_at_period_end)throw new ClosureConflict()
    until=sub.cancel_at??boundary
    if(!until)throw new ClosureConflict()
   }
  }
  const row=(await c.query("INSERT INTO account_closures(id,user_id,effective_at) VALUES($1,$2,GREATEST(COALESCE($3,clock_timestamp()),clock_timestamp())) RETURNING effective_at,effective_at<=clock_timestamp() AS immediate",[randomUUID(),userId,until])).rows[0]
  // Close immediately when there is no remaining contracted period. Erasure is operator-only.
  if(row.immediate){await c.query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[userId]);await c.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE user_id=$1 AND revoked_at IS NULL',[userId])}
  await c.query("INSERT INTO settings_privacy_requests(user_id,kind) VALUES($1,'erasure') ON CONFLICT(user_id,kind) WHERE status IN ('pending','processing') DO NOTHING",[userId])
  return {effectiveAt:row.effective_at.toISOString() as string,state:'scheduled' as const,immediate:!!row.immediate}
 }))
}
export async function closureHandler(request:Request){try{
 if(request.method!=='GET'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token)
 if(!user)return reply({message:'Entre novamente.'},401)
 if(user.role!=='professional')return reply({message:'Acesso não permitido.'},403)
 await limit('closure:'+user.id,request.method==='GET'?60:5,60)
 if(request.method==='GET')return reply({closure:await closureStatus(user.id)},200)
 const data=input.parse(await jsonBody(request,4096))
 const result=await requestClosure(user.id,sessionDigest(token!),data.currentPassword)
 const immediate='immediate' in result&&result.immediate
 return reply({closure:result,immediate,message:immediate?'Acesso encerrado. A eliminação dos dados permitidos será processada.':'Exclusão agendada para o fim da vigência. A renovação está cancelada.'},200,immediate?{'Set-Cookie':clearSessionCookie()}:undefined)
 }catch(e){if(e instanceof z.ZodError)return reply({message:'Confira a senha e digite EXCLUIR MINHA CONTA.'},400);if(e instanceof ClosureUnauthorized)return reply({message:'Confira sua senha ou entre novamente.'},403);if(e instanceof ClosureConflict)return reply({message:'Não foi possível confirmar o encerramento. Verifique sua assinatura e tente novamente.'},409);return failure(e,'account_closure_unavailable')}}
