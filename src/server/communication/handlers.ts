import 'server-only'
import {z} from '@/lib/validation'
import {communicationCommand,communicationQuery} from '@/modules/communication/schema'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {reply,failure,jsonBody,sameOrigin,limit} from '../http'
import {CrmError} from '../crm/core'
import {execute} from './repository'
import {query} from './queries'
export function communicationHandler(gateway?:BillingGateway){return async(request:Request)=>{try{
 if(request.method==='POST'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401)
 await limit('communication:'+request.method+':'+user.id,request.method==='GET'?120:40,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(request.method==='GET')return reply(await query(user.id,communicationQuery.parse(Object.fromEntries(new URL(request.url).searchParams))),200)
 return reply(await execute(user.id,communicationCommand.parse(await jsonBody(request,32768))),200)
 }catch(e){if(e instanceof z.ZodError)return reply({message:'Confira os campos, variáveis e limites.'},400);if(e instanceof CrmError)return reply({message:e.status===404?'Registro não encontrado.':e.status===403?'Contexto não autorizado.':'Confira aluno, contexto, modelo, instante e versão. Atualize a prévia antes de tentar novamente.'},e.status);return failure(e,'communication_unavailable')}}}
