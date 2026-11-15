import 'server-only'
import {z} from '@/lib/validation'
import {checkinCommand,checkinQuery} from '@/modules/checkins/schema'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {reply,failure,jsonBody,sameOrigin,limit,clientAddress} from '../http'
import {IntakeError} from '../intake/repository'
import {CrmError} from '../crm/core'
import {execute,publicAccess,CheckinError} from './repository'
import {query} from './queries'
function rejected(e:CheckinError|IntakeError|CrmError){return reply({message:e.status===404?'Registro não encontrado.':e.status===410?'Link indisponível. Solicite outro ao profissional.':'Confira os campos, a versão, os vínculos e a janela de resposta. Atualize antes de tentar novamente.'},e.status)}
export function checkinHandler(gateway?:BillingGateway){return async(request:Request)=>{try{if(request.method==='POST'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403);const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401);await limit('checkin:'+request.method+':'+user.id,request.method==='GET'?120:40,60);const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503);if(request.method==='GET')return reply(await query(user.id,checkinQuery.parse(Object.fromEntries(new URL(request.url).searchParams))),200);return reply(await execute(user.id,checkinCommand.parse(await jsonBody(request,131072))),200)}catch(e){if(e instanceof z.ZodError)return reply({message:'Confira os campos e limites do formulário.'},400);if(e instanceof CheckinError||e instanceof IntakeError||e instanceof CrmError)return rejected(e);return failure(e,'checkin_unavailable')}}}
export async function publicCheckinHandler(request:Request){try{if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403);await limit('checkin:public:ip:'+clientAddress(request),60,900);const p=z.object({token:z.string().max(100)}).passthrough().parse(await jsonBody(request,131072));await limit('checkin:public:token:'+p.token,30,900);return reply(await publicAccess(p),200,{'X-Robots-Tag':'noindex, nofollow, noarchive'})}catch(e){if(e instanceof z.ZodError)return reply({message:'Confira as respostas e os limites.'},400);if(e instanceof CheckinError||e instanceof CrmError)return reply({message:e.status===400?'Confira as respostas e os campos obrigatórios.':'Link indisponível. Solicite outro ao profissional.'},e.status===400?400:410,{'X-Robots-Tag':'noindex, nofollow, noarchive'});return failure(e,'checkin_public_unavailable')}}
