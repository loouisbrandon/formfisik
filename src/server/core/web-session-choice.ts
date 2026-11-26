import 'server-only'
import {randomBytes} from 'node:crypto'
import {z} from '@/lib/validation'
import {db} from '../db'
import {sameOrigin,jsonBody,reply,failure,limit,clientAddress} from '../http'
import {sessionDigest,sessionCookie,ABSOLUTE_SECONDS} from '../sessions'
import {destinationFor} from '../access'
import {logicalSessions,createChallenge} from './logical-sessions'
export async function webSessionChoice(request:Request){try{
 if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 await limit('web-choice:'+clientAddress(request),15,900)
 const input=z.object({challengeToken:z.string().regex(/^[\w-]{43}$/),revokeSessionId:z.uuid()}).strict().parse(await jsonBody(request))
 const c=await db().connect()
 try{await c.query('BEGIN');const target=(await c.query('SELECT user_id FROM session_login_challenges WHERE digest=$1',[sessionDigest(input.challengeToken)])).rows[0];if(!target){await c.query('ROLLBACK');return reply({message:'Entre novamente.'},401)}
 const u=(await c.query(`SELECT u.id,u.role,k.password_hash FROM users u JOIN credentials k ON k.user_id=u.id WHERE u.id=$1 AND u.disabled_at IS NULL AND u.email_verified_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) FOR UPDATE OF u`,[target.user_id])).rows[0]
 const challenge=(await c.query("SELECT * FROM session_login_challenges WHERE digest=$1 AND kind='web' AND consumed_at IS NULL AND expires_at>clock_timestamp() FOR UPDATE",[sessionDigest(input.challengeToken)])).rows[0]
 if(!u||!challenge||challenge.credential_digest!==sessionDigest(u.password_hash)||!(await logicalSessions(c,u.id)).some(s=>s.id===input.revokeSessionId)){await c.query('ROLLBACK');return reply({message:'Entre novamente.'},401)}
 await c.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE logical_id=$1 AND user_id=$2',[input.revokeSessionId,u.id])
 if((await logicalSessions(c,u.id)).length>=5){const next=await createChallenge(c,u.id,u.password_hash,'web');await c.query('COMMIT');return reply(next,409)}
 const token=randomBytes(32).toString('base64url'),row=(await c.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,clock_timestamp()+$3*interval '1 second') RETURNING expires_at",[sessionDigest(token),u.id,ABSOLUTE_SECONDS])).rows[0]
 await c.query('UPDATE session_login_challenges SET consumed_at=clock_timestamp() WHERE digest=$1',[sessionDigest(input.challengeToken)]);await c.query('COMMIT')
 return reply({destination:destinationFor(u)},200,{'Set-Cookie':sessionCookie(token,row.expires_at)})
 }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
 }catch(e){if(e instanceof z.ZodError)return reply({message:'Confira a sessão selecionada.'},400);return failure(e,'session_choice_unavailable')}}
