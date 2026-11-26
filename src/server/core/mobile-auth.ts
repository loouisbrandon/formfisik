import 'server-only'
import {randomBytes,randomUUID,createCipheriv,createDecipheriv} from 'node:crypto'
import type {PoolClient} from 'pg'
import {setTimeout as delay} from 'node:timers/promises'
import {db} from '../db'
import {sessionDigest} from '../sessions'
import {jsonBody,RateLimit,privateHeaders,limit,BadRequest} from '../http'
import {z} from '@/lib/validation'
import {authorizeService,ServiceFailure} from './service-auth'
import {createChallenge,logicalSessions} from './logical-sessions'
import {verifyCredentials} from '../credential-verification'
import * as schemas from '@/modules/auth/mobile-contract'
import type {MobileIdentity,MobileSessionEnvelope} from '@/modules/auth/mobile-contract'
type Operation='login'|'refresh'|'inspect'|'logout'|'session-choice'
export class MobileAuthError extends Error{constructor(readonly status:number,readonly code:string){super(code)}}
const fail=(code:string,status=401):never=>{throw new MobileAuthError(status,code)}
const token=()=>randomBytes(32).toString('base64url')
type User={id:string;email:string;full_name:string;role:string;password_hash:string}
async function transaction<T>(work:(c:PoolClient)=>Promise<T>){const c=await db().connect();try{await c.query('BEGIN');const result=await work(c);await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
async function userLock(c:PoolClient,id:string){const r=await c.query(`SELECT u.id,u.email,u.full_name,u.role,k.password_hash FROM users u JOIN credentials k ON k.user_id=u.id WHERE u.id=$1 AND u.disabled_at IS NULL AND u.email_verified_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) FOR UPDATE OF u`,[id]);if(!r.rowCount)fail('session_invalid');return r.rows[0] as User}
function identity(u:User):MobileIdentity{return {id:u.id,email:u.email,fullName:u.full_name,role:u.role,capabilities:['account:read','session:validate','session:logout']}}
function encryptionKeys(){
 const raw=JSON.parse(process.env.CORE_MOBILE_RETRY_KEYS_JSON??'null')
 if(!raw||typeof raw.activeKid!=='string'||!raw.keys||typeof raw.keys!=='object')throw Error('retry_configuration')
 const keys=new Map<string,Buffer>()
 for(const [kid,value] of Object.entries(raw.keys)){if(!/^[\w.-]{1,80}$/.test(kid)||typeof value!=='string'||!/^[a-f0-9]{64}$/.test(value))throw Error('retry_configuration');keys.set(kid,Buffer.from(value,'hex'))}
 if(!keys.has(raw.activeKid))throw Error('retry_configuration')
 return {activeKid:raw.activeKid as string,keys}
}
function seal(value:unknown,aad:string){const config=encryptionKeys(),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',config.keys.get(config.activeKid)!,iv);cipher.setAAD(Buffer.from(aad));const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return {kid:config.activeKid,ciphertext:Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url')}}
function unseal(value:string,kid:string,aad:string):MobileSessionEnvelope{const key=encryptionKeys().keys.get(kid);if(!key)throw Error('retry_configuration');const b=Buffer.from(value,'base64url'),decipher=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));decipher.setAuthTag(b.subarray(12,28));decipher.setAAD(Buffer.from(aad));return JSON.parse(Buffer.concat([decipher.update(b.subarray(28)),decipher.final()]).toString('utf8'))}
async function issueTokens(c:PoolClient,id:string,generation:number,u:User){
 const accessToken=token(),refreshToken=token()
 await c.query("INSERT INTO mobile_session_tokens(digest,family_id,kind,generation,expires_at) VALUES($1,$2,'access',$3,clock_timestamp()+interval '5 minutes'),($4,$2,'refresh',$3,NULL)",[sessionDigest(accessToken),id,generation,sessionDigest(refreshToken)])
 return {accessToken,refreshToken,sessionId:id,expiresIn:300 as const,identity:identity(u)}
}
async function issueFamily(c:PoolClient,u:User,device:{installationId:string;label:string;platform:string}){
 const id=randomUUID()
 // Anchor token is never disclosed and cannot be used as a Web cookie.
 await c.query("INSERT INTO sessions(token_hash,user_id,logical_id,expires_at) VALUES($1,$2,$3,clock_timestamp()+interval '365 days')",[sessionDigest(token()),u.id,id])
 await c.query('INSERT INTO mobile_session_families(id,user_id,installation_id,label,platform) VALUES($1,$2,$3,$4,$5)',[id,u.id,device.installationId,device.label,device.platform])
 return issueTokens(c,id,1,u)
}
async function login(input:ReturnType<typeof schemas.mobileLogin.parse>){
 encryptionKeys()
 await limit(`login:email:${input.email}`,5,900);await limit('login:global',100,60)
 const found=await verifyCredentials(input.email,input.password)
 if(!found)throw new MobileAuthError(401,'invalid_credentials')
 return transaction(async c=>{let u:User;try{u=await userLock(c,found.id)}catch(error){if(error instanceof MobileAuthError)fail('invalid_credentials');throw error}if(u!.password_hash!==found.password_hash)fail('invalid_credentials');if((await logicalSessions(c,u!.id)).length>=5)return createChallenge(c,u!.id,u!.password_hash,'mobile',input.device);return issueFamily(c,u!,input.device)})
}
async function family(c:PoolClient,value:string,kind:'access'|'refresh',allowConsumed=false){
 const candidate=(await c.query('SELECT f.user_id,t.family_id FROM mobile_session_tokens t JOIN mobile_session_families f ON f.id=t.family_id WHERE t.digest=$1 AND t.kind=$2',[sessionDigest(value),kind])).rows[0]
 if(!candidate)fail('session_invalid')
 const u=await userLock(c,candidate.user_id)
 const r=await c.query(`SELECT t.*,f.generation AS current_generation,s.revoked_at,f.last_relevant_at>clock_timestamp()-interval '365 days' AS live,t.expires_at>clock_timestamp() AS access_live FROM mobile_session_tokens t JOIN mobile_session_families f ON f.id=t.family_id JOIN sessions s ON s.logical_id=f.id WHERE t.digest=$1 AND t.kind=$2 FOR UPDATE OF f,s,t`,[sessionDigest(value),kind])
 if(!r.rowCount)fail('session_invalid');const t=r.rows[0]
 if(t.revoked_at)fail('session_revoked');if(!t.live)fail('session_expired')
 if(kind==='access'&&(!t.access_live||t.generation!==t.current_generation))fail('access_expired')
 if(!allowConsumed&&t.consumed_at)fail('session_invalid')
 return {u,t,id:candidate.family_id as string}
}
async function refresh(input:ReturnType<typeof schemas.mobileRefresh.parse>){
 encryptionKeys()
 await limit(`mobile-refresh:${sessionDigest(input.refreshToken)}`,12,60)
 return transaction(async c=>{
  const {u,t,id}=await family(c,input.refreshToken,'refresh',true),old=sessionDigest(input.refreshToken),proof=sessionDigest(input.retrySecret)
  await c.query('UPDATE mobile_refresh_receipts SET ciphertext=NULL WHERE family_id=$1 AND expires_at<=clock_timestamp() AND ciphertext IS NOT NULL',[id])
  const receipt=(await c.query('SELECT *,expires_at>clock_timestamp() AS live FROM mobile_refresh_receipts WHERE family_id=$1 AND operation_id=$2',[id,input.operationId])).rows[0]
  if(t.consumed_at){
   if(receipt&&receipt.old_digest===old&&receipt.proof_digest===proof){
    if(!receipt.live||!receipt.ciphertext)return {failure:'refresh_recovery_expired'}
    if(receipt.generation!==t.current_generation)return {failure:'refresh_conflict'}
    return unseal(receipt.ciphertext,receipt.key_id,`${id}:${input.operationId}`)
   }
   await c.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE logical_id=$1',[id]);return {failure:'refresh_reuse'}
  }
  if(receipt)return {failure:'refresh_conflict'}
  await c.query('UPDATE mobile_session_tokens SET consumed_at=clock_timestamp() WHERE digest=$1',[old])
  const next=t.current_generation+1;await c.query('UPDATE mobile_session_families SET generation=$2 WHERE id=$1',[id,next])
  const envelope=await issueTokens(c,id,next,u),sealed=seal(envelope,`${id}:${input.operationId}`)
  await c.query("INSERT INTO mobile_refresh_receipts(family_id,operation_id,old_digest,proof_digest,generation,ciphertext,key_id,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,clock_timestamp()+interval '5 minutes')",[id,input.operationId,old,proof,next,sealed.ciphertext,sealed.kid])
  return envelope
 })
}
async function inspect(input:ReturnType<typeof schemas.mobileInspect.parse>){return transaction(async c=>{const {u,id}=await family(c,input.accessToken,'access');if(input.interaction){await c.query('UPDATE mobile_session_families SET last_relevant_at=clock_timestamp() WHERE id=$1',[id]);await c.query("UPDATE sessions SET last_seen_at=clock_timestamp(),expires_at=clock_timestamp()+interval '365 days' WHERE logical_id=$1",[id])}return {sessionId:id,identity:identity(u)}})}
/** Reuses canonical access authorization for narrowly scoped account operations; passive. */
export async function mobileAccountTransaction<T>(accessToken:string,work:(c:PoolClient,userId:string)=>Promise<T>){return transaction(async c=>{const {u}=await family(c,accessToken,'access');return work(c,u.id)})}
async function logout(input:ReturnType<typeof schemas.mobileLogout.parse>){return transaction(async c=>{
 const kind='accessToken'in input?'access':'refresh',value='accessToken'in input?input.accessToken:input.refreshToken
 // A known access may be expired; it can revoke only its own family, never renew it.
 const r=await c.query('SELECT t.family_id,f.user_id,t.consumed_at FROM mobile_session_tokens t JOIN mobile_session_families f ON f.id=t.family_id WHERE t.digest=$1 AND t.kind=$2',[sessionDigest(value),kind]);if(!r.rowCount)return {revoked:true}
 await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[r.rows[0].user_id])
 if(kind==='refresh'&&(await c.query('SELECT consumed_at FROM mobile_session_tokens WHERE digest=$1',[sessionDigest(value)])).rows[0]?.consumed_at)fail('session_invalid')
 await c.query('UPDATE sessions SET revoked_at=COALESCE(revoked_at,clock_timestamp()) WHERE logical_id=$1',[r.rows[0].family_id]);return {revoked:true}
})}
async function choice(input:ReturnType<typeof schemas.mobileChoice.parse>){return transaction(async c=>{
 const candidate=(await c.query('SELECT user_id FROM session_login_challenges WHERE digest=$1',[sessionDigest(input.challengeToken)])).rows[0];if(!candidate)fail('challenge_invalid')
 const u=await userLock(c,candidate.user_id)
 const r=await c.query("SELECT * FROM session_login_challenges WHERE digest=$1 AND kind='mobile' AND consumed_at IS NULL AND expires_at>clock_timestamp() FOR UPDATE",[sessionDigest(input.challengeToken)]);if(!r.rowCount||r.rows[0].credential_digest!==sessionDigest(u.password_hash))fail('challenge_invalid')
 const sessions=await logicalSessions(c,u.id);if(!sessions.some(s=>s.id===input.revokeSessionId))fail('challenge_invalid')
 await c.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE logical_id=$1 AND user_id=$2',[input.revokeSessionId,u.id])
 if((await logicalSessions(c,u.id)).length>=5)return createChallenge(c,u.id,u.password_hash,'mobile',r.rows[0].device)
 const device=schemas.deviceSchema.parse(r.rows[0].device)
 await c.query('UPDATE session_login_challenges SET consumed_at=clock_timestamp() WHERE digest=$1',[sessionDigest(input.challengeToken)])
 return issueFamily(c,u,device)
})}
export function mobileAuthHandler(operation:Operation){return async(request:Request)=>{
 const started=Date.now(),requestId=randomUUID(),correlation=z.uuid().safeParse(request.headers.get('x-correlation-id'))
 const headers={...privateHeaders,'X-Request-Id':requestId,...(correlation.success?{'X-Correlation-Id':correlation.data}:{})}
 try{
  await authorizeService(request,`core:mobile-auth:${operation}`)
  await limit('mobile-auth:'+operation,operation==='login'?100:300,60)
  const raw=await jsonBody(request,8192)
  const result=operation==='login'?await login(schemas.mobileLogin.parse(raw)):operation==='refresh'?await refresh(schemas.mobileRefresh.parse(raw)):operation==='inspect'?await inspect(schemas.mobileInspect.parse(raw)):operation==='logout'?await logout(schemas.mobileLogout.parse(raw)):await choice(schemas.mobileChoice.parse(raw))
  if('failure'in result)return Response.json({error:{code:result.failure},requestId},{status:401,headers})
  return Response.json(result,{status:'challengeToken'in result?409:200,headers})
 }catch(error){
  const status=error instanceof MobileAuthError||error instanceof ServiceFailure?error.status:error instanceof RateLimit?429:error instanceof z.ZodError||error instanceof BadRequest?400:503
  const code=error instanceof MobileAuthError||error instanceof ServiceFailure?error.code:error instanceof RateLimit?'rate_limited':status===400?'invalid_request':'dependency_unavailable'
  console.info(JSON.stringify({event:'core_mobile_auth_rejected',status,requestId}))
  return Response.json({error:{code},requestId},{status,headers:{...headers,...(status===429?{'Retry-After':'900'}:{})}})
 }finally{if(operation==='login')await delay(Math.max(0,750-(Date.now()-started)))}
}}
