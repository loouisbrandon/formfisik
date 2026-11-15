import {z} from '@/lib/validation'
import {workoutFields} from '../workouts/schema'
import {formSchema} from '../intake/schema'
import {appointmentFields} from '../agenda/schema'
export const isCreateAction=(action:{kind:string})=>action.kind.startsWith('create_')
export const proposalAction=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('create_workout'),fields:workoutFields}).strict(),
 z.object({kind:z.literal('edit_workout'),id:z.uuid(),version:z.int().positive(),fields:workoutFields}).strict(),
 z.object({kind:z.literal('create_intake'),definition:formSchema}).strict(),
 z.object({kind:z.literal('edit_intake'),id:z.uuid(),revision:z.int().positive(),definition:formSchema}).strict(),
 z.object({kind:z.literal('create_appointment'),fields:appointmentFields,previewDigest:z.string().regex(/^[a-f0-9]{64}$/).optional()}).strict(),
 z.object({kind:z.literal('edit_appointment'),id:z.uuid(),version:z.int().positive(),reason:z.string().trim().min(5).max(1000),fields:appointmentFields,previewDigest:z.string().regex(/^[a-f0-9]{64}$/).optional()}).strict(),
])
export const isWorkoutAction=(action:ProposalAction):action is Extract<ProposalAction,{kind:'create_workout'|'edit_workout'}>=>action.kind==='create_workout'||action.kind==='edit_workout'
export type ProposalAction=z.infer<typeof proposalAction>
export const aiDecision=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('answer'),text:z.string().trim().min(1).max(4000)}).strict(),
 z.object({kind:z.literal('query'),name:z.enum(['finance_summary','finance_charges','students','exercises','workouts','workout','intake_forms','intake_form','agenda','agenda_settings','agenda_types','appointment']),args:z.record(z.string(),z.unknown())}).strict(),
 z.object({kind:z.literal('proposal'),text:z.string().trim().min(1).max(2000),action:proposalAction}).strict(),
])
export type AiDecision=z.infer<typeof aiDecision>
export type SourceReference={label:string;href:string}
export type AiResult={answer:string;action?:ProposalAction;sources:SourceReference[];mode:'ai'|'demo'|'policy'}
export type AiRuntime={enabled:boolean;ready:boolean;provider:string|null;model:string|null}

export function proposalResultHref(action:ProposalAction,id:string){if(isWorkoutAction(action))return '/treinos/'+id;if(action.kind==='create_intake'||action.kind==='edit_intake')return '/anamneses?form='+id;return '/agenda?occurrence='+id+'&date='+action.fields.date}
