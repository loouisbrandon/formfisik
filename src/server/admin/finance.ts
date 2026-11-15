import 'server-only'
import {db} from '../db'
import type {Identity} from '../sessions'
import {isAdministrator} from './dashboard'
import {adminSubscriptionsQuery} from '@/modules/admin/subscriptions-schema'
import type {z} from 'zod'
export type FinanceMonth={month:string;paidCents:string|null;estimateCents:string|null}
export type FinanceMovement={name:string;status:string;amountDue:number;amountPaid:number;createdAt:string}
export type FinanceCharge={name:string;date:string;amount:number;trial:boolean}
export async function adminFinance(user:Identity,input:z.input<typeof adminSubscriptionsQuery>){
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const q=adminSubscriptionsQuery.parse(input)
 // Persisted SaaS facts only. Forecast is one next charge per eligible subscription, never entitlement.
 const {rows}=await db().query(`WITH bounds AS (
 SELECT now() AS today,date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo') AS month
 ),invoices AS (
 SELECT i.account_id,i.stripe_invoice_id,u.full_name,i.status,i.amount_due,i.amount_paid,i.created_at,greatest(i.amount_due::bigint-i.amount_paid,0) AS outstanding,s.provider_status
 FROM billing_invoices i JOIN billing_accounts a ON a.id=i.account_id JOIN users u ON u.id=a.user_id LEFT JOIN billing_subscriptions s ON s.account_id=a.id WHERE i.currency='brl'
 ),candidates AS (
 SELECT a.id,u.full_name,CASE WHEN s.provider_status='trialing' THEN s.trial_end ELSE s.period_end END AS charge_at,coalesce(s.upcoming_amount,s.amount) AS amount,s.provider_status='trialing' AS trial
 FROM billing_subscriptions s JOIN billing_accounts a ON a.id=s.account_id JOIN users u ON u.id=a.user_id
 WHERE s.provider_status IN ('active','trialing') AND NOT s.collection_paused AND NOT s.cancel_at_period_end AND s.cancel_at IS NULL AND s.canceled_at IS NULL AND s.ended_at IS NULL AND a.sync_state='ok'
 AND NOT EXISTS(SELECT 1 FROM invoices i WHERE i.account_id=a.id AND i.status='open' AND i.outstanding>0)
 ),forecast AS (
 SELECT c.* FROM candidates c,bounds b WHERE c.charge_at>b.today AND c.charge_at<=b.today+interval '30 days' AND c.amount>=0
 ),months AS (
 SELECT m FROM bounds b,generate_series(b.month-($1::int-3)*interval '1 month',b.month+interval '2 months',interval '1 month') m
 ) SELECT
 (SELECT coalesce(sum(amount_paid),0)::text FROM invoices WHERE status='paid') AS paid,
 (SELECT coalesce(sum(outstanding),0)::text FROM invoices WHERE status='open') AS receivable,
 (SELECT coalesce(sum(outstanding),0)::text FROM invoices WHERE status='open' AND provider_status IN ('past_due','unpaid')) AS overdue,
 (SELECT coalesce(sum(amount),0)::text FROM forecast) AS estimated,
 (SELECT count(*)::int FROM forecast) AS charge_total,
 (SELECT count(*)::int FROM invoices) AS movement_total,
 (SELECT json_agg(series ORDER BY series.month) FROM (SELECT to_char(m,'YYYY-MM') AS month,
 CASE WHEN m<=b.month THEN (SELECT coalesce(sum(i.amount_paid),0)::text FROM invoices i WHERE i.status='paid' AND i.created_at>=m AT TIME ZONE 'America/Sao_Paulo' AND i.created_at<(m+interval '1 month') AT TIME ZONE 'America/Sao_Paulo') ELSE NULL END AS "paidCents",
 CASE WHEN m>=b.month THEN (SELECT coalesce(sum(f.amount),0)::text FROM forecast f WHERE f.charge_at>=m AT TIME ZONE 'America/Sao_Paulo' AND f.charge_at<(m+interval '1 month') AT TIME ZONE 'America/Sao_Paulo') ELSE NULL END AS "estimateCents"
 FROM months,bounds b) series) AS months,
 coalesce((SELECT json_agg(item) FROM (SELECT full_name AS name,charge_at AS date,amount,trial FROM forecast ORDER BY charge_at,id LIMIT 5 OFFSET $2) item),'[]') AS charges,
 coalesce((SELECT json_agg(item) FROM (SELECT full_name AS name,status,amount_due AS "amountDue",amount_paid AS "amountPaid",created_at AS "createdAt" FROM invoices ORDER BY created_at DESC,stripe_invoice_id LIMIT 10 OFFSET $3) item),'[]') AS movements`,[Number(q.months),(q.cobrancas-1)*5,(q.movimentos-1)*10])
 const r=rows[0]
 return {paidCents:String(r.paid),receivableCents:String(r.receivable),overdueCents:String(r.overdue),estimateCents:String(r.estimated),months:r.months as FinanceMonth[],charges:r.charges as FinanceCharge[],movements:r.movements as FinanceMovement[],chargeTotal:Number(r.charge_total),movementTotal:Number(r.movement_total)}
}
export type AdminFinance=Awaited<ReturnType<typeof adminFinance>>
