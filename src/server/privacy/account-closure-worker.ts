import 'server-only'
import { db } from '../db'
import { locked,transaction } from '../subscriptions/store'
import { subscriptionStatus } from '../subscriptions/status'
import type { BillingGateway } from '../subscriptions/stripe'
import { requestErasure,processErasure } from './erasure'
import type { PrivatePhotoStore } from '../progress-photos/storage'
/** Operator credential only. Bounded batches; safe to repeat after interruption. */
export async function processAccountClosures(gateway?:BillingGateway){
 const due=await db().query("SELECT id,user_id FROM account_closures WHERE effective_at<=clock_timestamp() AND state='scheduled' ORDER BY effective_at,id LIMIT 20")
 let closed=0,blocked=0
 for(const job of due.rows){
  try{
   const existing=await db().query('SELECT 1 FROM billing_subscriptions s JOIN billing_accounts a ON a.id=s.account_id WHERE a.user_id=$1',[job.user_id])
   if(existing.rowCount){const canonical=await subscriptionStatus(job.user_id,true,gateway,false);if(canonical.syncState!=='ok'||canonical.state==='unavailable'){blocked++;continue}}
   const ready=await locked(job.user_id,c=>transaction(c,async()=>{
    const r=(await c.query("SELECT * FROM account_closures WHERE id=$1 AND effective_at<=clock_timestamp() AND state='scheduled' FOR UPDATE",[job.id])).rows[0]
    if(!r)return false
    // Renewal after scheduling must never erase an active extended contract.
    const sub=(await c.query('SELECT s.* FROM billing_subscriptions s JOIN billing_accounts a ON a.id=s.account_id WHERE a.user_id=$1',[job.user_id])).rows[0]
    if(sub&&!['canceled','incomplete_expired'].includes(sub.provider_status)){
     const end=sub.cancel_at??(sub.cancel_at_period_end?(sub.provider_status==='trialing'?sub.trial_end:sub.period_end):null)
     if(!end||end.getTime()>Date.now())return false
    }
    await c.query('UPDATE users SET disabled_at=COALESCE(disabled_at,clock_timestamp()) WHERE id=$1',[job.user_id])
    await c.query('UPDATE sessions SET revoked_at=COALESCE(revoked_at,clock_timestamp()) WHERE user_id=$1',[job.user_id])
    await c.query('DELETE FROM credentials WHERE user_id=$1',[job.user_id])
    await c.query('DELETE FROM password_resets WHERE user_id=$1',[job.user_id])
    await c.query('DELETE FROM settings_email_changes WHERE user_id=$1',[job.user_id])
    await c.query('DELETE FROM pending_registrations WHERE email=(SELECT email FROM users WHERE id=$1)',[job.user_id])
    await c.query("UPDATE professional_settings SET profile='{}',avatar=NULL,published_profile=NULL,version=version+1 WHERE user_id=$1",[job.user_id])
    await c.query("UPDATE professional_settings SET account='{}',cpf_ciphertext=NULL,cpf_last_digits=NULL WHERE user_id=$1 AND NOT EXISTS(SELECT 1 FROM billing_accounts WHERE user_id=$1) AND NOT EXISTS(SELECT 1 FROM finance_accounts WHERE professional_id=$1)",[job.user_id])
    return true
   }))
   if(!ready){blocked++;continue}
   await requestErasure({id:job.id,ownerId:job.user_id,subjectId:job.user_id,scope:'professional',approvalReference:job.id})
   await db().query("UPDATE account_closures SET state='closed',processed_at=clock_timestamp() WHERE id=$1",[job.id]);closed++
  }catch{blocked++;console.error('account_closure_processing_unavailable')}
 }
 return {closed,blocked}
}

/** Only jobs originating from self-service closures, never unrelated erasure jobs. */
export async function processClosureErasures(store:PrivatePhotoStore|null){
 const rows=await db().query("SELECT j.id FROM privacy_erasure_jobs j JOIN account_closures x ON x.id=j.id AND x.user_id=j.owner_id WHERE x.state='closed' AND j.state IN ('pending','cleaning','waiting') AND (j.lease_until IS NULL OR j.lease_until<clock_timestamp()) ORDER BY j.created_at,j.id LIMIT 20")
 let completed=0,blocked=0,failed=0
 for(const row of rows.rows){try{const result=await processErasure(row.id,store);if(result.state==='completed')completed++;else if(result.state==='blocked')blocked++;if(result.failed)failed++}catch{failed++;console.error('account_closure_erasure_unavailable')}}
 return {completed,blocked,failed}
}
