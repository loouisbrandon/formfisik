import 'server-only'
import {randomUUID} from 'node:crypto'
import {z} from 'zod'
import {db} from '../db'
import {transaction} from '../exercises/repository'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import type {BillingGateway} from '../subscriptions/stripe'
import {failure,jsonBody,limit,privateHeaders,reply,sameOrigin} from '../http'
import {getPlan,WorkoutError} from '../workouts/repository'
import {exportOptions,savePresentation} from '../../modules/workout-documents/schema'
import {presentation,updatePresentation} from './presentation'
import {workoutPdf} from './pdf'
export type DocumentOperation='presentation'|'savePresentation'|'generate'|'read'
export function documentHandler(operation:DocumentOperation,gateway?:BillingGateway){return async(request:Request,id?:string)=>{try{
 const mutation=operation==='generate'||operation==='savePresentation'
 if(mutation&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const user=await readSession(sessionToken(request.headers.get('cookie')));if(!user)return reply({message:'Entre novamente para continuar.'},401)
 await limit(`documents:${operation}:${user.id}`,operation==='generate'?5:operation==='savePresentation'?15:120,60)
 const access=await professionalAccess(user,gateway);if(access.status!=='allowed')return reply(access,access.status==='denied'?403:503)
 if(operation==='presentation'||operation==='savePresentation'){let p;if(operation==='savePresentation'){const parsed=savePresentation.safeParse(await jsonBody(request,360000));if(!parsed.success)throw new WorkoutError(400,'Confira os dados de apresentação.');p=await updatePresentation(user.id,parsed.data)}else p=await presentation(user.id);const {logo,...safe}=p;void logo;return reply({presentation:safe},200)}
 if(!id||!z.uuid().safeParse(id).success)throw new WorkoutError(404,'Documento ou ficha não encontrado.')
 if(operation==='generate'){
 const parsed=exportOptions.safeParse(await jsonBody(request));if(!parsed.success)throw new WorkoutError(400,'Opções de exportação inválidas.');const o=parsed.data,p=await getPlan(user.id,id,o.version),current=await getPlan(user.id,id)
 if(p.fields.kind!=='individual'||!p.fields.studentId)throw new WorkoutError(400,'Exporte uma ficha individual de aluno.');
 if(!p.studentName||!p.professionalName)throw new WorkoutError(409,'Identidade histórica incompleta. Não foi possível exportar.')
 const owner=await db().query('SELECT 1 FROM student_links WHERE id=$1 AND professional_id=$2',[p.fields.studentId,user.id]);if(!owner.rowCount)throw new WorkoutError(404,'Documento ou ficha não encontrado.')
 if(o.divisionIds&&(!o.divisionIds.length||o.divisionIds.some(v=>!p.fields.divisions.some(d=>d.id===v))))throw new WorkoutError(400,'Selecione divisões desta versão.')
 const issued=new Date(),content=await workoutPdf(p,o,await presentation(user.id),current.version!==p.version,issued)
 const slug=(p.studentName??'aluno').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'aluno'
 const filename=`formfisik-treino-${slug}-${new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(issued)}-v${p.version}.pdf`,documentId=randomUUID()
 await transaction(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,10012))',[user.id]);await c.query('DELETE FROM workout_documents WHERE owner_id=$1 AND (expires_at<=now() OR id NOT IN(SELECT id FROM workout_documents WHERE owner_id=$1 ORDER BY created_at DESC LIMIT 2))',[user.id]);await c.query('INSERT INTO workout_documents(id,owner_id,plan_id,plan_version,filename,content) VALUES($1,$2,$3,$4,$5,$6)',[documentId,user.id,id,p.version,filename,content])})
 return reply({id:documentId,filename,expiresInSeconds:900},201)
 }
 const q=z.object({download:z.literal('1').optional()}).strict().safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!q.success)throw new WorkoutError(400,'Parâmetros inválidos.')
 const r=await db().query(`SELECT d.* FROM workout_documents d JOIN workout_plans p ON p.id=d.plan_id AND p.owner_id=d.owner_id JOIN student_links s ON s.id=p.student_link_id AND s.professional_id=d.owner_id WHERE d.id=$1 AND d.owner_id=$2 AND d.expires_at>now()`,[id,user.id]);if(!r.rowCount)throw new WorkoutError(404,'Prévia indisponível ou expirada. Gere uma nova prévia.')
 const d=r.rows[0];return new Response(new Uint8Array(d.content),{headers:{...privateHeaders,'Content-Type':'application/pdf','Content-Disposition':`${q.data.download?'attachment':'inline'}; filename="${d.filename}"`,'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"frame-ancestors 'self'; base-uri 'none'; form-action 'none'",'Cross-Origin-Resource-Policy':'same-origin'}})
 }catch(e){if(e instanceof WorkoutError)return reply({message:e.message},e.status);return failure(e,'workout_document_unavailable')}}}
