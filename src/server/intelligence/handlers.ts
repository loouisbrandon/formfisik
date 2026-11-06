import 'server-only'
import {z} from '@/lib/validation'
import {intelligenceQuery} from '@/modules/intelligence/schema'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {reply,failure,limit} from '../http'
import {report} from './repository'
export function intelligenceHandler(gateway?:BillingGateway){return async(request:Request)=>{try{const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401);await limit('intelligence:'+user.id,30,60);const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503);return reply(await report(user.id,intelligenceQuery.parse(Object.fromEntries(new URL(request.url).searchParams))),200)}catch(e){if(e instanceof z.ZodError)return reply({message:'Informe um período válido de até 367 datas.'},400);return failure(e,'intelligence_unavailable')}}}
