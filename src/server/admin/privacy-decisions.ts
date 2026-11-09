import 'server-only'
import {z} from 'zod'
import {db} from '../db'
import {readSession,sessionToken} from '../sessions'
import {failure,reply,jsonBody,sameOrigin,limit} from '../http'
import {guardAdminTransaction,AdminOperationConflict} from './transaction-guard'
import {privacyDecisionInput} from '@/modules/admin/privacy-decision-schema'
export async function decidePrivacyRequest(actorId:string,token:string,id:string,input:unknown){
 z.uuid().parse(id);const data=privacyDecisionInput.parse(input),c=await db().connect()
 try{
  await c.query('BEGIN');await guardAdminTransaction(c,actorId,token)
  const r=(await c.query('SELECT user_id,kind,status FROM settings_privacy_requests WHERE id=$1 FOR UPDATE',[id])).rows[0]
  if(!r||r.status!==data.expectedState||!['pending','processing'].includes(r.status))throw new AdminOperationConflict('STALE_REQUEST')
  if((r.status==='pending'&&data.state!=='processing')||(r.status==='processing'&&data.state==='processing'))throw new AdminOperationConflict('INVALID_TRANSITION')
  if(data.state==='completed'){
   if(!data.fulfilled)throw new AdminOperationConflict('FULFILLMENT_REQUIRED')
   if(r.kind==='erasure'){
    const proof=await c.query("SELECT 1 FROM privacy_erasure_jobs WHERE owner_id=$1 AND scope='professional' AND state='completed' AND NOT EXISTS(SELECT 1 FROM privacy_erasure_jobs WHERE owner_id=$1 AND state<>'completed')",[r.user_id])
    if(!proof.rowCount)throw new AdminOperationConflict('ERASURE_NOT_COMPLETED')
   }
  }
  await c.query("UPDATE settings_privacy_requests SET status=$2,resolution_reference=$3,resolved_at=CASE WHEN $2='processing' THEN NULL ELSE clock_timestamp() END WHERE id=$1",[id,data.state,data.reference])
  await c.query('INSERT INTO admin_privacy_decisions(request_id,actor_id,previous_state,new_state,justification,reference) VALUES($1,$2,$3,$4,$5,$6)',[id,actorId,r.status,data.state,data.justification,data.reference])
  await c.query("INSERT INTO settings_events(user_id,kind) VALUES($1,'privacy_status_changed')",[r.user_id]);await c.query('COMMIT')
 }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
}
export async function privacyDecisionHandler(request:Request,id:string){try{
 if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token)
 if(!user||!token)return reply({message:'Entre novamente.'},401)
 if(user.role!=='admin')return reply({message:'Acesso não permitido.'},403)
 await limit('admin-privacy:'+user.id,20,900)
 const body=privacyDecisionInput.safeParse(await jsonBody(request));if(!body.success||!z.uuid().safeParse(id).success)return reply({message:'Confira a justificativa e a referência de atendimento.'},400)
 await decidePrivacyRequest(user.id,token,id,body.data);return reply({message:'Decisão registrada.'},200)
 }catch(e){if(e instanceof AdminOperationConflict)return reply({message:e.message==='ERASURE_NOT_COMPLETED'?'A eliminação ainda não foi concluída pelo processo operacional. Retenções não podem ser ignoradas.':'A situação mudou ou a transição não é permitida. Atualize e confira o atendimento antes de concluir.'},409);return failure(e,'admin_privacy_decision_unavailable')}}
