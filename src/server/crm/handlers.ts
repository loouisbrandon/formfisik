import 'server-only'
import {z} from '@/lib/validation'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {failure,jsonBody,limit,reply,sameOrigin} from '../http'
import {crmQuery,stageFields,taskFields} from '@/modules/crm/schema'
import {configuration,CrmError,initializeCrm,transaction} from './core'
import {overview} from './overview'
import {board,cards} from './facts'
import {archiveStage,move,previewArchive,previewMove,reorderStages,saveStage,settings} from './stages'
import {getTask,history,listTasks,saveTask,synchronizeTasks,taskStatus} from './tasks'
const id=z.uuid(),key={operationKey:id},version=z.int().positive(),boardVersion={boardVersion:version}
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('stage_save'),...key,...boardVersion,id:id.optional(),fields:stageFields}).strict(),
 z.object({action:z.literal('stage_order'),...key,...boardVersion,ids:z.array(id).min(1).max(40)}).strict(),
 z.object({action:z.literal('settings'),...key,...boardVersion,initialStageId:id,recentDays:z.int().min(1).max(365),autoReview:z.boolean(),autoWorkout:z.boolean(),autoAssessment:z.boolean()}).strict(),
 z.object({action:z.literal('move_preview'),studentId:id,to:id}).strict(),
 z.object({action:z.literal('move'),...key,...boardVersion,studentId:id,to:id,version,acknowledgedRecommendations:z.boolean(),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('archive_preview'),stageId:id,to:id.optional()}).strict(),
 z.object({action:z.literal('stage_archive'),...key,...boardVersion,stageId:id,to:id.optional(),digest:z.string().regex(/^[a-f0-9]{64}$/),acknowledgedRecommendations:z.boolean(),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('task_save'),...key,id:id.optional(),version:version.optional(),studentId:id.nullable(),fields:taskFields}).strict(),
 z.object({action:z.literal('task_status'),...key,id,version,status:z.enum(['pending','in_progress','waiting','completed','canceled'])}).strict(),
 z.object({action:z.literal('task_archive'),...key,id,version}).strict(),
 z.object({action:z.literal('synchronize'),...key,...boardVersion,after:id.optional()}).strict(),
])
const messages:Record<string,string>={conditions:'Há condições obrigatórias não satisfeitas. Confira a prévia atual.',recommendations:'Confirme a ciência das recomendações antes de movimentar.',board_version:'As etapas ou regras mudaram. Recarregue antes de continuar.',position_version:'O atendimento foi movimentado em outra operação. Recarregue.',task_version:'Esta tarefa foi atualizada ou arquivada. Recarregue.',student_archived:'Reative o aluno para alterar o atendimento.',stage_name:'Já existe uma etapa com esse nome.',stage_limit:'Limite de 16 etapas ativas e 40 etapas totais.',initial_stage:'Escolha outra etapa inicial antes de desativar ou arquivar esta.',stage_unavailable:'Etapa indisponível ou já selecionada.',preview_changed:'A prévia mudou. Revise e confirme novamente.',operation_key:'Esta tentativa já foi utilizada para outra intenção ou eliminada.',target_required:'Escolha a etapa de transferência.',not_found:'Registro não encontrado.'}
export function crmHandler(gateway?:BillingGateway){return async(request:Request)=>{try{
 if(request.method==='POST'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente.'},401)
 await limit(`crm:${request.method}:${user.id}`,request.method==='GET'?120:60,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 await initializeCrm(user.id)
 if(request.method==='GET'){
  const q=crmQuery.parse(Object.fromEntries(new URL(request.url).searchParams))
  if(q.view==='overview')return reply(await overview(user.id,q),200)
  if(q.view==='settings')return reply(await configuration(user.id),200)
  if(q.view==='tasks')return reply(await listTasks(user.id,q),200)
  if(q.view==='task'){if(!q.id)throw new CrmError(400);return reply(await getTask(user.id,q.id),200)}
  if(q.view==='history')return reply(await history(user.id,q),200)
  if(q.view==='board')return reply(await transaction(async c=>{await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');const cfg=await configuration(user.id,c);return {...await board(user.id,q,cfg.settings.initial_stage_id,c),...cfg}}),200)
  return reply(await cards(user.id,q),200)
 }
 const p=command.parse(await jsonBody(request,32768));let result:object
 switch(p.action){case'stage_save':result=await saveStage(user.id,p);break;case'stage_order':result=await reorderStages(user.id,p);break;case'settings':result=await settings(user.id,p);break;case'move_preview':result=await previewMove(user.id,p.studentId,p.to);break;case'move':result=await move(user.id,p);break;case'archive_preview':result=await previewArchive(user.id,p.stageId,p.to);break;case'stage_archive':result=await archiveStage(user.id,p);break;case'task_save':result=await saveTask(user.id,p);break;case'task_status':result=await taskStatus(user.id,p);break;case'task_archive':result=await taskStatus(user.id,{...p,archive:true});break;case'synchronize':await limit(`crm:synchronize:${user.id}`,10,60);result=await synchronizeTasks(user.id,p);break}
 return reply(result,200)
 }catch(e){if(e instanceof z.ZodError)return reply({message:'Confira os campos, filtros e limites do CRM.'},400);if(e instanceof CrmError)return reply({message:messages[e.code]??'Operação inválida ou registro atualizado. Recarregue e confira.',code:e.code},e.status);return failure(e,'crm_unavailable')}}}
