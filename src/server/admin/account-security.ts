import 'server-only'
import {db} from '../db'
import {readSession,sessionToken,sessionDigest,IDLE_SECONDS} from '../sessions'
import {sameOrigin,jsonBody,reply,failure,limit} from '../http'
import {accountSecurityInput} from '@/modules/admin/users-schema'
import {z} from 'zod'
export class AdminSecurityConflict extends Error{}
export async function changeAccountSecurity(actorId:string,token:string,targetId:string,input:unknown){
 const data=accountSecurityInput.parse(input);z.uuid().parse(targetId)
 const c=await db().connect()
 try{
  await c.query('BEGIN')
  // Serialize administrative changes, including two admins attempting to disable each other.
  await c.query('SELECT pg_advisory_xact_lock(3200811)')
  const actor=await c.query("SELECT id FROM users u WHERE id=$1 AND role='admin' AND disabled_at IS NULL AND email_verified_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) FOR UPDATE",[actorId])
  if(!actor.rowCount)throw new AdminSecurityConflict('ADMIN_REVOKED')
  const session=await c.query("SELECT 1 FROM sessions WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL AND expires_at>clock_timestamp() AND last_seen_at>clock_timestamp()-$3*interval '1 second' FOR UPDATE",[actorId,sessionDigest(token),IDLE_SECONDS])
  if(!session.rowCount)throw new AdminSecurityConflict('SESSION_REVOKED')
  if(actorId===targetId)throw new AdminSecurityConflict('SELF_ACTION')
  const target=(await c.query('SELECT role,disabled_at FROM users WHERE id=$1 FOR UPDATE',[targetId])).rows[0]
  if(!target)throw new AdminSecurityConflict('TARGET_MISSING')
  if(data.disabled&&target.role==='admin'){
   const other=await c.query("SELECT 1 FROM users u WHERE role='admin' AND id<>$1 AND disabled_at IS NULL AND email_verified_at IS NOT NULL AND EXISTS(SELECT 1 FROM credentials k WHERE k.user_id=u.id) AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) LIMIT 1",[targetId])
   if(!other.rowCount)throw new AdminSecurityConflict('LAST_ADMIN')
  }
  if(!data.disabled){
   const retention=await c.query("SELECT 1 WHERE EXISTS(SELECT 1 FROM privacy_erasure_jobs WHERE owner_id=$1 AND state<>'completed') OR EXISTS(SELECT 1 FROM account_closures WHERE user_id=$1) OR NOT EXISTS(SELECT 1 FROM credentials WHERE user_id=$1)",[targetId])
   if(retention.rowCount)throw new AdminSecurityConflict('REACTIVATION_BLOCKED')
  }
  if(!!target.disabled_at===data.disabled){await c.query('COMMIT');return {changed:false}}
  if(!!target.disabled_at!==data.expectedDisabled)throw new AdminSecurityConflict('STALE_STATE')
  await c.query('UPDATE users SET disabled_at=CASE WHEN $2 THEN clock_timestamp() ELSE NULL END WHERE id=$1',[targetId,data.disabled])
  // Existing trigger revokes sessions and recovery tokens on suspension.
  await c.query('INSERT INTO account_security_events(user_id,kind,reason,actor_id) VALUES($1,$2,$3,$4)',[targetId,data.disabled?'disabled':'enabled',data.reason,actorId])
  await c.query('COMMIT');return {changed:true}
 }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
}
export async function adminSecurityHandler(request:Request,id:string){
 try{
  if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
  const token=sessionToken(request.headers.get('cookie')),user=await readSession(token)
  if(!user||!token)return reply({message:'Entre novamente.'},401)
  if(user.role!=='admin')return reply({message:'Acesso não permitido.'},403)
  await limit('admin-security:'+user.id,20,900)
  const parsed=accountSecurityInput.safeParse(await jsonBody(request));if(!parsed.success||!z.uuid().safeParse(id).success)return reply({message:'Confira os dados informados.'},400)
  const result=await changeAccountSecurity(user.id,token,id,parsed.data)
  return reply({message:parsed.data.disabled?'Conta bloqueada.':'Conta reativada.',...result},200)
 }catch(e){if(e instanceof AdminSecurityConflict)return reply({message:'A alteração não é permitida ou a situação mudou. Atualize a página. Contas em encerramento ou eliminação não podem ser reativadas.'},409);return failure(e,'admin_security_unavailable')}
}
