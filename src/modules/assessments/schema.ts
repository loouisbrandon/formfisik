import {z} from 'zod'
export const measures = {neck:'Pescoço',shoulders:'Ombros',chest:'Tórax',waist:'Cintura',abdomen:'Abdômen',hips:'Quadril',rightArm:'Braço direito',leftArm:'Braço esquerdo',rightForearm:'Antebraço direito',leftForearm:'Antebraço esquerdo',rightThigh:'Coxa direita',leftThigh:'Coxa esquerda',rightCalf:'Panturrilha direita',leftCalf:'Panturrilha esquerda'} as const
export type Metric='weight'|keyof typeof measures
export const metrics=['weight',...Object.keys(measures)] as [Metric,...Metric[]]
export const metricLabel=(key:Metric)=>key==='weight'?'Peso corporal':measures[key]
export const unit=(key:Metric)=>key==='weight'?'kg':'cm'
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export const dateSchema=z.string().refine(v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v&&v>='1900-01-01'&&v<=today(),'Informe uma data válida entre 1900 e hoje (Brasília).')
// Strings are normalized without binary floating point; PostgreSQL NUMERIC stores exact hundredths.
const decimal=(max:number)=>z.string().trim().transform(v=>v.replace(',','.')).refine(v=>/^\d{1,3}(\.\d{1,2})?$/.test(v)&&Number(v)>0&&Number(v)<=max,`Informe um valor maior que zero até ${max}, com até duas casas decimais.`).transform(v=>{const [a,b='']=v.split('.');return String(Number(a))+'.'+b.padEnd(2,'0')}).nullable()
const shape=Object.fromEntries(Object.keys(measures).map(k=>[k,decimal(400)])) as Record<keyof typeof measures,ReturnType<typeof decimal>>
export const assessmentFields=z.object({date:dateSchema,weight:decimal(500),...shape,notes:z.string().trim().normalize('NFC').max(3000).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),'Remova caracteres de controle.')}).strict()
export type AssessmentFields=z.infer<typeof assessmentFields>
export const createAssessment=assessmentFields.extend({studentId:z.uuid(),creationKey:z.uuid()}).strict()
export const editAssessment=assessmentFields.extend({version:z.int().positive()}).strict()
export const statusAssessment=z.object({version:z.int().positive(),state:z.enum(['active','archived'])}).strict()
export const periodSchema=z.enum(['30','90','6m','12m','all'])
export const periodIntervals={'30':'29 days','90':'89 days','6m':'6 months','12m':'12 months',all:'1000 years'} as const
export const assessmentQuery=z.object({studentId:z.uuid(),view:z.enum(['list','series','compare']).default('list'),state:z.enum(['active','archived','all']).default('active'),page:z.coerce.number().int().min(1).max(100000).default(1),metric:z.enum(metrics).default('weight'),period:periodSchema.default('all'),mode:z.enum(['first','previous','manual']).default('first'),from:z.uuid().optional(),to:z.uuid().optional()}).strict()
export type AssessmentQuery=z.infer<typeof assessmentQuery>
export type Assessment=AssessmentFields&{id:string;studentId:string;state:'active'|'archived';version:number;createdAt:string;updatedAt:string;authorId:string;authorName:string}
export type AssessmentList={items:Assessment[];page:number;pages:number;total:number;latest:Assessment|null;first:Assessment|null;previous:Assessment|null}
export const blankAssessment=():AssessmentFields=>({date:today(),notes:'',...Object.fromEntries(metrics.map(k=>[k,null]))} as AssessmentFields)
export const formatDate=(value:string)=>value.slice(0,10).split('-').reverse().join('/')
export const formatInstant=(value:string)=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(new Date(value))+' (Brasília)'
export const display=(v:string|null)=>v===null?'Não informado':v.replace('.',',')
export function difference(a:string|null,b:string|null){if(a===null||b===null)return {absolute:null,percent:null};const cents=(s:string)=>BigInt(s.replace('.',''));const x=cents(a),delta=cents(b)-x;const fixed=(n:bigint)=>`${n<BigInt(0)?'-':''}${(n<BigInt(0)?-n:n)/BigInt(100)}.${((n<BigInt(0)?-n:n)%BigInt(100)).toString().padStart(2,'0')}`;const quotient=x===BigInt(0)?null:(delta*BigInt(10000)+(delta<BigInt(0)?-x/BigInt(2):x/BigInt(2)))/x;return {absolute:fixed(delta),percent:quotient===null?null:fixed(quotient)}}
export function comparison(a:Assessment,b:Assessment){return {from:a,to:b,days:Math.abs(Math.round((Date.parse(b.date)-Date.parse(a.date))/86400000)),values:metrics.map(metric=>({metric,before:a[metric],after:b[metric],...difference(a[metric],b[metric])}))}}
export type Comparison=ReturnType<typeof comparison>
export type Series={items:{id:string;date:string;value:string}[];page:number;pages:number;total:number;metric:Metric;period:AssessmentQuery['period'];asOf:string}
