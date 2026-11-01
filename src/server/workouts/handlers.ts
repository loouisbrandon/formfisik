import 'server-only'
import {z} from 'zod'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {failure,jsonBody,limit,reply,sameOrigin} from '../http'
import * as schemas from '../../modules/workouts/schema'
import * as repo from './repository'
export type WorkoutOperation='list'|'get'|'history'|'create'|'edit'|'status'|'duplicate'|'apply'
export function createWorkoutHandler(operation:WorkoutOperation,gateway?:BillingGateway){return async(request:Request,id?:string)=>{try{
 const mutation=['create','edit','status','duplicate','apply'].includes(operation)
 if(mutation&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente para continuar.'},401)
 await limit(`workouts:${operation}:${user.id}`,operation==='apply'?5:mutation?30:120,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(id&&!z.uuid().safeParse(id).success)throw new repo.WorkoutError(404,'Planejamento ou vínculo não encontrado.')
 const body=async<T>(schema:z.ZodType<T>)=>{const p=schema.safeParse(await jsonBody(request,524288));if(!p.success)throw new repo.WorkoutError(400,p.error.issues[0]?.message??'Confira o planejamento.');return p.data}
 if(operation==='list'){const q=schemas.workoutQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!q.success)throw new repo.WorkoutError(400,'Filtros inválidos.');return reply(await repo.listPlans(user.id,q.data),200)}
 if(operation==='create'){const {creationKey,...f}=await body(schemas.createWorkout);return reply({plan:await repo.createPlan(user.id,f,creationKey)},201)}
 if(!id)throw new repo.WorkoutError(404,'Planejamento ou vínculo não encontrado.')
 if(operation==='get'){const q=z.object({version:z.coerce.number().int().positive().optional()}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!q.success)throw new repo.WorkoutError(400,'Versão inválida.');return reply({plan:await repo.getPlan(user.id,id,q.data.version)},200)}
 if(operation==='history'){const q=z.object({page:z.coerce.number().int().min(1).max(10000).default(1)}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!q.success)throw new repo.WorkoutError(400,'Página inválida.');return reply(await repo.planHistory(user.id,id,q.data.page),200)}
 if(operation==='edit'){const {version,...f}=await body(schemas.editWorkout);return reply({plan:await repo.editPlan(user.id,id,version,f)},200)}
 if(operation==='status'){const b=await body(schemas.statusWorkout);return reply({plan:await repo.changePlanState(user.id,id,b.version,b.state)},200)}
 if(operation==='duplicate'){const b=await body(schemas.copyWorkout);return reply({plan:await repo.duplicatePlan(user.id,id,b.version,b.creationKey,b.name)},201)}
 const b=await body(schemas.applyWorkout);return reply(await repo.applyTemplate(user.id,id,b.version,b.creationKey,b.studentIds),201)
 }catch(e){if(e instanceof repo.WorkoutError)return reply({message:e.message},e.status);return failure(e,'workout_operation_unavailable')}}}
