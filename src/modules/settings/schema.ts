import {z} from '@/lib/validation'
export const trainingFocus=['Hipertrofia','Emagrecimento','Força','Condicionamento físico','Mobilidade e flexibilidade','Qualidade de vida','Preparação física','Treinamento funcional','Iniciação à atividade física','Envelhecimento ativo'] as const
export const states=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const
const text=(max:number)=>z.string().trim().max(max)
export function validCpf(value:string){const s=value.replace(/\D/g,'');if(!/^\d{11}$/.test(s)||/^(\d)\1+$/.test(s))return false;return [9,10].every(n=>{let sum=0;for(let i=0;i<n;i++)sum+=Number(s[i])*(n+1-i);return Number(s[n])===(sum*10%11)%10})}
export const profileInput=z.object({displayName:text(120),description:text(1000),cref:text(30).refine(v=>!v||/^\d{4,10}-[GP]\/[A-Z]{2}$/.test(v),'Use número-categoria/UF, como 000000-G/SP.').refine(v=>!v||states.includes(v.slice(-2) as typeof states[number])),focus:z.array(z.enum(trainingFocus)).max(10),modality:z.enum(['online','presencial','hibrido']),city:text(120),state:z.union([z.literal(''),z.enum(states)])}).strict()
export const accountInput=z.object({fullName:text(120).min(3),phone:text(24).refine(v=>!v||/^\+?[\d ()-]{10,24}$/.test(v)),postalCode:text(9).refine(v=>!v||/^\d{5}-?\d{3}$/.test(v)),street:text(160),number:text(20),complement:text(80),district:text(100),city:text(120),state:z.union([z.literal(''),z.enum(states)]),cpf:z.string().max(14).refine(v=>!v||validCpf(v),'CPF inválido. Verifique os dígitos.')}).strict()
export const preferenceInput=z.object({agenda:z.boolean(),checkins:z.boolean(),contracts:z.boolean()}).strict()
export type ProfileInput=z.infer<typeof profileInput>
export type AccountInput=z.infer<typeof accountInput>
export const emptyProfile:ProfileInput={displayName:'',description:'',cref:'',focus:[],modality:'online',city:'',state:''}
export const emptyAccount:AccountInput={fullName:'',phone:'',postalCode:'',street:'',number:'',complement:'',district:'',city:'',state:'',cpf:''}
