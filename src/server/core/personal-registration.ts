import 'server-only'
import {randomUUID} from 'node:crypto'
import {setTimeout as delay} from 'node:timers/promises'
import {z} from '@/lib/validation'
import * as schemas from '@/modules/auth/registration-contract'
import {registrationSchema} from '@/modules/registration/schema'
import {db} from '../db'
import {registerAccount,verifyCode,resendRegistration} from '../registration'
import {jsonBody,privateHeaders,limit,RateLimit,BadRequest} from '../http'
import {authorizeService,ServiceFailure} from './service-auth'
import {legalMetadata,captureLegal,recordLegal,legalStatus,LegalError} from './legal'
import {mobileAccountTransaction,MobileAuthError} from './mobile-auth'
type Operation='legal'|'start'|'verify'|'resend'|'legal-status'|'legal-accept'
export function personalRegistrationHandler(operation:Operation){return async(request:Request)=>{
 const started=Date.now(),requestId=randomUUID(),headers={...privateHeaders,'X-Request-Id':requestId}
 try{
  const service=await authorizeService(request,`core:registration:${operation}`)
  await limit(`personal-registration:${service.issuer}:${operation}`,operation==='start'?30:120,60)
  const raw=await jsonBody(request,16384)
  if(operation==='legal'){z.object({}).strict().parse(raw);const metadata=await legalMetadata();return Response.json({registrationAvailable:metadata.registrationAvailable,reason:metadata.reason,documents:metadata.documents},{headers})}
  if(operation==='legal-status'){const input=schemas.legalStatusInput.parse(raw);return Response.json(await mobileAccountTransaction(input.accessToken,(c,id)=>legalStatus(c,id)),{headers})}
  if(operation==='legal-accept'){
   const input=schemas.legalAcceptInput.parse(raw)
   await mobileAccountTransaction(input.accessToken,async(c,id)=>{const evidence=await captureLegal(c,input.legal,input.operationId,service.issuer,requestId,false);await recordLegal(c,id,evidence)})
   return Response.json({accepted:true},{headers})
  }
  let response:Response
  if(operation==='start'){
   const {legal,operationId,...fields}=schemas.personalRegistration.parse(raw)
   const c=await db().connect();let evidence
   try{await c.query('BEGIN');evidence=await captureLegal(c,legal,operationId,service.issuer,requestId);await c.query('COMMIT')}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
   response=await registerAccount(registrationSchema.parse(fields),'personal',evidence)
  }else if(operation==='verify')response=await verifyCode(schemas.personalVerification.parse(raw),'personal')
  else response=await resendRegistration(schemas.personalResend.parse(raw).verificationId,'personal')
  const result=await response.json()
  if(response.ok)return Response.json(result,{status:response.status,headers})
  return Response.json({error:{code:response.status===429?'rate_limited':'invalid_verification'},requestId},{status:response.status,headers:{...headers,...(response.status===429?{'Retry-After':response.headers.get('retry-after')??'900'}:{})}})
 }catch(error){
  const status=error instanceof LegalError?error.code==='legal_version_changed'?409:503:error instanceof ServiceFailure||error instanceof MobileAuthError?error.status:error instanceof RateLimit?429:error instanceof z.ZodError||error instanceof BadRequest?400:503
  const code=error instanceof LegalError||error instanceof ServiceFailure||error instanceof MobileAuthError?error.code:error instanceof RateLimit?'rate_limited':status===400?'invalid_request':'dependency_unavailable'
  console.info(JSON.stringify({event:'core_registration_rejected',requestId,status}))
  return Response.json({error:{code},requestId},{status,headers:{...headers,...(status===429?{'Retry-After':'900'}:{})}})
 }finally{if(operation==='start')await delay(Math.max(0,750-(Date.now()-started)))}
}}
