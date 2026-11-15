import 'server-only'
import {z} from '@/lib/validation'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {clientAddress,failure,jsonBody,limit,reply,sameOrigin} from '../http'
import {formSchema} from '@/modules/intake/schema'
import * as repo from './repository'
const uuid=z.uuid(),page=z.coerce.number().int().min(1).max(100000).default(1)
const commands=z.discriminatedUnion('action',[
 z.object({action:z.literal('save'),id:uuid.optional(),revision:z.int().positive().optional(),definition:formSchema}).strict(),
 z.object({action:z.literal('publish'),id:uuid,revision:z.int().positive()}).strict(),
 z.object({action:z.literal('archive'),id:uuid}).strict(),
 z.object({action:z.literal('invite'),versionId:uuid,studentId:uuid.optional()}).strict(),
 z.object({action:z.enum(['revoke','reviewing','reviewed']),id:uuid}).strict(),
 z.object({action:z.literal('resolve'),id:uuid,studentId:uuid.optional(),createSeparate:z.boolean().optional(),confirmed:z.literal(true)}).strict(),
])
export function intakeHandler(gateway?:BillingGateway){return async(request:Request)=>{try{
 if(request.method==='POST'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401)
 await limit(`intake:private:${user.id}`,120,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(request.method==='GET'){
  const q=z.object({view:z.enum(['forms','form','requests','request','summary','version']),id:uuid.optional(),page,historyPage:page,q:z.string().trim().max(120).default(''),studentId:uuid.optional(),state:z.enum(['waiting','received','pending','reviewing','reviewed']).optional()}).strict().parse(Object.fromEntries(new URL(request.url).searchParams))
  if(q.view==='forms')return reply(await repo.listForms(user.id,q.page),200)
  if(q.view==='requests')return reply(await repo.listRequests(user.id,q.page,q.studentId,q.state,q.q),200)
  if(!q.id)throw new repo.IntakeError()
  if(q.view==='version')return reply(await repo.getVersion(user.id,q.id),200)
  if(q.view==='summary')return reply(await repo.studentIntakeSummary(user.id,q.id),200)
  return reply(q.view==='form'?await repo.getForm(user.id,q.id):await repo.getRequest(user.id,q.id,q.historyPage),200)
 }
 const p=commands.parse(await jsonBody(request,131072));let result:object
 switch(p.action){
  case 'save':result=await repo.saveForm(user.id,p.id??null,p.definition,p.revision);break
  case 'publish':result=await repo.publishForm(user.id,p.id,p.revision);break
  case 'archive':result=await repo.archiveForm(user.id,p.id);break
  case 'invite':result=await repo.invite(user.id,p.versionId,p.studentId);break
  case 'resolve':result=await repo.changeRequest(user.id,p.id,p.action,p);break
  default:result=await repo.changeRequest(user.id,p.id,p.action)
 }return reply(result,200)
}catch(e){if(e instanceof z.ZodError)return reply({message:'Confira os campos e a estrutura do formulário.'},400);if(e instanceof repo.IntakeError)return reply({message:e.status===404?'Registro não encontrado.':'Operação inválida ou registro atualizado. Recarregue e confira.'},e.status);return failure(e,'intake_unavailable')}}}
export async function publicIntakeHandler(request:Request){try{
 if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 await limit(`intake:public:ip:${clientAddress(request)}`,60,900)
 const p=z.object({token:z.string().max(100),operation:z.enum(['open','submit']),submission:z.unknown().optional()}).strict().parse(await jsonBody(request,131072))
 await limit(`intake:public:token:${p.token}`,30,900)
 return reply(p.operation==='open'?await repo.openPublic(p.token):await repo.submitPublic(p.token,p.submission),200,{'X-Robots-Tag':'noindex, nofollow, noarchive'})
}catch(e){if(e instanceof repo.IntakeError)return reply({message:'Link indisponível. Solicite um novo link ao profissional.'},410);if(e instanceof z.ZodError||e instanceof Error&&e.message==='INVALID_ANSWERS')return reply({message:'Confira as respostas e os campos obrigatórios.'},400);return failure(e,'intake_public_unavailable')}}
