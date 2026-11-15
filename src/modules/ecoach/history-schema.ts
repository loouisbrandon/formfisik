import {z} from '@/lib/validation'
export const contextSchema=z.object({module:z.string().trim().min(1).max(60),period:z.object({from:z.iso.date(),to:z.iso.date()}).strict().optional(),filters:z.array(z.object({label:z.string().max(40),value:z.string().max(60)}).strict()).max(4).optional(),record:z.object({kind:z.enum(['student','charge']),id:z.uuid()}).strict().optional()}).strict()
export type CoachContext=z.infer<typeof contextSchema>
export const historyCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('turn'),id:z.uuid(),version:z.number().int().nonnegative(),operationId:z.uuid(),text:z.string().trim().min(1).max(2000),context:contextSchema.nullable()}).strict(),
 z.object({action:z.literal('rename'),id:z.uuid(),version:z.number().int().positive(),title:z.string().trim().min(1).max(100)}).strict(),
 z.object({action:z.literal('delete'),id:z.uuid(),version:z.number().int().positive()}).strict(),
])
export type HistoryCommand=z.infer<typeof historyCommand>
export type ConversationSummary={id:string;title:string;version:number;updatedAt:string}
export type StoredTurn={text:string;answer:string;context:CoachContext|null;mode?:'demo'|'ai'|'policy';proposalId?:string|null;sources?:{label:string;href:string}[]}
export type ConversationDetail=ConversationSummary&{turns:StoredTurn[]}
