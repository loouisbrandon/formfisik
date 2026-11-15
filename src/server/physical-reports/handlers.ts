import 'server-only'
import {z} from '@/lib/validation'
import {db} from '../db'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {sameOrigin,jsonBody,limit,reply,failure} from '../http'
import {WorkoutError} from '../workouts/repository'
import {PhotoError} from '../progress-photos/repository'
import {PhotoStorageUnavailable,r2PhotoStore,type PrivatePhotoStore} from '../progress-photos/storage'
import {positionSchema} from '../../modules/progress-photos/schema'
import {dateSchema} from '../../modules/assessments/schema'
import {rangeFields,reportOptions} from '../../modules/physical-reports/schema'
import {pdfResponse} from '../documents/artifacts'
import {generateReport,readReport,reportCandidates,reportPhotoCandidates,ownedReportStudent} from './repository'
export type ReportOperation='candidates'|'photos'|'generate'|'read'|'discard'
export function reportHandler(op:ReportOperation,gateway?:BillingGateway,storage?:PrivatePhotoStore|null){return async(r:Request,id:string)=>{try{if(['generate','discard'].includes(op)&&!sameOrigin(r))return reply({message:'Origem não permitida.'},403);const user=await readSession(sessionToken(r.headers.get('cookie')));if(!user)return reply({message:'Entre novamente para continuar.'},401);await limit('physical-reports:'+op+':'+user.id,op==='generate'?5:120,60);const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503);if(!z.uuid().safeParse(id).success)throw new WorkoutError(404,'Relatório ou aluno não encontrado.');const store=()=>storage===undefined?r2PhotoStore():storage;
 if(op==='generate'){const p=reportOptions.safeParse(await jsonBody(r,16384));if(!p.success)return reply({message:p.error.issues[0]?.message??'Configuração inválida.'},400);return reply(await generateReport(user.id,id,p.data,store()),201)}
 if(op==='read'){const p=z.object({download:z.literal('1').optional()}).strict().safeParse(Object.fromEntries(new URL(r.url).searchParams));if(!p.success)return reply({message:'Parâmetros inválidos.'},400);const d=await readReport(user.id,id);return pdfResponse(d.content,d.filename,!!p.data.download)}
 if(op==='discard'){await db().query("DELETE FROM workout_documents WHERE owner_id=$1 AND id=$2 AND kind='physical_report'",[user.id,id]);return reply({message:'Artefato temporário descartado.'},200)}
 const p=z.object({range:z.enum(['all','30','90','6m','12m','custom']).default('all'),from:z.string().default(''),to:z.string().default(''),page:z.coerce.number().int().min(1).max(100000).default(1),date:dateSchema.optional(),position:positionSchema.optional(),recordId:z.uuid().optional()}).strict().safeParse(Object.fromEntries(new URL(r.url).searchParams));if(!p.success)return reply({message:'Período ou filtros inválidos.'},400);const period=rangeFields.safeParse({range:p.data.range,from:p.data.from,to:p.data.to});if(!period.success)return reply({message:period.error.issues[0].message},400);if(op==='candidates')return reply({photosConfigured:!!store(),...await reportCandidates(user.id,id,period.data,p.data.page)},200);const configured=!!store();if(!configured){await ownedReportStudent(user.id,id);return reply({configured:false,items:[],total:0,page:1,pages:1},200)};return reply({configured,...await reportPhotoCandidates(user.id,id,period.data,p.data.page,p.data.position,p.data.recordId,p.data.date)},200)
 }catch(e){if(e instanceof WorkoutError||e instanceof PhotoError)return reply({message:e.message},e.status);if(e instanceof PhotoStorageUnavailable)return reply({message:e.message},503);return failure(e,'physical_report_unavailable')}}}
