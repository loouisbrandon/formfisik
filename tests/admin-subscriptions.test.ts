import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {adminSubscriptions,adminSubscriptionDetail} from '../src/server/admin/subscriptions'
import {adminSubscriptionsQuery,adminSubscriptionDetailQuery,subscriptionsHref} from '../src/modules/admin/subscriptions-schema'
import {planAmount,subscriptionPlans,type PlanId} from '../src/modules/subscriptions/plan'
const actor={id:randomUUID(),role:'admin',fullName:'Synthetic Admin',email:'synthetic@example.test'}
test('subscriptions admin guards and query boundaries',async()=>{
 for(const role of ['professional','student','ADMIN','']){
  await assert.rejects(adminSubscriptions({...actor,role},{}),/ADMIN_ACCESS_DENIED/)
  await assert.rejects(adminSubscriptionDetail({...actor,role},randomUUID()),/ADMIN_ACCESS_DENIED/)
 }
 for(const input of [{page:0},{page:10001},{plan:'vip'},{interval:'week'},{status:'approved'},{sort:'DROP TABLE users'},{q:'x'.repeat(121)},{unknown:'value'}])assert.equal(adminSubscriptionsQuery.safeParse(input).success,false)
 assert.equal(adminSubscriptionDetailQuery.safeParse({faturas:0}).success,false)
 assert.equal(await adminSubscriptionDetail(actor,'invalid'),null)
 const query=adminSubscriptionsQuery.parse({q:'Synthetic',plan:'pro',interval:'year',page:2})
 const url=new URL(subscriptionsHref(query),'http://localhost');assert.equal(url.searchParams.get('plan'),'pro');assert.equal(url.searchParams.get('page'),'2')
})
test('subscriptions listing and invoices are bounded, read-only and minimally projected',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 process.env.DATABASE_URL=url
 const {migrate}=await import('../scripts/migrate');await migrate(url)
 const {db}=await import('../src/server/db'),users:string[]=[],accounts:string[]=[],prefix=randomUUID().slice(0,8)
 try{
  for(let i=0;i<24;i++){
   const user=randomUUID(),account=randomUUID(),checkout=randomUUID();users.push(user);accounts.push(account)
   await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,$3,now())",[user,user+'@example.test',prefix+(i===0?'%_name':' User '+String(i).padStart(2,'0'))])
   await db().query("INSERT INTO billing_accounts(id,user_id,sync_state,created_at) VALUES($1,$2,'error',now()-$3*interval '1 day')",[account,user,i])
   if(i===23)continue // Billing account without subscription must not be synthesized as a plan.
   const plan=(['standard','premium','pro'] as PlanId[])[i%3],interval=i%2?'year':'month',amount=planAmount({plan,interval})
   await db().query("INSERT INTO billing_checkouts(id,account_id,state,price_id,product_id,app_origin,expires_at,plan_id,billing_interval,amount) VALUES($1,$2,'confirmed','synthetic_price','synthetic_product','http://localhost:3000',now()+interval '1 hour',$3,$4,$5)",[checkout,account,plan,interval,amount])
   await db().query("INSERT INTO billing_subscriptions(account_id,checkout_id,stripe_subscription_id,provider_status,price_id,product_id,currency,monthly_amount,plan_id,billing_interval,amount,verified_at,cancel_at_period_end) VALUES($1,$2,$3,$4,'synthetic_price','synthetic_product','brl',$5,$6,$7,$8,'epoch',$9)",[account,checkout,'synthetic_'+account,['active','trialing','past_due','canceled'][i%4],subscriptionPlans[plan].monthlyPriceCents,plan,interval,amount,i===0])
  }
  for(let i=0;i<12;i++)await db().query("INSERT INTO billing_invoices(stripe_invoice_id,account_id,stripe_subscription_id,status,currency,amount_due,amount_paid,attempt_count,created_at) VALUES($1,$2,'synthetic','paid','brl',4990,4990,1,now()-$3*interval '1 day')",['synthetic_'+randomUUID(),accounts[0],i])
  await db().query("INSERT INTO billing_invoices(stripe_invoice_id,account_id,stripe_subscription_id,status,currency,amount_due,amount_paid,attempt_count,created_at) VALUES($1,$2,'synthetic','paid','brl',999,999,1,now())",['synthetic_'+randomUUID(),accounts[1]])
  const first=await adminSubscriptions(actor,{q:prefix});assert.equal(first.total,23);assert.equal(first.items.length,20);assert.equal(first.pages,2)
  const second=await adminSubscriptions(actor,{q:prefix,page:2});assert.equal(second.items.length,3);assert.ok(second.items.every(item=>!first.items.some(row=>row.accountId===item.accountId)))
  assert.deepEqual(Object.keys(first.items[0]).sort(),['accountId','amount','cancelScheduled','createdAt','fullName','interval','planId','status'])
  assert.equal((await adminSubscriptions(actor,{q:prefix,plan:'standard'})).total,8)
  assert.equal((await adminSubscriptions(actor,{q:prefix,interval:'year'})).total,11)
  assert.equal((await adminSubscriptions(actor,{q:prefix,status:'past_due'})).total,6)
  assert.equal((await adminSubscriptions(actor,{q:prefix+'%_'})).total,1)
  assert.equal((await adminSubscriptions(actor,{q:"' OR 1=1 --"})).total,0)
  assert.equal((await adminSubscriptions(actor,{q:prefix,page:10000})).items.length,0)
  assert.equal((await adminSubscriptions(actor,{q:prefix,sort:'oldest'})).items[0].accountId,accounts[22])
  const detail=await adminSubscriptionDetail(actor,accounts[0]);assert.ok(detail)
  assert.equal(detail.invoiceTotal,12);assert.equal(detail.invoices.length,10);assert.equal(detail.subscription.syncState,'error');assert.equal(detail.subscription.cancelScheduled,true)
  assert.ok(detail.invoices.every(i=>i.amountPaid===4990))
  assert.deepEqual(Object.keys(detail.invoices[0]).sort(),['amountDue','amountPaid','createdAt','status'])
  assert.equal((await adminSubscriptionDetail(actor,accounts[0],2))?.invoices.length,2)
  assert.equal((await adminSubscriptionDetail(actor,accounts[0],10000))?.invoices.length,0)
  assert.equal(await adminSubscriptionDetail(actor,accounts[23]),null)
  assert.equal(await adminSubscriptionDetail(actor,randomUUID()),null)
  assert.equal((await db().query('SELECT sync_state FROM billing_accounts WHERE id=$1',[accounts[0]])).rows[0].sync_state,'error')
  assert.ok(!JSON.stringify(first).includes('synthetic_price'))
 }finally{await db().query('DELETE FROM billing_accounts WHERE id=ANY($1::uuid[])',[accounts]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[users]);await db().end()}
})
