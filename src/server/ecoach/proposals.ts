import 'server-only'
import {z} from '@/lib/validation'
import {db} from '../db'
import {readSession,sessionToken} from '../sessions'
import {professionalAccess} from '../professional-dashboard'
import {reply,failure,jsonBody,sameOrigin,limit} from '../http'
import {isCreateAction,isWorkoutAction,proposalAction} from '@/modules/ecoach/ai-schema'
import {WorkoutError} from '../workouts/repository'
import {CoachError,aiRuntime} from './provider'
import {aiAccess} from './access'
import {validateProposal} from './tools'
import {assertProposalScope} from './scope'
import {applyInternalAction,internalError} from './internal-actions'
export async function proposalsHandler(request:Request){try{
 if(request.method!=='GET'&&!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 const token=sessionToken(request.headers.get('cookie')),user=await readSession(token);if(!user||!token)return reply({message:'Entre novamente.'},401)
 if((await professionalAccess(user)).status!=='allowed')return reply({message:'Acesso profissional necessário.'},403)
 await limit('ecoach-proposal:'+request.method+':'+user.id,request.method==='GET'?90:15,60)
 if(request.method==='GET'){
  const {id}=z.object({id:z.uuid()}).strict().parse(Object.fromEntries(new URL(request.url).searchParams)),r=await db().query('SELECT id,action,state,result_id,expires_at FROM ecoach_proposals WHERE owner_id=$1 AND id=$2',[user.id,id]);if(!r.rowCount)throw new CoachError(404,'Proposta não encontrada.')
  const action=proposalAction.parse(r.rows[0].action),ids=isWorkoutAction(action)?action.fields.divisions.flatMap(d=>d.exercises.map(e=>e.exerciseId)):[],names=await db().query("SELECT id,name FROM exercise_entries WHERE id=ANY($2::uuid[]) AND (owner_id=$1 OR(scope='official' AND state='published'))",[user.id,ids]);const studentId='fields' in action?action.fields.studentId:null;const student=studentId?await db().query('SELECT s.full_name FROM student_links l JOIN student_records s ON s.professional_id=l.professional_id AND s.id=l.student_id WHERE l.professional_id=$1 AND l.id=$2',[user.id,studentId]):null
  return reply({proposal:{id,state:r.rows[0].state,resultId:r.rows[0].result_id,expiresAt:r.rows[0].expires_at.toISOString(),action,studentName:student?.rows[0]?.full_name??null,exerciseNames:Object.fromEntries(names.rows.map(n=>[n.id,n.name]))}},200)
 }
 const input=z.object({id:z.uuid(),action:z.enum(['apply','reject']),confirmed:z.literal(true)}).strict().parse(await jsonBody(request,1024))
 const c=await db().connect();try{await c.query('BEGIN');await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);const r=await c.query('SELECT * FROM ecoach_proposals WHERE owner_id=$1 AND id=$2 FOR UPDATE',[user.id,input.id]);if(!r.rowCount)throw new CoachError(404,'Proposta não encontrada.');const row=r.rows[0],action=proposalAction.parse(row.action)
 await aiAccess(user.id,token,input.action==='apply'?(isCreateAction(action)?'create':'edit'):undefined,c)
 if(input.action==='apply')assertProposalScope(action)
 if(input.action==='reject'){if(row.state==='applied')throw new CoachError(409,'A proposta já foi aplicada.');await c.query("UPDATE ecoach_proposals SET state='rejected' WHERE owner_id=$1 AND id=$2",[user.id,input.id]);await c.query('COMMIT');return reply({state:'rejected'},200)}
 if(!aiRuntime().ready)throw new CoachError(503,'A integração de IA está desativada ou incompleta.')
 if(row.state==='applied'){await c.query('COMMIT');return reply({state:'applied',resultId:row.result_id},200)}
 if(row.state!=='pending'||row.expires_at.getTime()<=Date.now())throw new CoachError(409,'A proposta expirou ou foi recusada. Solicite outra.')
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,10010))',[user.id]);await validateProposal(c,user.id,action)
 const resultId=await applyInternalAction(c,user.id,action,input.id)
 await c.query("UPDATE ecoach_proposals SET state='applied',result_id=$3 WHERE owner_id=$1 AND id=$2",[user.id,input.id,resultId]);await c.query('COMMIT');return reply({state:'applied',resultId},200)
 }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
 }catch(caught){const e=internalError(caught);if(e instanceof CoachError||e instanceof WorkoutError)return reply({message:e.message},e.status);if(e instanceof z.ZodError)return reply({message:'Proposta ou confirmação inválida.'},400);return failure(e,'ecoach_proposal_unavailable')}}
