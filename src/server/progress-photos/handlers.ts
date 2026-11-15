import 'server-only'
import {z} from '@/lib/validation'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {sameOrigin,jsonBody,limit,reply,failure,privateHeaders} from '../http'
import {createRecordSchema,editRecordSchema,recordStateSchema,uploadSchema,removalSchema,photoQuery,calendarQuery,positionSchema} from '../../modules/progress-photos/schema'
import {InvalidPhoto} from './image'
import {PhotoStorageUnavailable,r2PhotoStore,type PrivatePhotoStore} from './storage'
import * as repo from './repository'
export type PhotoOperation='availability'|'choices'|'list'|'create'|'get'|'edit'|'state'|'upload'|'read'|'remove'|'history'|'calendar'
export function createPhotoHandler(operation:PhotoOperation,gateway?:BillingGateway,storage?:PrivatePhotoStore|null){return async(request:Request,id?:string)=>{try{
 if(['create','edit','state','upload','remove'].includes(operation)&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente para continuar.'},401)
 await limit(`photos:${operation}:${user.id}`,operation==='upload'?15:operation==='read'?240:['create','edit','state','remove'].includes(operation)?40:120,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(id&&!z.uuid().safeParse(id).success)throw new repo.PhotoError(404,'Registro não encontrado.')
 const store=()=>storage===undefined?r2PhotoStore():storage
 if(operation==='availability'){const s=store();return reply({configured:!!s,message:s?'Armazenamento configurado; uploads dependem de confirmação do serviço.':'Fotografias indisponíveis: o armazenamento privado R2 ainda não foi configurado. Nenhum upload será simulado.'},200)}
 if(operation==='choices'){const p=z.object({studentId:z.uuid(),date:createRecordSchema.shape.date,position:positionSchema,page:z.coerce.number().int().min(1).max(100000).default(1)}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)return reply({message:'Seleção fotográfica inválida.'},400);return reply(await repo.photoChoices(user.id,p.data.studentId,p.data.date,p.data.position,p.data.page),200)}
 if(operation==='calendar'){const q=calendarQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!q.success)return reply({message:'Período ou aluno inválido.'},400);return reply(q.data.date?await repo.calendarDay(user.id,q.data.studentId,q.data.date,q.data.page,q.data.period):await repo.calendarSummary(user.id,q.data.studentId,q.data.year,q.data.month,q.data.period),200)}
 if(operation==='list'){const q=photoQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!q.success)return reply({message:'Filtros inválidos.'},400);return reply(await repo.listPhotoRecords(user.id,q.data),200)}
 if(operation==='create'){const s=store();if(!s)throw new PhotoStorageUnavailable();const p=createRecordSchema.safeParse(await jsonBody(request));if(!p.success)return reply({message:'Confira os campos e a autorização.',errors:p.error.flatten().fieldErrors},400);return reply({record:await repo.createPhotoRecord(user.id,p.data)},201)}
 if(!id)throw new repo.PhotoError(404,'Registro não encontrado.')
 if(operation==='get')return reply({record:await repo.getPhotoRecord(user.id,id)},200)
 if(operation==='read'){const bytes=await repo.readPhoto(user.id,id,store());return new Response(new Uint8Array(bytes),{headers:{...privateHeaders,'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'none'; frame-ancestors 'self'",'X-Robots-Tag':'noindex, nofollow'}})}
 if(operation==='history'){const p=z.object({page:z.coerce.number().int().min(1).max(100000).default(1)}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!p.success)return reply({message:'Página inválida.'},400);return reply(await repo.photoHistory(user.id,id,p.data.page),200)}
 if(operation==='upload'){const p=uploadSchema.safeParse(await jsonBody(request,7*1024*1024));if(!p.success)return reply({message:'Confira o arquivo, a posição e a versão.',errors:p.error.flatten().fieldErrors},400);return reply({record:await repo.uploadPhoto(user.id,id,p.data,store(),request.signal)},201)}
 if(operation==='remove'){const p=removalSchema.safeParse(await jsonBody(request));if(!p.success)return reply({message:'Confirme versão, motivo e solicitação de remoção.'},400);return reply({record:await repo.requestPhotoRemoval(user.id,id,p.data)},202)}
 if(operation==='state'){const p=recordStateSchema.safeParse(await jsonBody(request));if(!p.success)return reply({message:'Situação ou versão inválida.'},400);return reply({record:await repo.editPhotoRecord(user.id,id,p.data.version,{state:p.data.state})},200)}
 const p=editRecordSchema.safeParse(await jsonBody(request));if(!p.success)return reply({message:'Confira data, observações e versão.',errors:p.error.flatten().fieldErrors},400);const {version,...fields}=p.data;return reply({record:await repo.editPhotoRecord(user.id,id,version,fields)},200)
 }catch(e){if(e instanceof repo.PhotoError)return reply({message:e.message},e.status);if(e instanceof InvalidPhoto)return reply({message:e.message},400);if(e instanceof PhotoStorageUnavailable)return reply({message:e.message},503);return failure(e,'progress_photos_unavailable')}}}
