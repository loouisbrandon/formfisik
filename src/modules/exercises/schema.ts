import {z} from '@/lib/validation'
import {categories,muscles,equipment,levels} from './taxonomy'
const text=(max:number)=>z.string().trim().normalize('NFC').max(max).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),'Remova caracteres de controle.')
const name=text(160).min(2,'Informe o nome do exercício.').refine(v=>!/[\r\n]/.test(v),'Use uma linha para o nome.').transform(v=>v.replace(/\s+/g,' '))
export const exerciseFields=z.object({name,category:z.enum(categories),primaryMuscles:z.array(z.enum(muscles)).min(1,'Selecione um grupo principal.').max(5),secondaryMuscles:z.array(z.enum(muscles)).max(17).default([]),equipment:z.enum(equipment).nullable().default(null),level:z.enum(levels).nullable().default(null),instructions:z.array(text(2000).min(1)).max(20).default([]),aliases:z.array(name).max(10).default([])}).strict()
export const exerciseCreate=exerciseFields.extend({creationKey:z.uuid()}).strict()
export const exerciseEdit=exerciseFields.extend({version:z.int().positive()}).strict()
export const exerciseStatus=z.object({state:z.enum(['active','archived']),version:z.int().positive()}).strict()
export const exerciseQuery=z.object({q:text(160).default(''),scope:z.enum(['all','official','mine']).default('all'),state:z.enum(['active','archived','all']).default('active'),category:z.enum(categories).optional(),muscle:z.enum(muscles).optional(),equipment:z.enum(equipment).optional(),sort:z.enum(['name_asc','name_desc','newest']).default('name_asc'),page:z.coerce.number().int().min(1).max(10000).default(1)}).strict()
export const selectionSchema=z.object({ids:z.array(z.uuid()).min(1).max(50).transform(ids=>[...new Set(ids)])}).strict()
export const requestCreate=exerciseFields.extend({creationKey:z.uuid(),privateExerciseId:z.uuid().optional(),resubmissionOf:z.uuid().optional(),publicationPermission:z.literal(true,{error:'Confirme que pode compartilhar o conteúdo para publicação.'})}).strict()
export const requestQuery=z.object({state:z.enum(['all','pending','approved','linked_existing','rejected']).default('all'),page:z.coerce.number().int().min(1).max(10000).default(1)}).strict()
export const reviewSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('approve'),version:z.int().positive(),fields:exerciseFields,reason:text(1000).min(10,'Descreva a decisão (mínimo 10 caracteres).'),confirmDistinct:z.boolean().default(false)}).strict(),
 z.object({action:z.literal('link'),version:z.int().positive(),exerciseId:z.uuid(),reason:text(1000).min(10)}).strict(),
 z.object({action:z.literal('reject'),version:z.int().positive(),reason:text(1000).min(10,'Informe a justificativa (mínimo 10 caracteres).')}).strict(),
])
export type ExerciseFields=z.infer<typeof exerciseFields>
export type ExerciseQuery=z.infer<typeof exerciseQuery>
export type Exercise=ExerciseFields&{id:string;scope:'official'|'private';state:'published'|'active'|'archived'|'review';version:number;qualityFlags:string[];source:{dataset:string|null;sourceId:string|null;revision:string|null;license:string|null};createdAt:string;updatedAt:string}
export type ExerciseSummary=Pick<Exercise,'id'|'name'|'scope'|'state'|'version'|'category'|'primaryMuscles'|'equipment'>
export type ExerciseList={items:ExerciseSummary[];total:number;page:number;pages:number;pageSize:number}
export type ExerciseRequest={id:string;proposal:ExerciseFields;state:'pending'|'approved'|'linked_existing'|'rejected';version:number;privateExerciseId:string|null;resubmissionOf:string|null;decisionReason:string|null;decidedAt:string|null;publishedExerciseId:string|null;createdAt:string;own:boolean;requesterName?:string}
export type ExerciseRequestSummary=Pick<ExerciseRequest,'id'|'state'|'version'|'decisionReason'|'createdAt'|'own'|'requesterName'>&{proposal:Pick<ExerciseFields,'name'>}

export function inputFields(input:ExerciseFields):ExerciseFields{return {name:input.name,category:input.category,primaryMuscles:input.primaryMuscles,secondaryMuscles:input.secondaryMuscles,equipment:input.equipment,level:input.level,instructions:input.instructions,aliases:input.aliases}}
