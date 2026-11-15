import 'server-only'
import {randomUUID} from 'node:crypto'
import {aiRuntime,CoachError} from './provider'
import {aiTurn} from './engine'
import {validateContext} from './context'
import {aiAccess} from './access'
import type {AiResult} from '@/modules/ecoach/ai-schema'
import {isDeepStrictEqual} from 'node:util'
import {z} from '@/lib/validation'
import {db} from '../db'
import {readSession,sessionToken,sessionDigest} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import {reply,failure,jsonBody,sameOrigin,limit} from '../http'
import {historyCommand,type CoachContext,type ConversationDetail} from '@/modules/ecoach/history-schema'
import {demoAnswer} from '@/modules/ecoach/demo'
class HistoryError extends Error{constructor(public status:number,message:string){super(message)}}
const summary=(row:Record<string,unknown>)=>({id:String(row.id),title:String(row.title),version:Number(row.version),updatedAt:new Date(row.updated_at as string).toISOString()})
async function detail(owner:string,id:string):Promise<ConversationDetail>{const r=await db().query('SELECT id,title,version,updated_at FROM ecoach_conversations WHERE owner_id=$1 AND id=$2',[owner,id]);if(!r.rowCount)throw new HistoryError(404,'Conversa não encontrada.');const turns=await db().query('SELECT user_text,assistant_text,context,mode,proposal_id,sources FROM ecoach_turns WHERE owner_id=$1 AND conversation_id=$2 ORDER BY position LIMIT 20',[owner,id]);return {...summary(r.rows[0]),turns:turns.rows.map(t=>({text:t.user_text,answer:t.assistant_text,context:t.context,mode:t.mode,proposalId:t.proposal_id,sources:t.sources}))}}
export async function historyHandler(request:Request){try{
 if(request.method!=='GET'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token);if(!user||!token)return reply({message:'Entre novamente.'},401)
 const access=await professionalAccess(user);if(access.status!=='allowed')return reply({message:'Acesso profissional necessário.'},access.status==='denied'?403:503)
 await limit('ecoach-history:'+request.method+':'+user.id,request.method==='GET'?120:40,60)
 if(request.method==='GET'){const query=z.object({id:z.uuid().optional(),page:z.coerce.number().int().min(1).max(10).default(1)}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));if(query.id)return reply({conversation:await detail(user.id,query.id)},200);const result=await db().query('SELECT id,title,version,updated_at FROM ecoach_conversations WHERE owner_id=$1 ORDER BY updated_at DESC,id LIMIT 20 OFFSET $2',[user.id,(query.page-1)*20]);const count=await db().query('SELECT count(*)::integer AS total FROM ecoach_conversations WHERE owner_id=$1',[user.id]);return reply({items:result.rows.map(summary),total:count.rows[0].total,page:query.page,pageSize:20},200)}
 const input=historyCommand.parse(await jsonBody(request,8192))
 let generated:AiResult|undefined
 if(input.action==='turn'&&aiRuntime().enabled){const prior=await db().query('SELECT 1 FROM ecoach_turns WHERE owner_id=$1 AND operation_id=$2',[user.id,input.operationId]);if(!prior.rowCount)generated=await aiTurn(user.id,token,input,request.signal)}
 const client=await db().connect()
 try{await client.query('BEGIN');const account=await client.query("SELECT id FROM users WHERE id=$1 AND role='professional' AND disabled_at IS NULL AND email_verified_at IS NOT NULL FOR UPDATE",[user.id]);if(!account.rowCount)throw new HistoryError(401,'Entre novamente.');const live=await client.query("SELECT 1 FROM sessions WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL AND expires_at>clock_timestamp() AND last_seen_at>clock_timestamp()-interval '30 minutes'",[user.id,sessionDigest(token)]);if(!live.rowCount)throw new HistoryError(401,'Entre novamente.')
 if(input.action==='turn'){
 const previous=await client.query('SELECT conversation_id,user_text,context FROM ecoach_turns WHERE owner_id=$1 AND operation_id=$2',[user.id,input.operationId]);if(previous.rowCount){const p=previous.rows[0];if(p.conversation_id!==input.id||p.user_text!==input.text||!isDeepStrictEqual(p.context,input.context))throw new HistoryError(409,'Operação já utilizada.');await client.query('COMMIT');return reply({conversation:await detail(user.id,input.id),replayed:true},200)}
 const context:CoachContext|null=input.context
 await validateContext(client,user.id,context)
 let found=await client.query('SELECT version FROM ecoach_conversations WHERE owner_id=$1 AND id=$2 FOR UPDATE',[user.id,input.id]);if(!found.rowCount){if((await client.query('SELECT 1 FROM ecoach_deleted_conversations WHERE id=$1',[input.id])).rowCount)throw new HistoryError(404,'Conversa excluída. Inicie outra.');if(input.version!==0)throw new HistoryError(404,'Conversa não encontrada.');if((await client.query('SELECT 1 FROM ecoach_conversations WHERE id=$1',[input.id])).rowCount)throw new HistoryError(404,'Conversa não encontrada.');const count=await client.query('SELECT count(*)::integer AS total FROM ecoach_conversations WHERE owner_id=$1',[user.id]);if(count.rows[0].total>=200)throw new HistoryError(409,'Limite de 200 conversas. Exclua conversas antigas para continuar.');await client.query('INSERT INTO ecoach_conversations(id,owner_id,title) VALUES($1,$2,$3)',[input.id,user.id,input.text.slice(0,100)]);found=await client.query('SELECT version FROM ecoach_conversations WHERE owner_id=$1 AND id=$2',[user.id,input.id]);}else if(found.rows[0].version!==input.version)throw new HistoryError(409,'Conversa alterada em outra janela. Reabra pelo histórico.')
 const count=await client.query('SELECT count(*)::integer AS total FROM ecoach_turns WHERE owner_id=$1 AND conversation_id=$2',[user.id,input.id]);if(count.rows[0].total>=20)throw new HistoryError(409,'Limite de mensagens desta conversa. Inicie outra.')
 if(generated)await aiAccess(user.id,token,undefined,client)
 let proposalId:string|null=null
 if(generated?.action){proposalId=randomUUID();await client.query('INSERT INTO ecoach_proposals(id,owner_id,conversation_id,operation_id,action) VALUES($1,$2,$3,$4,$5)',[proposalId,user.id,input.id,input.operationId,generated.action])}
 await client.query('INSERT INTO ecoach_turns(conversation_id,owner_id,operation_id,position,user_text,assistant_text,context,mode,proposal_id,sources) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[input.id,user.id,input.operationId,count.rows[0].total+1,input.text,generated?.answer??demoAnswer(input.text),context,generated?.mode??'demo',proposalId,JSON.stringify(generated?.sources??[])]);await client.query('UPDATE ecoach_conversations SET version=version+1,updated_at=clock_timestamp() WHERE owner_id=$1 AND id=$2',[user.id,input.id])
 }else{const found=await client.query('SELECT version FROM ecoach_conversations WHERE owner_id=$1 AND id=$2 FOR UPDATE',[user.id,input.id]);if(!found.rowCount)throw new HistoryError(404,'Conversa não encontrada.');if(found.rows[0].version!==input.version)throw new HistoryError(409,'Conversa alterada. Reabra pelo histórico.');if(input.action==='delete'){await client.query('INSERT INTO ecoach_deleted_conversations(id,owner_id) VALUES($1,$2)',[input.id,user.id]);await client.query('DELETE FROM ecoach_ai_requests WHERE owner_id=$1 AND conversation_id=$2',[user.id,input.id]);await client.query('DELETE FROM ecoach_conversations WHERE owner_id=$1 AND id=$2',[user.id,input.id]);}else await client.query('UPDATE ecoach_conversations SET title=$3,version=version+1,updated_at=clock_timestamp() WHERE owner_id=$1 AND id=$2',[user.id,input.id,input.title])}
 await client.query('COMMIT');return reply(input.action==='delete'?{deleted:true}:{conversation:await detail(user.id,input.id)},200)
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }catch(e){if(e instanceof CoachError)return reply({message:e.message,newAttemptRequired:![404,409].includes(e.status)},e.status);if(e instanceof HistoryError)return reply({message:e.message},e.status);if(e instanceof z.ZodError)return reply({message:'Confira os campos e limites da conversa.'},400);return failure(e,'ecoach_history_unavailable')}}
