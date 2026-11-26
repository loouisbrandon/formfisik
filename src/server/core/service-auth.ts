import 'server-only'
import {randomUUID} from 'node:crypto'
import {decodeProtectedHeader, importJWK, jwtVerify} from 'jose'
import {z} from '@/lib/validation'
import {db} from '../db'
import {limit, RateLimit, privateHeaders} from '../http'

const name=z.string().min(1).max(120).regex(/^[a-zA-Z0-9:._-]+$/)
const publicJwk=z.object({kty:z.literal('EC'),crv:z.literal('P-256'),x:z.string().regex(/^[\w-]{43}$/),y:z.string().regex(/^[\w-]{43}$/),alg:z.literal('ES256').optional(),use:z.literal('sig').optional(),kid:z.string().max(80).optional(),key_ops:z.array(z.literal('verify')).max(1).optional()}).strict()
const environment=z.enum(['local','staging','production'])
const serviceScope=z.enum(['core:service-check','core:mobile-auth:login','core:mobile-auth:refresh','core:mobile-auth:inspect','core:mobile-auth:logout','core:mobile-auth:session-choice','core:registration:legal','core:registration:start','core:registration:verify','core:registration:resend','core:registration:legal-status','core:registration:legal-accept','core:recovery:request','core:recovery:validate','core:recovery:reset'])
const clientSchema=z.object({issuer:name,environment,scopes:z.array(serviceScope).max(15),keys:z.array(z.object({kid:name.max(80),publicJwk,revoked:z.boolean()}).strict()).min(1).max(20)}).strict()
const claimSchema=z.object({iss:name,sub:name,aud:z.string(),environment,scope:z.string().max(200),iat:z.number().int(),exp:z.number().int(),jti:z.uuid()}).strict()
type ErrorCode='service_unauthorized'|'service_forbidden'|'service_replay'|'service_unavailable'|'invalid_request'|'service_rate_limited'
export class ServiceFailure extends Error {constructor(readonly status:number,readonly code:ErrorCode){super(code)}}
function configuration(){
 try {
  const stage=environment.parse(process.env.CORE_SERVICE_ENVIRONMENT)
  const audience=z.literal(`urn:formfisik:core:${stage}`).parse(process.env.CORE_SERVICE_AUDIENCE)
  if(process.env.NODE_ENV==='production'&&stage!=='production')throw Error('environment')
  const clients=z.array(clientSchema).min(1).max(20).parse(JSON.parse(process.env.CORE_SERVICE_CLIENTS_JSON??''))
  const kids=clients.flatMap(c=>c.keys.map(k=>k.kid))
  if(new Set(clients.map(c=>c.issuer)).size!==clients.length||new Set(kids).size!==kids.length||clients.some(c=>c.environment!==stage))throw Error('configuration')
  return {stage,audience,clients}
 }catch{throw new ServiceFailure(503,'service_unavailable')}
}

/** Direct service assertion profile, not OAuth or a user/session credential. */
export async function authorizeService(request:Request,requiredScope:z.infer<typeof serviceScope>){
 const config=configuration()
 const authorization=request.headers.get('authorization')
 if(!authorization||authorization.length>8192||!/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/.test(authorization))throw new ServiceFailure(401,'service_unauthorized')
 const token=authorization.slice(7)
 let claims:z.infer<typeof claimSchema>
 try {
  const header=decodeProtectedHeader(token)
  if(header.alg!=='ES256'||header.typ!=='JWT'||typeof header.kid!=='string'||header.kid.length>80||header.crit||header.jku||header.jwk||header.x5u)throw Error('header')
  // Trusted configuration is the only key source. Never fetch key URLs from a JWT.
  const candidates=config.clients.flatMap(client=>client.keys.filter(key=>key.kid===header.kid&&!key.revoked).map(key=>({client,key})))
  if(candidates.length!==1)throw Error('key')
  const {client,key}=candidates[0]
  const verified=await jwtVerify(token,await importJWK(key.publicJwk,'ES256'),{algorithms:['ES256'],typ:'JWT',issuer:client.issuer,audience:config.audience,clockTolerance:5,requiredClaims:['iss','sub','aud','iat','exp','jti']})
  claims=claimSchema.parse(verified.payload)
  const now=Math.floor(Date.now()/1000)
  if(claims.sub!==client.issuer||claims.environment!==config.stage||claims.aud!==config.audience||claims.exp<=claims.iat||claims.exp-claims.iat>60||claims.iat>now+5||claims.iat<now-65)throw Error('claims')
  if(claims.scope!==requiredScope||!client.scopes.includes(requiredScope))throw new ServiceFailure(403,'service_forbidden')
 }catch(error){if(error instanceof ServiceFailure)throw error;throw new ServiceFailure(401,'service_unauthorized')}
 await limit(`core-service:${claims.iss}`,120,60)
 // One unique insert decides replay even across replicas and concurrent requests.
 // Expired receipts are cleaned in bounded batches, retaining the full tolerance window.
 await db().query('DELETE FROM core_service_assertions WHERE (environment,issuer,jti) IN (SELECT environment,issuer,jti FROM core_service_assertions WHERE expires_at<clock_timestamp() LIMIT 100)')
 const receipt=await db().query("INSERT INTO core_service_assertions(environment,issuer,jti,expires_at) VALUES($1,$2,$3,to_timestamp($4)+interval '10 seconds') ON CONFLICT DO NOTHING RETURNING jti",[config.stage,claims.iss,claims.jti,claims.exp])
 if(!receipt.rowCount)throw new ServiceFailure(401,'service_replay')
 return {issuer:claims.iss,environment:claims.environment}
}

export async function serviceCheck(request:Request){
 const requestId=randomUUID()
 const parsedCorrelation=z.uuid().safeParse(request.headers.get('x-correlation-id'))
 const correlationId=parsedCorrelation.success?parsedCorrelation.data:undefined
 const headers={...privateHeaders,'X-Request-Id':requestId,...(correlationId?{'X-Correlation-Id':correlationId}:{})}
 try {
  if(request.method!=='GET'||new URL(request.url).search||request.body!==null)throw new ServiceFailure(400,'invalid_request')
  await authorizeService(request,'core:service-check')
  return Response.json({ok:true,contractVersion:'1'},{status:200,headers})
 }catch(error){
  const failure=error instanceof ServiceFailure?error:error instanceof RateLimit?new ServiceFailure(429,'service_rate_limited'):new ServiceFailure(503,'service_unavailable')
  console.info(JSON.stringify({event:'core_service_request_rejected',status:failure.status,requestId,...(correlationId?{correlationId}:{})}))
  return Response.json({error:{code:failure.code},requestId},{status:failure.status,headers:{...headers,...(failure.status===429?{'Retry-After':'60'}:{})}})
 }
}
