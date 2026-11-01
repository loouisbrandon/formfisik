import {z} from 'zod'
import {dateSchema,today,periodSchema} from '../assessments/schema'
const text=(max:number)=>z.string().trim().normalize('NFC').max(max).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),'Remova caracteres de controle.')
export const positions={front:'Frente',back:'Costas',right:'Perfil direito',left:'Perfil esquerdo',other:'Outra posição'} as const
export const positionSchema=z.enum(['front','back','right','left','other'])
export const recordFields=z.object({date:dateSchema,notes:text(1000).default('')}).strict()
export const authorizationSchema=z.object({source:text(500).min(5,'Informe a origem ou referência da autorização.'),obtainedOn:dateSchema,subject:z.enum(['adult','guardian']),guardian:text(200).default(''),attested:z.literal(true,{error:'Confirme a autorização específica para fotografias.'})}).strict().refine(v=>v.subject!=='guardian'||v.guardian.length>=5,{path:['guardian'],message:'Registre a referência do responsável e da autorização aplicável.'})
export const createRecordSchema=recordFields.extend({studentId:z.uuid(),creationKey:z.uuid(),authorization:authorizationSchema}).strict()
export const editRecordSchema=recordFields.extend({version:z.int().positive()}).strict()
export const recordStateSchema=z.object({version:z.int().positive(),state:z.enum(['active','archived'])}).strict()
export const uploadSchema=z.object({version:z.int().positive(),uploadKey:z.uuid(),position:positionSchema,description:text(120).default(''),data:z.string().min(4).max(6990508),replaceId:z.uuid().optional()}).strict().refine(v=>v.position!=='other'||v.description.length>=3,{path:['description'],message:'Descreva a outra posição corporal.'})
export const removalSchema=z.object({version:z.int().positive(),operationKey:z.uuid(),reason:z.enum(['student_request','authorization_revoked','correction']),imageId:z.uuid().optional()}).strict()
export const photoQuery=z.object({studentId:z.uuid(),page:z.coerce.number().int().min(1).max(100000).default(1),state:z.enum(['active','archived','all']).default('active'),from:dateSchema.optional(),to:dateSchema.optional(),position:positionSchema.optional()}).strict().refine(v=>!v.from||!v.to||v.from<=v.to,{message:'O início deve ser anterior ou igual ao fim.'})
export const calendarQuery=z.object({studentId:z.uuid(),period:periodSchema.default('all'),year:z.coerce.number().int().min(1900).max(2200),month:z.coerce.number().int().min(1).max(12).optional(),date:dateSchema.optional(),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict()
export type PhotoQuery=z.infer<typeof photoQuery>
export type RecordFields=z.infer<typeof recordFields>
export type PhotoAuthorization=z.infer<typeof authorizationSchema>
export type PhotoImage={id:string;position:keyof typeof positions;description:string;width:number;height:number;bytes:number;createdAt:string}
export type PhotoRecord=RecordFields&{id:string;studentId:string;state:'active'|'archived'|'deleting'|'deleted';version:number;authorId:string;authorName:string;createdAt:string;updatedAt:string;imageCount:number;pendingCount:number}
export type RecordDetail=PhotoRecord&{images:PhotoImage[];authorization:{source:string;obtainedOn:string;subject:'adult'|'guardian'|null;guardian:string;revoked:boolean};history:{items:{version:number;kind:string;actorName:string;occurredAt:string}[];page:number;pages:number;total:number}}
export type PhotoList={items:PhotoRecord[];total:number;page:number;pages:number;pageSize:number}
export type CalendarData={year:number;month?:number;items:{date:string;assessments:number;photos:number}[]}
export const currentMonth=()=>Number(today().slice(5,7))
export const currentYear=()=>Number(today().slice(0,4))
export function monthDays(year:number,month:number){const first=new Date(Date.UTC(year,month-1,1)).getUTCDay(),days=new Date(Date.UTC(year,month,0)).getUTCDate();return Array.from({length:Math.ceil((first+days)/7)*7},(_,i)=>{const day=i-first+1;return day>0&&day<=days?`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`:null})}
export const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
