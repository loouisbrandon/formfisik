import 'server-only'
import type {PoolClient} from 'pg'
import {agendaCommand} from '@/modules/agenda/schema'
import {CalendarTimeError,resolveLocal} from '@/modules/agenda/time'
import {isWorkoutAction,type ProposalAction} from '@/modules/ecoach/ai-schema'
import {buildPlan} from '../agenda/planning'
import {executeAgenda} from '../agenda/repository'
import {ownerLock,AgendaError} from '../agenda/core'
import {saveFormInTransaction,IntakeError} from '../intake/repository'
import {createPlanInTransaction,editPlanInTransaction} from '../workouts/repository'
import {CoachError} from './provider'
export async function prepareInternalAction(c:PoolClient,owner:string,action:ProposalAction):Promise<ProposalAction>{
 if(isWorkoutAction(action))return action
 if(action.kind==='create_intake'||action.kind==='edit_intake'){
  if(action.kind==='edit_intake'){const r=await c.query("SELECT revision,archived FROM intake_forms WHERE professional_id=$1 AND id=$2 AND usage='intake' FOR UPDATE",[owner,action.id]);if(!r.rowCount)throw new CoachError(404,'Anamnese indisponível.');if(r.rows[0].archived||r.rows[0].revision!==action.revision)throw new CoachError(409,'A anamnese mudou ou foi arquivada. Solicite uma nova proposta.')}
  return action
 }
 if(action.kind==='edit_appointment')action={...action,fields:{...action.fields,recurrence:{frequency:'once',end:{mode:'count',count:1}}}}
 if(resolveLocal(action.fields.date,action.fields.time,action.fields.timezone,action.fields.fold)<=Date.now())throw new CoachError(400,'Escolha uma data e horário futuros para agendar.')
 // Same lock and preview used by manual scheduling. No booking is written here.
 await ownerLock(c,owner)
 let plan=await buildPlan(c,owner,action.fields,action.kind==='edit_appointment'?action.id:undefined,action.kind==='edit_appointment'?action.version:undefined,'one')
 if(plan.type&&action.fields.duration!==plan.type.document.duration){action={...action,fields:{...action.fields,duration:plan.type.document.duration}};plan=await buildPlan(c,owner,action.fields,action.kind==='edit_appointment'?action.id:undefined,action.kind==='edit_appointment'?action.version:undefined,'one')}
 if(plan.slots.length>12)throw new CoachError(400,'Use até 12 ocorrências por proposta do eCoach.')
 if(!plan.allowed)throw new CoachError(409,'O horário tem conflito ou está fora da disponibilidade. Escolha outro horário.')
 return {...action,previewDigest:plan.digest}
}
export async function applyInternalAction(c:PoolClient,owner:string,action:ProposalAction,key:string):Promise<string>{
 if(action.kind==='create_workout')return createPlanInTransaction(c,owner,action.fields,key)
 if(action.kind==='edit_workout'){await editPlanInTransaction(c,owner,action.id,action.version,action.fields);return action.id}
 if(action.kind==='create_intake'||action.kind==='edit_intake'){const edited=action.kind==='edit_intake';const result=await saveFormInTransaction(c,owner,edited?action.id:null,action.definition,edited?action.revision:undefined,'intake',key);return result.id!}
 if(!action.previewDigest)throw new CoachError(409,'A proposta precisa de uma nova prévia. Solicite novamente.')
 const edited=action.kind==='edit_appointment'
 const command=agendaCommand.parse({action:'appointment_save',operationKey:key,...(edited?{id:action.id,version:action.version}:{}),fields:action.fields,scope:'one',previewDigest:action.previewDigest,reason:edited?action.reason:'Criado pelo personal após revisão da proposta do eCoach.',confirmed:true})
 const result=await executeAgenda(owner,command as Exclude<typeof command,{action:'preview'}>,c) as {id?:string;ids?:string[]}
 const id=result.id??result.ids?.[0];if(!id)throw new CoachError(500,'Não foi possível identificar o agendamento.');return id
}
export function internalError(error:unknown){
 if(error instanceof CalendarTimeError)return new CoachError(422,'Confira data, horário e fuso. Horários ambíguos exigem escolha explícita.')
 if(error instanceof IntakeError)return new CoachError(error.status,'Não foi possível salvar a anamnese. Confira a versão e o acesso ao modelo.')
 if(error instanceof AgendaError)return new CoachError(error.status,error.code==='preview_changed'?'A agenda mudou desde a proposta. Solicite outra e revise os horários.':error.code==='conflict'?'O horário não está mais disponível. Solicite outra proposta.':'Não foi possível agendar. Confira versão, horário, disponibilidade e vínculos.')
 return error
}
