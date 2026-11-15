import {z} from '@/lib/validation'
import {messageBody} from './schema'
export const supportChannels={whatsapp:'WhatsApp',instagram:'Instagram Direct',email:'E-mail'} as const
const channel=z.enum(['whatsapp','instagram','email']),version=z.int().positive(),key={operationKey:z.uuid()}
const plain=z.string().trim().max(1000).refine(v=>!/[<>\u0000-\u0008]/.test(v),'Use texto simples.')
export const ruleFields=z.object({name:plain.min(3).max(80),channel:z.enum(['all','whatsapp','instagram','email']),keywords:z.array(plain.min(3).max(40)).min(1).max(8),instructions:plain.min(10),enabled:z.boolean()}).strict()
export const assistanceCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('settings'),...key,version:z.int().nonnegative(),consent:z.boolean()}).strict(),
 z.object({action:z.literal('thread_create'),...key,name:plain.min(2).max(120),contact:plain.max(160),channel,studentId:z.uuid().nullable(),body:messageBody,aiAllowed:z.boolean()}).strict(),
 z.object({action:z.literal('receive'),...key,id:z.uuid(),version,body:messageBody}).strict(),
 z.object({action:z.literal('thread_update'),...key,id:z.uuid(),version,state:z.enum(['open','closed']),aiAllowed:z.boolean()}).strict(),
 z.object({action:z.literal('rule_save'),...key,id:z.uuid().optional(),version:version.optional(),fields:ruleFields}).strict(),
 z.object({action:z.literal('draft'),...key,id:z.uuid(),version,body:messageBody}).strict(),
 z.object({action:z.literal('review'),...key,id:z.uuid(),version,body:messageBody,decision:z.enum(['approve','discard'])}).strict(),
 z.object({action:z.literal('suggest'),...key,id:z.uuid(),version,instructions:plain.default('')}).strict(),
 z.object({action:z.literal('retry'),...key,id:z.uuid()}).strict(),
 z.object({action:z.literal('delete'),...key,id:z.uuid(),version,confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('send'),...key,id:z.uuid(),version,confirmed:z.literal(true)}).strict(),
])
export const assistanceQuery=z.object({view:z.enum(['threads','thread','rules','settings']),id:z.uuid().optional(),studentId:z.uuid().optional(),page:z.coerce.number().int().min(1).max(10000).default(1),q:z.string().trim().max(120).default(''),channel:z.enum(['all','whatsapp','instagram','email']).default('all'),state:z.enum(['all','open','closed']).default('open')}).strict()
export type AssistanceCommand=z.infer<typeof assistanceCommand>
export type AssistanceQuery=z.infer<typeof assistanceQuery>
export type RuleFields=z.infer<typeof ruleFields>
export type SupportThread={id:string;name:string;channel:keyof typeof supportChannels;contact?:string;studentId?:string|null;version:number;state:'open'|'closed';aiAllowed:boolean;updatedAt:string}
export type SupportMessage={id:string;body:string;direction:'inbound'|'outbound';state:'received'|'draft'|'approved'|'discarded';source:'manual'|'ai';version:number;createdAt:string}
export type SupportJob={id:string;threadId:string;name?:string;state:'queued'|'running'|'done'|'failed'|'canceled';attempts:number;failure:string|null;createdAt:string}
export type SupportRule=RuleFields&{id:string;version:number}
export type SupportSettings={version:number;consent:boolean;aiReady:boolean;provider:string|null;model:string|null;connections:{channel:keyof typeof supportChannels;state:'not_connected';canSend:false;canReceive:false}[]}
