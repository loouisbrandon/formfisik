import {z} from '@/lib/validation'
import {text,money,centsFromText,endDate} from '../consultancies/schema'
export {money}
export const parseMoney=(s:string)=>{try{return centsFromText(s)}catch{return null}}
const key={operationKey:z.uuid()},id=z.uuid(),reason=text(500).min(5),confirmed=z.literal(true)
export const financeCommand=z.discriminatedUnion('action',[
 z.object({action:z.literal('onboard'),...key,confirmed}).strict(),
 z.object({action:z.literal('account_refresh'),...key}).strict(),
 z.object({action:z.literal('prepare'),...key,contractId:id,contractVersion:z.int().positive(),firstDueOn:z.iso.date().optional(),mode:z.enum(['one_off','recurring','external','installments']),cycles:z.int().min(1).max(120),intervalMonths:z.union([z.literal(1),z.literal(3),z.literal(6),z.literal(12)]),confirmed}).strict(),
 z.object({action:z.literal('checkout'),...key,id,confirmed}).strict(),
 z.object({action:z.literal('cancel'),...key,id,reason,confirmed}).strict(),
 z.object({action:z.literal('receipt'),...key,id,amountCents:z.int().min(1).max(1000000000),paidOn:z.iso.date(),method:z.enum(['pix','bank','cash','other']),reference:text(120),note:text(500),checked:z.boolean(),replacesId:id.optional(),reason:reason.optional(),confirmed}).strict(),
 z.object({action:z.literal('void_receipt'),...key,id,reason,confirmed}).strict(),
 z.object({action:z.literal('refund'),...key,id,amountCents:z.int().min(1).max(1000000000),reason,confirmed}).strict(),
 z.object({action:z.literal('reconcile'),...key,id}).strict(),
 z.object({action:z.literal('resume_operation'),...key,id}).strict(),
 z.object({action:z.literal('retry_event'),...key,eventId:text(200).min(1)}).strict(),
])
export type FinanceCommand=z.infer<typeof financeCommand>
export const financeQuery=z.object({view:z.enum(['dashboard','receipts','export','overview','account','charges','charge','history','agreements','contracts','payouts','events','operations']).default('overview'),id:id.optional(),page:z.coerce.number().int().min(1).max(100000).default(1),from:z.iso.date(),to:z.iso.date(),status:z.enum(['all','prepared','open','paid','failed','canceled','refunded','disputed','overdue','manual_recorded','manual_reconciled']).default('all'),q:text(100).default(''),service:text(100).default(''),origin:z.enum(['all','provider','external']).default('all'),method:z.enum(['all','pix','cash','bank','other','provider']).default('all'),dataset:z.enum(['charges','receipts']).default('charges')}).strict().refine(v=>v.from<=v.to&&(Date.parse(v.to)-Date.parse(v.from))/86400000<=366,'Selecione até 367 datas.')
export type FinanceQuery=z.infer<typeof financeQuery>
export function schedule(start:string,finish:string,total:number,cycles:number,months:number){
 if(!Number.isSafeInteger(total)||total<cycles||total>1000000000||cycles<1||cycles>120)throw Error('INVALID_SCHEDULE')
 return Array.from({length:cycles},(_,i)=>{const due=i===0?start:new Date(Date.parse(endDate(start,i*months,'months'))+86400000).toISOString().slice(0,10);if(due>finish)throw Error('INVALID_SCHEDULE');return {cycle:i+1,due,amount:Math.floor(total/cycles)+(i<total%cycles?1:0)}})
}
export const chargeStates={prepared:'Preparada',open:'Em aberto',paid:'Paga',failed:'Falhou',canceled:'Cancelada',refunded:'Com reembolso',disputed:'Em contestação',overdue:'Vencida',manual_recorded:'Recebimento externo registrado',manual_reconciled:'Recebimento externo conferido'} as const
export const paymentModes={one_off:'Pagamento único via provedor',recurring:'Recorrência finita via provedor',external:'Pagamento externo único',installments:'Parcelas externas (sem débito automático)'} as const
