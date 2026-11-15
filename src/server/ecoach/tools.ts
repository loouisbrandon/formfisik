import 'server-only'
import type {PoolClient} from 'pg'
import {z} from '@/lib/validation'
import {db} from '../db'
import {queryFinance} from '../finance/queries'
import {financeQuery} from '@/modules/finance/schema'
import {listStudents} from '../students/repository'
import {studentQuerySchema} from '@/modules/students/schema'
import {listExercises} from '../exercises/repository'
import {exerciseQuery} from '@/modules/exercises/schema'
import {getPlan,listPlans,validateExercises} from '../workouts/repository'
import {workoutQuery} from '@/modules/workouts/schema'
import {CoachError} from './provider'
import {prepareInternalAction} from './internal-actions'
import {listForms,getForm} from '../intake/repository'
import {queryAgenda} from '../agenda/queries'
import {agendaQuery} from '@/modules/agenda/schema'
import {isWorkoutAction,type AiDecision,type ProposalAction,type SourceReference} from '@/modules/ecoach/ai-schema'
export async function readTool(owner:string,input:Extract<AiDecision,{kind:'query'}>):Promise<{data:unknown;source:SourceReference}>{
 if(input.name==='finance_summary'||input.name==='finance_charges'){
  const args=z.object({from:z.iso.date(),to:z.iso.date(),status:z.enum(['all','open','overdue','paid']).default('all'),page:z.int().min(1).max(5).default(1)}).strict().parse(input.args)
  const data=await queryFinance(owner,financeQuery.parse({...args,view:input.name==='finance_summary'?'overview':'charges'}))
  if(input.name==='finance_charges'){const result=data as {items:Record<string,unknown>[];total:number;page:number};return {data:{...result,items:result.items.map(i=>({id:i.id,student:i.full_name,amountCents:i.amount_cents,paidCents:i.paid_cents,manualCents:i.manual,dueOn:i.due_on,state:i.effective_state}))},source:{label:`Cobranças ${args.from} a ${args.to}`,href:'/financeiro'}}}
  return {data,source:{label:`Resumo financeiro ${args.from} a ${args.to}`,href:'/financeiro'}}
 }
 if(input.name==='students'){const q=studentQuerySchema.parse(input.args);if(q.page>5)throw new CoachError(400,'Limite de páginas da consulta.');const data=await listStudents(owner,q);return {data:{items:data.items.map((s:{id:string;fullName:string;status:string})=>({id:s.id,name:s.fullName,status:s.status})),total:data.total,page:data.page},source:{label:'Carteira de alunos',href:'/alunos'}}}
 if(input.name==='exercises'){const q=exerciseQuery.parse(input.args);if(q.page>5)throw new CoachError(400,'Limite de páginas da consulta.');return {data:await listExercises(owner,q),source:{label:'Biblioteca de exercícios',href:'/exercicios'}}}
 if(input.name==='workouts'){const q=workoutQuery.parse(input.args);if(q.page>5)throw new CoachError(400,'Limite de páginas da consulta.');return {data:await listPlans(owner,q),source:{label:'Planejamentos de treino',href:'/treinos'}}}
 if(input.name==='intake_forms'){const {page}=z.object({page:z.int().min(1).max(5).default(1)}).strict().parse(input.args);return {data:await listForms(owner,page),source:{label:'Modelos de anamnese',href:'/anamneses'}}}
 if(input.name==='intake_form'){const {id}=z.object({id:z.uuid()}).strict().parse(input.args),form=await getForm(owner,id);return {data:{id:form.id,revision:form.revision,archived:form.archived,definition:form.definition},source:{label:form.definition.title,href:'/anamneses?form='+id}}}
 if(['agenda','agenda_settings','agenda_types','appointment'].includes(input.name)){
  const views={agenda:'list',agenda_settings:'settings',agenda_types:'types',appointment:'detail'} as const
  const args=z.object({from:z.iso.date().optional(),to:z.iso.date().optional(),id:z.uuid().optional(),page:z.int().min(1).max(5).default(1),q:z.string().max(100).default('')}).strict().parse(input.args)
  if(input.name==='agenda'&&(!args.from||!args.to))throw new CoachError(400,'Informe o período da agenda.')
  if(input.name==='appointment'&&!args.id)throw new CoachError(400,'Informe o compromisso.')
  const q=agendaQuery.parse({...args,view:views[input.name as keyof typeof views]}),data=await queryAgenda(owner,q)
  if(input.name==='appointment'){const item=data as Record<string,unknown>;return {data:{id:item.id,version:item.version,kind:item.kind,title:item.private_title,studentId:item.student_link_id,typeId:item.type_id,date:item.date,time:item.local_time,timezone:item.timezone,start:item.starts_at,end:item.ends_at,fold:item.fold,mode:item.mode,location:item.location,notes:item.notes,contractId:item.contract_id,deliveryId:item.delivery_id,state:item.state},source:{label:'Compromisso selecionado',href:'/agenda'}}}
  if(input.name==='agenda'){const list=data as {items:Record<string,unknown>[];total:number;page:number;timezone:string};return {data:{total:list.total,page:list.page,timezone:list.timezone,items:list.items.map(i=>({id:i.id,version:i.version,kind:i.kind,title:i.title,student:i.full_name,start:i.starts_at,end:i.ends_at,state:i.projected_state,timezone:i.timezone}))},source:{label:'Agenda do período',href:'/agenda'}}}
  return {data,source:{label:input.name==='agenda_settings'?'Disponibilidade da agenda':input.name==='agenda_types'?'Tipos de sessão':'Agenda do período',href:'/agenda'}}
 }
 const {id}=z.object({id:z.uuid()}).strict().parse(input.args),plan=await getPlan(owner,id);return {data:{id:plan.id,version:plan.version,state:plan.state,fields:plan.fields},source:{label:plan.fields.name,href:'/treinos/'+plan.id}}
}
export async function validateProposal(c:PoolClient,owner:string,action:ProposalAction){
 if(!isWorkoutAction(action))return prepareInternalAction(c,owner,action)

 if(action.fields.divisions.length>5||action.fields.divisions.reduce((n,d)=>n+d.exercises.length,0)>20)throw new CoachError(400,'Limite de 5 divisões e 20 exercícios por proposta de IA.')
 let previous
 if(action.kind==='edit_workout'){const found=await c.query('SELECT document,state,version FROM workout_plans WHERE owner_id=$1 AND id=$2 FOR SHARE',[owner,action.id]);const plan=found.rows[0];if(!plan)throw new CoachError(404,'Treino indisponível.');if(plan.state!=='draft'||plan.version!==action.version)throw new CoachError(409,'Nesta etapa, a IA edita apenas rascunhos na versão atual.');if(plan.document.kind!==action.fields.kind||plan.document.studentId!==action.fields.studentId)throw new CoachError(400,'Não é possível transferir o aluno ou tipo do treino.');previous=plan.document}
 if(action.fields.studentId&&!(await c.query("SELECT 1 FROM student_links WHERE professional_id=$1 AND id=$2 AND status='active'",[owner,action.fields.studentId])).rowCount)throw new CoachError(404,'Aluno indisponível.')
 await validateExercises(c,owner,action.fields,previous)
 return action
}
export async function validateProposalRead(owner:string,action:ProposalAction){const c=await db().connect();try{await c.query('BEGIN');return await validateProposal(c,owner,action)}finally{await c.query('ROLLBACK');c.release()}}
