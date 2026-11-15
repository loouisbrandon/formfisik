import {z} from '@/lib/validation'
import {text} from '../consultancies/schema'
import {validZone,type Recurrence} from './time'
export const date=z.iso.date().refine(v=>v>='2000-01-01'&&v<'2101-01-01')
export const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
export const zone=z.string().min(1).max(80).refine(validZone,'Informe um fuso IANA válido.')
export const fold=z.enum(['reject','earlier','later']).default('reject')
export const windowSchema=z.object({start:z.int().min(0).max(1439),end:z.int().min(1).max(1440)}).strict().refine(v=>v.start<v.end)
export const windows=z.array(windowSchema).max(8).refine(v=>{const sorted=[...v].sort((a,b)=>a.start-b.start);return sorted.every((w,i)=>i===0||w.start>=sorted[i-1].end)},'Faixas não podem se sobrepor.')
export const availabilityFields=z.object({timezone:zone,weekly:z.array(z.object({day:z.int().min(0).max(6),windows}).strict()).length(7).refine(v=>new Set(v.map(d=>d.day)).size===7)}).strict()
export const sessionFields=z.object({name:text(100).min(2),description:text(1000),duration:z.int().min(5).max(720),mode:z.enum(['onsite','online','external']),location:text(200),before:z.int().min(0).max(240),after:z.int().min(0).max(240),archived:z.boolean()}).strict()
export const recurrence=z.object({frequency:z.enum(['once','weekly','fortnightly','monthly']),end:z.discriminatedUnion('mode',[z.object({mode:z.literal('count'),count:z.int().min(1).max(100)}).strict(),z.object({mode:z.literal('date'),date}).strict()])}).strict()
export const appointmentFields=z.object({kind:z.enum(['session','personal','block']),studentId:z.uuid().nullable(),typeId:z.uuid().nullable(),title:text(120),date,time,timezone:zone,fold,duration:z.int().min(5).max(720),endDate:date.nullable(),endTime:time.nullable(),mode:z.enum(['onsite','online','external']),location:text(200),notes:text(1500),contractId:z.uuid().nullable(),deliveryId:z.uuid().nullable(),recurrence}).strict().superRefine((v,c)=>{if(v.kind==='session'&&(!v.studentId||!v.typeId))c.addIssue({code:'custom',message:'Selecione aluno e tipo de sessão.'});if(v.kind!=='session'&&(v.studentId||v.typeId||v.contractId||v.deliveryId))c.addIssue({code:'custom',message:'Compromisso pessoal/bloqueio não possui aluno/contrato.'});if(v.deliveryId&&!v.contractId)c.addIssue({code:'custom',message:'Selecione a contratação.'});if(v.kind==='block'&&(!v.endDate||!v.endTime||v.recurrence.frequency!=='once'))c.addIssue({code:'custom',message:'Bloqueio exige término e não usa recorrência.'});if(v.kind!=='session'&&v.title.length<2)c.addIssue({code:'custom',message:'Informe o título privado.'})})
const id=z.uuid(),version=z.int().positive(),key={operationKey:id},edit={id:id.optional(),version:version.optional()},scope=z.enum(['one','future']),reason=text(1000).min(5)
export const agendaCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('availability_save'),...key,version,fields:availabilityFields,confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('exception_save'),...key,...edit,date,windows,reason:text(300),remove:z.boolean()}).strict(),
 z.object({action:z.literal('type_save'),...key,...edit,fields:sessionFields}).strict(),
 z.object({action:z.literal('preview'),fields:appointmentFields,id:id.optional(),version:version.optional(),scope}).strict(),
 z.object({action:z.literal('appointment_save'),...key,...edit,fields:appointmentFields,scope,previewDigest:z.string().regex(/^[a-f0-9]{64}$/),reason:text(1000),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('cancel'),...key,id,version,scope,reason,confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('attendance'),...key,id,version,state:z.enum(['scheduled','completed','absent']),effectiveAt:z.iso.datetime({offset:true}),reason:text(1000),fulfill:z.boolean(),releaseFulfillment:z.boolean().default(false),deliveryVersion:version.optional(),confirmed:z.literal(true)}).strict(),
])
export const agendaQuery=z.object({view:z.enum(['settings','types','exception','exceptions','calendar','list','detail','history','indicators','contracts','deliveries']).default('calendar'),date:date.optional(),from:date.optional(),to:date.optional(),id:id.optional(),studentId:id.optional(),contractId:id.optional(),page:z.coerce.number().int().min(1).max(100000).default(1),status:z.enum(['all','scheduled','completed','absent','canceled','pending']).default('all'),q:text(100).default(''),archive:z.enum(['active','archived','all']).default('active')}).strict().refine(v=>{const from=v.from??v.date;if(!v.to)return true;return !!from&&from<=v.to&&(Date.parse(v.to)-Date.parse(from))/86400000<=(v.view==='calendar'?42:366)})
export type AvailabilityFields=z.infer<typeof availabilityFields>
export type SessionFields=z.infer<typeof sessionFields>
export type AppointmentFields=z.infer<typeof appointmentFields>
export type AgendaCommand=z.infer<typeof agendaCommand>
export type AgendaQuery=z.infer<typeof agendaQuery>
export type {Recurrence}
export const states={scheduled:'Agendado',completed:'Realizado',absent:'Não compareceu',canceled:'Cancelado',pending:'Presença pendente de confirmação',in_progress:'Em andamento'} as const
export const modes={onsite:'Presencial',online:'Online',external:'Externo/domiciliar'} as const
export const kinds={session:'Atendimento',personal:'Compromisso pessoal',block:'Bloqueio/indisponibilidade'} as const
export const defaultAvailability=():AvailabilityFields=>({timezone:'America/Sao_Paulo',weekly:Array.from({length:7},(_,day)=>({day,windows:[]}))})
export const emptyAppointment=(timezone='America/Sao_Paulo'):AppointmentFields=>({kind:'session',studentId:null,typeId:null,title:'',date:'',time:'09:00',timezone,fold:'reject',duration:60,endDate:null,endTime:null,mode:'onsite',location:'',notes:'',contractId:null,deliveryId:null,recurrence:{frequency:'once',end:{mode:'count',count:1}}})
