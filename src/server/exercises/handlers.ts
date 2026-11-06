import 'server-only'
import {z} from '@/lib/validation'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {failure,jsonBody,limit,reply,sameOrigin} from '../http'
import * as schemas from '../../modules/exercises/schema'
import * as repo from './repository'
export type ExerciseOperation='list'|'get'|'create'|'edit'|'status'|'selection'|'requests'|'request'|'submit'|'queue'|'reviewDetail'|'review'|'capability'|'candidates'
export function createExerciseHandler(operation:ExerciseOperation,gateway?:BillingGateway){return async(request:Request,id?:string)=>{try{
 const mutation=['create','edit','status','selection','submit','review'].includes(operation)
 if(mutation&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente para continuar.'},401)
 await limit(`exercises:${operation}:${user.id}`,['submit','review'].includes(operation)?20:mutation?40:120,60)
 const moderation=['queue','reviewDetail','review','candidates'].includes(operation)
 if(moderation){if(!await repo.canModerate(user.id))return reply({message:'Moderação não autorizada.'},403)}else{const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)}
 if(id&&!z.uuid().safeParse(id).success)throw new repo.ExerciseError(404,'Registro não encontrado.')
 const body=async<T>(schema:z.ZodType<T>):Promise<T>=>{const p=schema.safeParse(await jsonBody(request));if(!p.success)throw new repo.ExerciseError(400,'Confira os campos e seleções do formulário.');return p.data}
 if(operation==='capability')return reply({moderator:await repo.canModerate(user.id)},200)
 if(operation==='candidates'&&new URL(request.url).searchParams.has('id')){const p=z.object({id:z.uuid()}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)throw new repo.ExerciseError(400,'Referência inválida.');const exercise=await repo.getExercise(user.id,p.data.id);if(exercise.scope!=='official'||exercise.state!=='published')throw new repo.ExerciseError(404,'Registro não encontrado.');return reply({exercise},200)}
 if(operation==='list'||operation==='candidates'){const p=schemas.exerciseQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)throw new repo.ExerciseError(400,'Filtros inválidos.');return reply(await repo.listExercises(user.id,operation==='candidates'?{...p.data,scope:'official',state:'active'}:p.data),200)}
 if(operation==='create')return reply({exercise:await repo.createExercise(user.id,await body(schemas.exerciseCreate))},201)
 if(operation==='selection')return reply({items:await repo.selectExercises(user.id,(await body(schemas.selectionSchema)).ids)},200)
 if(operation==='submit')return reply({request:await repo.submitRequest(user.id,await body(schemas.requestCreate))},201)
 if(operation==='requests'||operation==='queue'){const p=schemas.requestQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)throw new repo.ExerciseError(400,'Filtros inválidos.');return reply(await repo.listRequests(user.id,p.data.state,p.data.page,moderation),200)}
 if(!id)throw new repo.ExerciseError(404,'Registro não encontrado.')
 if(operation==='get')return reply({exercise:await repo.getExercise(user.id,id)},200)
 if(operation==='edit'){const input=await body(schemas.exerciseEdit);return reply({exercise:await repo.updateExercise(user.id,id,input.version,repo.inputFields(input))},200)}
 if(operation==='status'){const input=await body(schemas.exerciseStatus);return reply({exercise:await repo.updateExercise(user.id,id,input.version,{state:input.state})},200)}
 if(operation==='request'||operation==='reviewDetail')return reply({request:await repo.getRequest(user.id,id,moderation)},200)
 return reply({request:await repo.reviewRequest(user.id,id,await body(schemas.reviewSchema))},200)
 }catch(e){if(e instanceof repo.ExerciseError)return reply({message:e.message},e.status);return failure(e,'exercise_operation_unavailable')}}}
