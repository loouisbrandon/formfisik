import 'server-only'
import {randomUUID} from 'node:crypto'
import {setTimeout as delay} from 'node:timers/promises'
import {z} from '@/lib/validation'
import {recoverySchema,resetTokenSchema,resetPasswordSchema} from '@/modules/auth/recovery-schema'
import {requestRecoveryAccount,validateResetToken,resetAccountPassword} from '../password-recovery'
import {authorizeService,ServiceFailure} from './service-auth'
import {jsonBody,limit,privateHeaders,RateLimit,BadRequest} from '../http'
type Operation='request'|'validate'|'reset'
export function recoveryHandler(operation:Operation){return async(request:Request)=>{
 const requestId=randomUUID(),started=Date.now(),headers={...privateHeaders,'X-Request-Id':requestId}
 try{
  await authorizeService(request,`core:recovery:${operation}`)
  await limit('core-recovery:'+operation,operation==='request'?30:120,60)
  const raw=await jsonBody(request)
  const response=operation==='request'?await requestRecoveryAccount(recoverySchema.parse(raw),true):operation==='validate'?await validateResetToken(resetTokenSchema.parse(raw).token):await resetAccountPassword(resetPasswordSchema.parse(raw))
  if(!response.ok)return Response.json({error:{code:'invalid_reset_token'},requestId},{status:400,headers})
  const data=await response.json()
  return Response.json(operation==='reset'?{reset:true,message:data.message}:data,{status:response.status,headers})
 }catch(error){
  const status=error instanceof ServiceFailure?error.status:error instanceof RateLimit?429:error instanceof z.ZodError||error instanceof BadRequest?400:503
  const code=error instanceof ServiceFailure?error.code:error instanceof RateLimit?'rate_limited':status===400?'invalid_request':'dependency_unavailable'
  console.info(JSON.stringify({event:'core_recovery_rejected',requestId,status}))
  return Response.json({error:{code},requestId},{status,headers:{...headers,...(status===429?{'Retry-After':'900'}:{})}})
 }finally{if(operation==='request')await delay(Math.max(0,750-(Date.now()-started)))}
}}
