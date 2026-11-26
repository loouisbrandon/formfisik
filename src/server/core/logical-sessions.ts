import 'server-only'
import type {PoolClient} from 'pg'
import {randomBytes} from 'node:crypto'
import {sessionDigest} from '../sessions'

export class SessionLimit extends Error {}
export async function logicalSessions(c:PoolClient,userId:string,exclude?:string){
 const r=await c.query(`SELECT s.logical_id AS id,CASE WHEN m.id IS NULL THEN 'web' ELSE 'mobile' END AS kind,
 COALESCE(m.label,'Navegador Web') AS label,COALESCE(m.last_relevant_at,s.last_seen_at) AS last_relevant_at
 FROM sessions s LEFT JOIN mobile_session_families m ON m.id=s.logical_id
 WHERE s.user_id=$1 AND s.revoked_at IS NULL AND s.token_hash IS DISTINCT FROM $2
 AND ((m.id IS NULL AND s.expires_at>clock_timestamp() AND s.last_seen_at>clock_timestamp()-interval '365 days')
 OR(m.id IS NOT NULL AND m.last_relevant_at>clock_timestamp()-interval '365 days'))
 ORDER BY s.created_at,s.logical_id LIMIT 5`,[userId,exclude??null])
 return r.rows.map(r=>({id:r.id as string,kind:r.kind as 'web'|'mobile',label:r.label as string,lastRelevantAt:r.last_relevant_at.toISOString() as string}))
}
export async function createChallenge(c:PoolClient,userId:string,passwordHash:string,kind:'web'|'mobile',device:unknown=null){
 const token=randomBytes(32).toString('base64url')
 await c.query('DELETE FROM session_login_challenges WHERE user_id=$1 OR expires_at<=clock_timestamp()',[userId])
 await c.query('INSERT INTO session_login_challenges(digest,user_id,credential_digest,kind,device) VALUES($1,$2,$3,$4,$5)',[sessionDigest(token),userId,sessionDigest(passwordHash),kind,device])
 return {error:{code:'session_limit' as const},challengeToken:token,sessions:await logicalSessions(c,userId)}
}
