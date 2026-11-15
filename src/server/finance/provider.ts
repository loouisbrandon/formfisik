import 'server-only'
import {z} from '@/lib/validation'
export class FinanceError extends Error{constructor(public status:number,public code:string){super('FINANCE_OPERATION_REJECTED')}}
const cents=z.int().min(0).max(1000000000),date=z.iso.date(),ref=z.string().min(1).max(200)
export const accountSnapshot=z.object({account:ref,country:z.literal('BR'),domain:z.literal('professional'),chargesEnabled:z.boolean(),payoutsEnabled:z.boolean(),restricted:z.boolean(),requirements:z.array(z.string().max(120)).max(40),capabilities:z.record(z.string().max(80),z.enum(['active','pending','inactive']))}).strict()
export const financialSnapshot=z.object({account:ref,domain:z.literal('professional'),livemode:z.literal(false),charges:z.array(z.object({id:z.uuid(),providerRef:ref,subscription:ref.nullable(),amount:cents,currency:z.literal('brl'),state:z.enum(['open','paid','failed','canceled','refunded','disputed']),paid:cents,refunded:cents,disputed:cents,fee:cents.nullable(),net:z.int().min(-1000000000).max(1000000000).nullable(),availableOn:date.nullable(),paidOn:date.nullable()}).strict()).max(120),payouts:z.array(z.object({id:ref,amount:cents,currency:z.literal('brl'),state:z.enum(['pending','in_transit','paid','failed','canceled']),arrivalOn:date}).strict()).max(100),subscription:z.object({id:ref,state:z.enum(['pending','active','canceled','ended'])}).strict().optional()}).strict()
export type AccountSnapshot=z.infer<typeof accountSnapshot>
export type FinancialSnapshot=z.infer<typeof financialSnapshot>
export type ChargeSpec={id:string;cycle:number;amount:number;due:string}
export type CheckoutSpec={account:string;agreementId:string;mode:'one_off'|'recurring';currency:'brl';charges:ChargeSpec[];intervalMonths:number;endsOn:string}
/** Server-only normalized contract. No client-supplied processor IDs or raw card/KYC data. */
export interface FinanceGateway{
 ensureAccount(owner:string,key:string):Promise<AccountSnapshot>
 account(account:string):Promise<AccountSnapshot>
 onboarding(account:string,key:string):Promise<{url:string}>
 checkout(spec:CheckoutSpec,key:string):Promise<{reference:string;subscription:string|null;url:string}>
 link(account:string,reference:string):Promise<string>
 cancel(account:string,subscription:string|null,references:string[],key:string):Promise<void>
 refund(account:string,reference:string,amount:number,key:string):Promise<void>
 snapshot(account:string,reference:string):Promise<FinancialSnapshot>
}
/** External activation deliberately has no environment bypass: model/risk/BR validation is pending. */
export function runtimeGateway():FinanceGateway{throw new FinanceError(503,'external_blocked')}
export function providerUrl(value:string,type:'onboarding'|'checkout'){
 const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hostname!==(type==='onboarding'?'connect.stripe.com':'checkout.stripe.com'))throw new FinanceError(503,'provider_response');return value
}
