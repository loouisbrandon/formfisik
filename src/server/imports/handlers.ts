import 'server-only'
import {z} from '@/lib/validation'
import {importCommand,importQuery} from '@/modules/imports/schema'
import {ImportFileError} from '@/modules/imports/files'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {reply,failure,jsonBody,sameOrigin,limit,privateHeaders} from '../http'
import {CrmError} from '../crm/core'
import {execute,read,downloadReport} from './repository'
export function importsHandler(gateway?:BillingGateway){return async(request:Request)=>{try{
 if(request.method==='POST'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401);await limit('imports:'+request.method+':'+user.id,120,60);const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(request.method==='GET'){const q=importQuery.parse(Object.fromEntries(new URL(request.url).searchParams));if(q.view==='report'){await limit('imports:report:'+user.id,10,60);return new Response(await downloadReport(user.id,q.id!),{headers:{...privateHeaders,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="formfisik-importacao.csv"','X-Robots-Tag':'noindex, nofollow'}})}return reply(await read(user.id,q),200)}
 const command=importCommand.parse(await jsonBody(request,3145728));if(command.action==='preview')await limit('imports:preview:'+user.id,5,60);if(command.action==='process')await limit('imports:process:'+user.id,60,60);return reply(await execute(user.id,command),200)
 }catch(e){if(e instanceof z.ZodError)return reply({message:'Confira formato, mapeamento e limites dos campos.'},400);if(e instanceof ImportFileError)return reply({message:e.message},400);if(e instanceof CrmError)return reply({message:e.status===404?'Importação não encontrada.':e.code==='pending_limit'?'Conclua ou cancele uma das três importações abertas antes de enviar outra.':e.code==='expired'?'Os dados temporários expiraram. Envie o arquivo novamente.':'A prévia mudou ou a ação não é permitida. Atualize a importação.'},e.status);return failure(e,'imports_unavailable')}}}
