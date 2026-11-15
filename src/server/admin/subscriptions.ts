import 'server-only'
import {z} from 'zod'
import {db} from '../db'
import type {Identity} from '../sessions'
import {isAdministrator} from './dashboard'
import {adminSubscriptionsQuery} from '@/modules/admin/subscriptions-schema'
export type AdminSubscriptionSummary={accountId:string;fullName:string;planId:'standard'|'premium'|'pro';interval:'month'|'year';amount:number;status:string;cancelScheduled:boolean;createdAt:string}
export type AdminSubscriptionDetail=AdminSubscriptionSummary&{userId:string;email:string;disabled:boolean;syncState:string;verifiedAt:string;trialEnd:string|null;periodStart:string|null;periodEnd:string|null;cancelAt:string|null;canceledAt:string|null}
export type AdminInvoice={status:string;amountDue:number;amountPaid:number;createdAt:string}
export async function adminSubscriptions(user:Identity,input:z.input<typeof adminSubscriptionsQuery>){
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const q=adminSubscriptionsQuery.parse(input),term=q.q.replace(/[\\%_]/g,'\\$&')
 const order={newest:'created_at DESC,account_id',oldest:'created_at,account_id',name_asc:'lower(full_name),account_id'}[q.sort]
 const {rows}=await db().query(`WITH base AS (SELECT a.id AS account_id,u.full_name,s.plan_id,s.billing_interval,s.amount,s.provider_status,s.cancel_at_period_end,s.cancel_at,a.created_at FROM billing_accounts a JOIN users u ON u.id=a.user_id JOIN billing_subscriptions s ON s.account_id=a.id),filtered AS (SELECT * FROM base WHERE ($1='' OR full_name ILIKE '%'||$1||'%') AND ($2='all' OR plan_id=$2) AND ($3='all' OR billing_interval=$3) AND ($4='all' OR provider_status=$4)) SELECT (SELECT count(*)::int FROM filtered) AS total,
 (SELECT json_build_object('total',count(*),'trial',count(*) FILTER(WHERE provider_status='trialing'),'overdue',count(*) FILTER(WHERE provider_status IN ('past_due','unpaid'))) FROM base) AS summary,
 coalesce((SELECT json_agg(item) FROM (SELECT account_id AS "accountId",full_name AS "fullName",plan_id AS "planId",billing_interval AS interval,amount,provider_status AS status,(cancel_at_period_end OR cancel_at IS NOT NULL) AS "cancelScheduled",created_at AS "createdAt" FROM filtered ORDER BY ${order} LIMIT 20 OFFSET $5) item),'[]') AS items`,[term,q.plan,q.interval,q.status,(q.page-1)*20])
 const row=rows[0];return {items:row.items as AdminSubscriptionSummary[],total:Number(row.total),page:q.page,pages:Math.max(1,Math.ceil(Number(row.total)/20)),summary:row.summary as {total:number;trial:number;overdue:number}}
}
export async function adminSubscriptionDetail(user:Identity,id:string,invoicePage=1){
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const parsed=z.uuid().safeParse(id);if(!parsed.success)return null
 const page=z.number().int().min(1).max(10000).parse(invoicePage)
 const {rows}=await db().query(`SELECT json_build_object('accountId',a.id,'userId',u.id,'fullName',u.full_name,'email',u.email,'disabled',u.disabled_at IS NOT NULL,'planId',s.plan_id,'interval',s.billing_interval,'amount',s.amount,'status',s.provider_status,'cancelScheduled',s.cancel_at_period_end OR s.cancel_at IS NOT NULL,'createdAt',a.created_at,'syncState',a.sync_state,'verifiedAt',s.verified_at,'trialEnd',s.trial_end,'periodStart',s.period_start,'periodEnd',s.period_end,'cancelAt',s.cancel_at,'canceledAt',s.canceled_at) AS subscription,
 (SELECT count(*)::int FROM billing_invoices i WHERE i.account_id=a.id) AS invoice_total,
 coalesce((SELECT json_agg(item) FROM (SELECT status,amount_due AS "amountDue",amount_paid AS "amountPaid",created_at AS "createdAt" FROM billing_invoices i WHERE i.account_id=a.id ORDER BY created_at DESC,stripe_invoice_id LIMIT 10 OFFSET $2) item),'[]') AS invoices
 FROM billing_accounts a JOIN users u ON u.id=a.user_id JOIN billing_subscriptions s ON s.account_id=a.id WHERE a.id=$1`,[parsed.data,(page-1)*10])
 const row=rows[0];if(!row)return null
 return {subscription:row.subscription as AdminSubscriptionDetail,invoices:row.invoices as AdminInvoice[],invoiceTotal:Number(row.invoice_total),invoicePage:page,invoicePages:Math.max(1,Math.ceil(Number(row.invoice_total)/10))}
}
