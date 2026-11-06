import {z} from '@/lib/validation'
import {formSchema,submissionSchema} from '../intake/schema'
import {date,zone} from '../agenda/schema'
export const text=(max:number)=>z.string().trim().normalize('NFC').max(max).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))
const id=z.uuid(),version=z.int().positive(),key={operationKey:id}
export const assignmentFields=z.object({studentId:id,formVersionId:id,start:date,frequency:z.enum(['once','weekly','fortnightly','monthly']),count:z.int().min(1).max(24),timezone:zone,responseDays:z.int().min(1).max(14),lateDays:z.int().min(0).max(14),expectedWorkouts:z.int().min(1).max(100).nullable(),workoutId:id.nullable(),workoutVersion:version.nullable(),divisionId:id.nullable()}).strict().refine(v=>(v.workoutId===null)===(v.workoutVersion===null)&&(!v.divisionId||!!v.workoutId)&&(v.expectedWorkouts===null||!!v.workoutId))
export type AssignmentFields=z.infer<typeof assignmentFields>
export const feedbackSchema=z.object({performance:z.enum(['performed','partial','not_performed','not_reported']),performedCount:z.int().min(0).max(100).nullable(),difficulty:z.int().min(1).max(5).nullable(),effort:z.int().min(0).max(10).nullable(),discomfort:z.enum(['yes','no','not_reported']),discomfortNote:text(1000),notes:text(1500),adjustmentRequested:z.boolean()}).strict().refine(v=>v.performance!=='not_performed'||v.performedCount===null||v.performedCount===0).refine(v=>v.discomfort==='yes'||v.discomfortNote==='')
export type Feedback=z.infer<typeof feedbackSchema>
export const emptyFeedback=():Feedback=>({performance:'not_reported',performedCount:null,difficulty:null,effort:null,discomfort:'not_reported',discomfortNote:'',notes:'',adjustmentRequested:false})
export const checkinCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('form_save'),creationKey:id.optional(),id:id.optional(),revision:version.optional(),definition:formSchema}).strict(),
 z.object({action:z.literal('form_publish'),id,revision:version}).strict(),z.object({action:z.literal('form_archive'),id}).strict(),
 z.object({action:z.literal('assign_preview'),fields:assignmentFields}).strict(),
 z.object({action:z.literal('assign'),...key,fields:assignmentFields,digest:z.string().regex(/^[a-f0-9]{64}$/),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('assignment_state'),...key,id,version,state:z.enum(['paused','closed']),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('invite'),id,version,correction:z.boolean(),reason:text(1000)}).strict(),
 z.object({action:z.literal('revoke'),...key,id,version}).strict(),
 z.object({action:z.literal('cancel'),...key,id,version,reason:text(1000).min(5),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('review_start'),...key,id,version}).strict(),
 z.object({action:z.literal('review'),...key,id,version,submissionId:id,text:text(4000).min(2),sharedManually:z.boolean(),confirmed:z.literal(true)}).strict(),
])
export type CheckinCommand=z.infer<typeof checkinCommand>
export const checkinQuery=z.object({view:z.enum(['forms','form','version','assignments','occurrences','detail','submissions','history','indicators','series','workouts','summary']).default('occurrences'),id:id.optional(),studentId:id.optional(),q:text(120).optional(),model:text(120).optional(),page:z.coerce.number().int().min(1).max(100000).default(1),status:z.enum(['all','waiting','overdue','received','reviewing','reviewed','canceled']).default('all'),from:date.optional(),to:date.optional(),questionId:id.optional(),formVersionId:id.optional()}).strict().refine(v=>!v.from&&!v.to||!!v.from&&!!v.to&&v.from<=v.to&&(Date.parse(v.to)-Date.parse(v.from))/86400000<=366)
export type CheckinQuery=z.infer<typeof checkinQuery>
export const publicCommand=z.object({operation:z.enum(['open','submit']),token:z.string().max(100),attemptKey:id.optional(),submission:submissionSchema.omit({registration:true}).safeExtend({feedback:feedbackSchema}).optional()}).strict()
export const labels={waiting:'Aguardando resposta',overdue:'Resposta atrasada',received:'Recebido',reviewing:'Em revisão',reviewed:'Revisado',canceled:'Cancelado'}
