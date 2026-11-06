import 'server-only'
import type {PoolClient} from 'pg'
import type {FinanceQuery} from '@/modules/finance/schema'
import {financeFacts,financeColumns} from './queries'
import {FinanceError} from './core'
/** Read-only projections over the existing ledger; external declarations never become processor facts. */
export async function financeReport(owner:string,q:FinanceQuery,store:Pick<PoolClient,'query'>){
 const args=[owner,q.from,q.to,q.origin,q.q,q.service,q.status,q.method]
 const match=`($4='all' OR ($4='external' AND mode IN('external','installments')) OR ($4='provider' AND mode IN('one_off','recurring'))) AND full_name ILIKE '%'||$5||'%' AND service_name ILIKE '%'||$6||'%' AND ($7='all' OR effective_state=$7)`
 const cte=financeFacts+`, scoped AS(SELECT * FROM facts WHERE ${match}), movements AS(
 SELECT r.id,r.charge_id,f.full_name,f.service_name,r.amount_cents::bigint AS amount,r.paid_on,r.method,'external'::text AS origin,r.checked,0::bigint AS refunded FROM finance_external_receipts r JOIN scoped f ON f.professional_id=r.professional_id AND f.id=r.charge_id WHERE r.professional_id=$1 AND r.voided_at IS NULL
 UNION ALL SELECT id,id,full_name,service_name,paid_cents::bigint,paid_on,'provider','provider',true,refunded_cents::bigint FROM scoped WHERE mode IN('one_off','recurring') AND paid_cents>0
 ), selected_movements AS(SELECT * FROM movements WHERE paid_on BETWEEN $2::date AND $3::date AND ($8='all' OR method=$8))`
 const receiptCols="id,charge_id,full_name,service_name,amount::text,to_char(paid_on,'YYYY-MM-DD') AS paid_on,method,origin,checked,refunded::text"
 if(q.view==='receipts'||q.view==='export'&&q.dataset==='receipts'){
  const count=await store.query(cte+' SELECT count(*)::int AS total FROM selected_movements',args),total=count.rows[0].total
  if(q.view==='export'&&total>1000)throw new FinanceError(422,'export_limit')
  const r=await store.query(cte+' SELECT '+receiptCols+' FROM selected_movements ORDER BY paid_on DESC,id LIMIT $9 OFFSET $10',[...args,q.view==='export'?1000:20,q.view==='export'?0:(q.page-1)*20]);return {items:r.rows,total,page:q.page,scope:'Recebimentos por data. Externos declarados pelo profissional; processador com reembolsos atuais separados.'}
 }
 if(q.view==='export'){
  const where=' FROM scoped WHERE due_on BETWEEN $2::date AND $3::date AND ($8=\'all\' OR ($8=\'provider\' AND mode IN(\'one_off\',\'recurring\')) OR EXISTS(SELECT 1 FROM finance_external_receipts r WHERE r.professional_id=$1 AND r.charge_id=scoped.id AND r.voided_at IS NULL AND r.method=$8))'
  const count=await store.query(cte+' SELECT count(*)::int AS total'+where,args);if(count.rows[0].total>1000)throw new FinanceError(422,'export_limit')
  const r=await store.query(cte+' SELECT '+financeColumns+where+' ORDER BY due_on,id LIMIT 1000',args);return {items:r.rows,total:count.rows[0].total,page:1,scope:'Cobranças por vencimento. Registro gerencial, não extrato bancário ou demonstrativo contábil.'}
 }
 const aggregate=await store.query(cte+` SELECT COALESCE(sum(amount) FILTER(WHERE origin='provider'),0)::text AS provider_received,COALESCE(sum(amount) FILTER(WHERE origin='external'),0)::text AS external_received,COALESCE(sum(amount) FILTER(WHERE origin='external' AND checked),0)::text AS external_checked,COALESCE(sum(refunded),0)::text AS refunded,count(*) FILTER(WHERE origin='external' AND NOT checked)::int AS unchecked FROM selected_movements`,args)
 const balances=await store.query(cte+` SELECT COALESCE(sum(GREATEST(0,amount_cents-paid_cents-manual)) FILTER(WHERE effective_state NOT IN('canceled','refunded') AND due_on BETWEEN $2::date AND $3::date),0)::text AS pending,COALESCE(sum(GREATEST(0,amount_cents-paid_cents-manual)) FILTER(WHERE effective_state='overdue' AND due_on BETWEEN $2::date AND $3::date),0)::text AS overdue,count(*) FILTER(WHERE effective_state='overdue' AND due_on BETWEEN $2::date AND $3::date)::int AS overdue_count,COALESCE(sum(net_cents) FILTER(WHERE paid_on BETWEEN $2::date AND $3::date),0)::text AS net_known,COALESCE(sum(fee_cents) FILTER(WHERE paid_on BETWEEN $2::date AND $3::date),0)::text AS fees_known,count(*) FILTER(WHERE paid_cents>0 AND paid_on BETWEEN $2::date AND $3::date AND (fee_cents IS NULL OR net_cents IS NULL))::int AS unknown_fees,count(*) FILTER(WHERE state='failed')::int AS failed_count,count(*) FILTER(WHERE discrepancy IS NOT NULL OR disputed_cents>0)::int AS review_count FROM scoped WHERE $8::text IS NOT NULL`,args)
 const flow=await store.query(cte+`, days AS(SELECT generate_series($2::date,$3::date,'1 day')::date AS day), received AS(SELECT paid_on,sum(amount-refunded) AS amount FROM selected_movements GROUP BY paid_on),expected AS(SELECT due_on,sum(amount_cents) AS amount FROM scoped WHERE state<>'canceled' GROUP BY due_on) SELECT to_char(day,'YYYY-MM-DD') AS date,COALESCE(r.amount,0)::text AS received,COALESCE(e.amount,0)::text AS expected FROM days LEFT JOIN received r ON r.paid_on=day LEFT JOIN expected e ON e.due_on=day ORDER BY day`,args)
 const recent=await store.query(cte+' SELECT '+financeColumns+" FROM scoped WHERE due_on BETWEEN $2::date AND $3::date AND $8::text IS NOT NULL ORDER BY due_on DESC,id LIMIT 5",args)
 return {...aggregate.rows[0],...balances.rows[0],flow:flow.rows,recent:recent.rows,currency:'brl'}
}
