import 'server-only'
import {assistanceCommand,assistanceQuery} from '@/modules/communication/assistance-schema'
import {readSession,sessionToken} from '../../sessions'
import {failure,reply,sameOrigin,jsonBody,limit,RateLimit} from '../../http'
import {CoachError,type CoachProvider} from '../../ecoach/provider'
import {CrmError} from '../../crm/core'
import {supportAccess} from './access'
import {mutateAssistance,readAssistance} from './repository'
import {processSupportJob} from './engine'
import {z} from '@/lib/validation'
import {db} from '../../db'
// Provider injection is server-side test infrastructure, never a request option.
export function createAssistanceHandler(provider?:CoachProvider){return async function assistanceHandler(request:Request){try{
 if(request.method!=='GET'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token);if(!user||!token)return reply({message:'Entre novamente.'},401)
 await supportAccess(user.id,token);await limit('support:'+request.method+':'+user.id,request.method==='GET'?120:40,60)
 if(request.method==='GET')return reply(await readAssistance(user.id,assistanceQuery.parse(Object.fromEntries(new URL(request.url).searchParams))),200)
 const input=assistanceCommand.parse(await jsonBody(request,16384)),result=await mutateAssistance(user.id,token,input)
 if(result.jobId){try{await processSupportJob(user.id,token,result.jobId,request.signal,provider)}catch(e){
  const message=e instanceof CoachError?e.message:e instanceof RateLimit?'Limite de preparação de respostas atingido. Tente novamente mais tarde.':'Mensagem registrada, mas não foi possível preparar a sugestão. Atualize para consultar a solicitação.'
  try{await db().query("UPDATE communication_inbox_jobs SET state='canceled',instructions='',failure=$3 WHERE owner_id=$1 AND id=$2 AND state='queued'",[user.id,result.jobId,message])}catch{console.error('communication_preparation_state_unavailable')}
  return reply({...result,automationError:message},200)
 }}
 return reply(result,200)
 }catch(e){if(e instanceof CoachError)return reply({message:e.message},e.status);if(e instanceof CrmError)return reply({message:'Confira o vínculo ativo, os campos e a versão do registro.'},e.status);if(e instanceof z.ZodError)return reply({message:'Confira os campos e limites do atendimento.'},400);return failure(e,'communication_assistance_unavailable')}}

}
export const assistanceHandler=createAssistanceHandler()
