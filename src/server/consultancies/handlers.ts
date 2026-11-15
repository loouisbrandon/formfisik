import 'server-only'
import {z} from '@/lib/validation'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {failure,jsonBody,limit,reply,sameOrigin} from '../http'
import {consultancyQuery,serviceFields,planFields,contractFields,text} from '@/modules/consultancies/schema'
import {CommercialError} from './core'
import {saveService,savePlan,archiveCatalog} from './catalog'
import {saveContract,changeContract} from './contracts'
import {changeDelivery} from './deliveries'
import {billingIntent,catalogDetail,catalogList,commercialHistory,contractDetail,contractsList,deliveriesList,deliveryDetail,evidenceCandidates,indicators} from './queries'
const id=z.uuid(),version=z.int().positive(),key={operationKey:id},edit={id:id.optional(),version:version.optional()}
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('service_save'),...key,...edit,fields:serviceFields,duplicateFrom:id.optional()}).strict(),
 z.object({action:z.literal('plan_save'),...key,...edit,fields:planFields,duplicateFrom:id.optional()}).strict(),
 z.object({action:z.literal('catalog_archive'),...key,id,version,entity:z.enum(['service','plan']),archived:z.boolean(),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('contract_save'),...key,...edit,fields:contractFields,previousId:id.optional(),previousVersion:version.optional(),allowOverlap:z.boolean(),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('contract_state'),...key,id,version,state:z.enum(['draft','active','suspended','completed','canceled']),reason:text(1000),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('delivery_change'),...key,id,version,operation:z.enum(['start','cancel','reopen','execute']),reason:text(1000),units:z.int().min(1).max(1000).optional(),evidence:z.object({type:z.enum(['workout','assessment','intake']),id,version}).strict().optional(),confirmed:z.literal(true)}).strict(),
])
const messages:Record<string,string>={not_found:'Registro não encontrado.',version:'O registro mudou. Recarregue e revise antes de continuar.',operation_key:'Esta tentativa já foi utilizada para outra intenção ou eliminada.',student_archived:'Reative o aluno antes de realizar esta operação.',catalog_archived:'Serviço ou plano indisponível para novas contratações.',plan_version:'O plano mudou. Consulte a revisão atual e confirme os novos termos.',association:'Esta associação não pode ser alterada.',period:'Confira a vigência.',deadline_period:'O prazo de uma entrega está fora da vigência.',renewal:'Esta contratação não permite a renovação solicitada.',renewal_duplicate:'Já existe uma renovação administrativa vinculada.',renewal_period:'A renovação deve iniciar depois do término do acordo anterior.',overlap:'Já existe contratação deste plano no período. Revise e confirme somente se for um acordo independente.',transition:'Transição não permitida para o estado atual.',reason:'Informe uma justificativa operacional com pelo menos cinco caracteres.',expired:'A vigência terminou. Registre uma renovação administrativa.',required_deliveries:'Conclua as entregas obrigatórias antes de concluir a contratação.',contract_inactive:'A contratação deve estar ativa e dentro da vigência para executar entregas.',units:'Confira a quantidade: não pode exceder o total previsto.',evidence:'Vincule a evidência pertinente ou informe a execução manual quando permitida.',evidence_units:'Cada evidência comprova uma unidade desta entrega.',evidence_period:'A evidência deve estar disponível e corresponder à vigência contratada.',evidence_duplicate:'Esta evidência já foi vinculada a uma execução vigente desta entrega.'}
export function consultancyHandler(gateway?:BillingGateway){return async(request:Request)=>{try{
 if(request.method==='POST'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401)
 await limit(`consultancies:${request.method}:${user.id}`,request.method==='GET'?120:40,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(request.method==='GET'){const q=consultancyQuery.parse(Object.fromEntries(new URL(request.url).searchParams));let result:object
 switch(q.view){case'services':case'plans':result=await catalogList(user.id,q);break;case'service':case'plan':if(!q.id)return reply({message:'Identifique o registro.'},400);result=await catalogDetail(user.id,q.id,q.view==='plan',q.page,q.revision);break;case'contracts':result=await contractsList(user.id,q);break;case'contract':if(!q.id)return reply({message:'Identifique o registro.'},400);result=await contractDetail(user.id,q.id,q.page,q.revision);break;case'deliveries':result=await deliveriesList(user.id,q);break;case'delivery':if(!q.id)return reply({message:'Identifique o registro.'},400);result=await deliveryDetail(user.id,q.id,q.page);break;case'history':result=await commercialHistory(user.id,q);break;case'evidence':result=await evidenceCandidates(user.id,q);break;case'indicators':result=await indicators(user.id,q);break;case'billing':if(!q.id)return reply({message:'Identifique o registro.'},400);result=await billingIntent(user.id,q.id);break}return reply(result,200)}
 const p=command.parse(await jsonBody(request,98304));let result:object
 switch(p.action){case'service_save':result=await saveService(user.id,p);break;case'plan_save':result=await savePlan(user.id,p);break;case'catalog_archive':result=await archiveCatalog(user.id,p);break;case'contract_save':result=await saveContract(user.id,p);break;case'contract_state':result=await changeContract(user.id,p);break;case'delivery_change':result=await changeDelivery(user.id,{...p,action:p.operation});break}return reply(result,200)
 }catch(e){if(e instanceof z.ZodError)return reply({message:'Confira os campos, datas, valores e limites.'},400);if(e instanceof CommercialError)return reply({message:messages[e.code]??'Não foi possível realizar a operação. Recarregue e revise.',code:e.code},e.status);return failure(e,'consultancies_unavailable')}}}
