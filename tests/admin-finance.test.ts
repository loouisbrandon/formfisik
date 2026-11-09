import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {adminFinance} from '../src/server/admin/finance'
import {adminSubscriptionsQuery} from '../src/modules/admin/subscriptions-schema'
const actor={id:randomUUID(),role:'admin',fullName:'Synthetic Admin',email:'synthetic@example.test'}
test('finance rejects non-admins and validates bounded periods and pages',async()=>{
 for(const role of ['professional','student','ADMIN',''])await assert.rejects(adminFinance({...actor,role},{}),/ADMIN_ACCESS_DENIED/)
 for(const input of [{months:'24'},{movimentos:0},{cobrancas:10001}])assert.equal(adminSubscriptionsQuery.safeParse(input).success,false)
})
test('financial facts and forecasts remain distinct, bounded and read-only',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 process.env.DATABASE_URL=url
 const {migrate}=await import('../scripts/migrate');await migrate(url)
 const {db}=await import('../src/server/db'),users:string[]=[],accounts:string[]=[]
 try{
  const before=await adminFinance(actor,{})
  for(let i=0;i<17;i++){
   const user=randomUUID(),account=randomUUID(),checkout=randomUUID();users.push(user);accounts.push(account)
   await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,'Synthetic Finance',now())",[user,user+'@example.test'])
   await db().query('INSERT INTO billing_accounts(id,user_id,sync_state) VALUES($1,$2,$3)',[account,user,i===3?'error':'ok'])
   const plan=i===10?'pro':'standard',interval=i===10?'year':'month',amount=i===10?134304:4990
   await db().query("INSERT INTO billing_checkouts(id,account_id,state,price_id,product_id,app_origin,expires_at,plan_id,billing_interval,amount) VALUES($1,$2,'confirmed','synthetic','synthetic','http://localhost:3000',now()+interval '1 hour',$3,$4,$5)",[checkout,account,plan,interval,amount])
   await db().query("INSERT INTO billing_subscriptions(account_id,checkout_id,stripe_subscription_id,provider_status,price_id,product_id,currency,monthly_amount,plan_id,billing_interval,amount,period_end,trial_end,cancel_at_period_end,collection_paused,ended_at,upcoming_amount) VALUES($1,$2,$3,$4,'synthetic','synthetic','brl',$5,$6,$7,$8,now()+$9*interval '1 day',now()+interval '10 days',$10,$11,CASE WHEN $12 THEN now() ELSE NULL END,$13)",[account,checkout,'synthetic_'+account,i===1?'trialing':i===5?'past_due':i===12?'canceled':'active',i===10?13990:4990,plan,interval,amount,i===6?-1:i===11?35:5,i===2,i===7,i===8,i===0?1234:i===9?-100:null])
  }
  async function invoice(account:string,status:string,due:number,paid:number,old=false){await db().query("INSERT INTO billing_invoices(stripe_invoice_id,account_id,stripe_subscription_id,status,currency,amount_due,amount_paid,attempt_count,created_at) VALUES($1,$2,'synthetic',$3,'brl',$4,$5,1,CASE WHEN $6 THEN now()-interval '2 months' ELSE now() END)",[randomUUID(),account,status,due,paid,old])}
  await invoice(accounts[0],'paid',10000,10000)
  await invoice(accounts[0],'paid',2000,2000,true)
  await invoice(accounts[4],'open',5000,2000)
  await invoice(accounts[5],'open',7000,1000)
  await invoice(accounts[0],'void',99999,0)
  await invoice(accounts[0],'uncollectible',777,0)
  await invoice(accounts[0],'open',100,100)
  for(let i=0;i<6;i++)await invoice(accounts[0],'paid',0,0)
  const result=await adminFinance(actor,{})
  assert.equal(BigInt(result.paidCents)-BigInt(before.paidCents),BigInt(12000))
  assert.equal(BigInt(result.receivableCents)-BigInt(before.receivableCents),BigInt(9000))
  assert.equal(BigInt(result.overdueCents)-BigInt(before.overdueCents),BigInt(6000))
  assert.equal(BigInt(result.estimateCents)-BigInt(before.estimateCents),BigInt(160488))
  assert.equal(result.chargeTotal-before.chargeTotal,7)
  assert.equal(result.movementTotal-before.movementTotal,13)
  assert.equal(result.charges.length,5);assert.equal((await adminFinance(actor,{cobrancas:2})).charges.length,2)
  assert.equal(result.movements.length,10);assert.equal((await adminFinance(actor,{movimentos:2})).movements.length,3)
  assert.equal(result.months.length,6)
  assert.equal(result.months.filter(m=>m.paidCents===null).length,2)
  assert.equal(result.months.filter(m=>m.estimateCents===null).length,3)
  assert.equal(result.months.reduce((sum,m)=>sum+Number(m.estimateCents??0),0),Number(result.estimateCents))
  assert.equal((await adminFinance(actor,{months:'12'})).months.length,12)
  assert.equal((await adminFinance(actor,{months:'3'})).months.length,3)
  assert.equal((await adminFinance(actor,{q:'no-matching-name',plan:'premium'})).paidCents,result.paidCents)
  assert.deepEqual(Object.keys(result.charges[0]).sort(),['amount','date','name','trial'])
  assert.deepEqual(Object.keys(result.movements[0]).sort(),['amountDue','amountPaid','createdAt','name','status'])
  assert.equal((await adminFinance(actor,{cobrancas:10000,movimentos:10000})).charges.length,0)
  assert.equal((await db().query('SELECT sync_state FROM billing_accounts WHERE id=$1',[accounts[3]])).rows[0].sync_state,'error')
 }finally{await db().query('DELETE FROM billing_accounts WHERE id=ANY($1::uuid[])',[accounts]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[users]);await db().end()}
})
