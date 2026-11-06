import 'server-only'
import {z} from '@/lib/validation'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {failure,jsonBody,limit,reply,sameOrigin} from '../http'
import {portfolioQuery,assessmentQuery,createAssessment,editAssessment,statusAssessment,assessmentFields} from '../../modules/assessments/schema'
import * as repo from './repository'
export type AssessmentOperation='portfolio'|'list'|'create'|'get'|'edit'|'status'|'history'
export function createAssessmentHandler(operation:AssessmentOperation,gateway?:BillingGateway){return async(request:Request,id?:string)=>{try{
 if(['create','edit','status'].includes(operation)&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente para continuar.'},401)
 await limit(`assessments:${operation}:${user.id}`,['portfolio','list','get','history'].includes(operation)?120:40,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(id&&!z.uuid().safeParse(id).success)throw new repo.AssessmentError(404,'Avaliação não encontrada.')
 if(operation==='portfolio'){const p=portfolioQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)return reply({message:'Filtros inválidos.'},400);return reply(await repo.assessmentPortfolio(user.id,p.data),200)}
 if(operation==='list'){const parsed=assessmentQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!parsed.success)return reply({message:'Filtros inválidos.'},400);const q=parsed.data;if(q.view==='compare'){const {comparison:c}=await repo.compareAssessments(user.id,q);return reply({comparison:c?{from:{date:c.from.date},to:{date:c.to.date},days:c.days,values:c.values}:null},200)}return reply(q.view==='series'?await repo.assessmentSeries(user.id,q):await repo.listAssessments(user.id,q),200)}
 if(operation==='create'){const p=createAssessment.safeParse(await jsonBody(request,16000));if(!p.success)return reply({message:'Confira os campos.',errors:p.error.flatten().fieldErrors},400);return reply({assessment:await repo.createPhysicalAssessment(user.id,p.data.studentId,assessmentFields.parse(Object.fromEntries(Object.entries(p.data).filter(([k])=>!['studentId','creationKey'].includes(k)))),p.data.creationKey)},201)}
 if(!id)throw new repo.AssessmentError(404,'Avaliação não encontrada.')
 if(operation==='get')return reply({assessment:await repo.getAssessment(user.id,id)},200)
 if(operation==='history'){const p=z.object({page:z.coerce.number().int().min(1).max(100000).default(1)}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)return reply({message:'Página inválida.'},400);return reply(await repo.assessmentHistory(user.id,id,p.data.page),200)}
 if(operation==='status'){const p=statusAssessment.safeParse(await jsonBody(request));if(!p.success)return reply({message:'Situação ou versão inválida.'},400);return reply({assessment:await repo.updatePhysicalAssessment(user.id,id,p.data.version,{state:p.data.state})},200)}
 const p=editAssessment.safeParse(await jsonBody(request,16000));if(!p.success)return reply({message:'Confira os campos.',errors:p.error.flatten().fieldErrors},400);const {version,...fields}=p.data;return reply({assessment:await repo.updatePhysicalAssessment(user.id,id,version,fields)},200)
 }catch(e){if(e instanceof repo.AssessmentError)return reply({message:e.message},e.status);return failure(e,'assessment_operation_unavailable')}}}
