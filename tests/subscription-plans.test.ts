import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { ControlledGateway } from './helpers/controlled-billing'
import { startCheckout, reconcileUser } from '../src/server/subscriptions/service'
import { BillingConflict, BillingUnavailable, assertPrice } from '../src/server/subscriptions/stripe'
import { subscriptionPlans, planAmount, type PlanSelection } from '../src/modules/subscriptions/plan'
import { subscriptionStatus } from '../src/server/subscriptions/status'
import { execute, read } from '../src/server/imports/repository'
import { importCommand, importQuery, type Job } from '../src/modules/imports/schema'
import { createStudent, updateStudent, StudentConflict } from '../src/server/students/repository'
const connection = process.env.TEST_DATABASE_URL
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw Error('Disposable test database required')
Object.assign(process.env,{ DATABASE_URL:connection,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:'synthetic'.repeat(8),STRIPE_SECRET_KEY:'sk_test_controlled_fixture',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_controlled_fixture' })
let user: string
before(async()=>{await migrate(connection)})
beforeEach(async()=>{await db().query('TRUNCATE users CASCADE');user=randomUUID();await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic personal','professional',now())",[user,`${user}@example.test`])})
after(async()=>{await db().end()})
function gateway(selection:PlanSelection){
 const g=new ControlledGateway();const id=selection.plan==='pro'&&selection.interval==='month'?'price_fixture':`price_${selection.plan}_${selection.interval}`
 process.env[`STRIPE_PRICE_${selection.plan.toUpperCase()}_${selection.interval==='year'?'ANNUAL':'MONTHLY'}`]=id
 process.env[`STRIPE_PRODUCT_${selection.plan.toUpperCase()}`]='prod_fixture'
 g.fixturePrice={...g.fixturePrice,id,unit_amount:planAmount(selection),recurring:{...g.fixturePrice.recurring!,interval:selection.interval}}
 return g
}
for(const plan of Object.keys(subscriptionPlans) as PlanSelection['plan'][]){for(const interval of ['month','year'] as const){test(`${plan}/${interval}: canonical checkout, trial, persisted terms and paid coverage`,async()=>{
 const selection={plan,interval},g=gateway(selection)
 await startCheckout(user,g,selection);const params=g.createCalls[0].input
 assert.equal(params.line_items?.[0].price,g.fixturePrice.id);assert.equal(params.subscription_data?.trial_period_days,30)
 const {sub}=g.complete();await reconcileUser(user,g)
 const status=await subscriptionStatus(user,false,g,false);assert.equal(status.paidAccess,true);assert.equal(status.planId,plan);assert.equal(status.billingInterval,interval);assert.equal(status.contractedAmount,planAmount(selection));assert.equal(status.studentLimit,subscriptionPlans[plan].studentLimit)
 await assert.rejects(startCheckout(user,g,selection),BillingConflict)
 const inv=g.paid(sub);inv.amount_due=planAmount(selection);inv.amount_paid=planAmount(selection);inv.lines.data[0].amount=planAmount(selection);inv.lines.data[0].pricing!.price_details!.price=g.fixturePrice.id
 await reconcileUser(user,g);assert.equal((await subscriptionStatus(user,false,g,false)).paidAccess,true)
 inv.lines.data[0].amount=1;await reconcileUser(user,g);assert.equal((await subscriptionStatus(user,false,g,false)).paidAccess,false)
})}}
test('pending checkout cannot silently change selected plan or interval',async()=>{const g=gateway({plan:'standard',interval:'month'});await startCheckout(user,g,{plan:'standard',interval:'month'});await assert.rejects(startCheckout(user,g,{plan:'premium',interval:'year'}),BillingConflict);assert.equal(g.createCalls.length,1)})
test('catalog rejects wrong amount, product, interval and live price',()=>{const selection={plan:'standard',interval:'year'} as const,g=gateway(selection);for(const patch of [{unit_amount:1},{livemode:true},{recurring:{...g.fixturePrice.recurring!,interval:'month' as const}}])assert.throws(()=>assertPrice({...g.fixturePrice,...patch},g.fixturePrice.id,'prod_fixture',true,selection),BillingUnavailable);assert.throws(()=>assertPrice(g.fixturePrice,g.fixturePrice.id,'prod_other',true,selection),BillingUnavailable)})
for(const plan of ['standard','premium','pro'] as const)test(`${plan}: active capacity, archived slots and concurrent writes`,async()=>{
 const g=gateway({plan,interval:'month'});await startCheckout(user,g,{plan,interval:'month'});g.complete();await reconcileUser(user,g)
 const input=(i:number)=>({fullName:`Synthetic student ${i}`,email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const limit=subscriptionPlans[plan].studentLimit??55
 const students=[];for(let i=0;i<limit-1;i++)students.push(await createStudent(user,input(i)))
 const results=await Promise.allSettled([createStudent(user,input(100)),createStudent(user,input(101))])
 assert.equal(results.filter(r=>r.status==='fulfilled').length,plan==='pro'?2:1)
 if(plan!=='pro'){
  const failed=results.find(r=>r.status==='rejected') as PromiseRejectedResult;assert.ok(failed.reason instanceof StudentConflict);assert.equal(failed.reason.reason,'capacity')
  const archived=await updateStudent(user,students[0].id,students[0].version,{status:'archived'});await createStudent(user,input(200));await assert.rejects(updateStudent(user,archived.id,archived.version,{status:'active'}),StudentConflict)
  const other=randomUUID();await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Other personal','professional',now())",[other,`${other}@example.test`]);await createStudent(other,input(300))
 }
})

test('student import uses the same active limit and reports capacity without creating extra records',async()=>{
 const g=gateway({plan:'standard',interval:'month'});await startCheckout(user,g,{plan:'standard',interval:'month'});g.complete();await reconcileUser(user,g)
 const text='fullName,email,phone,birthDate,adminNotes\n'+Array.from({length:31},(_,i)=>`Import student ${i},,,,`).join('\n')
 const preview=await execute(user,importCommand.parse({action:'preview',creationKey:randomUUID(),kind:'students',text,delimiter:',',mapping:{fullName:0,email:1,phone:2,birthDate:3,adminNotes:4}}))
 let job=await read(user,importQuery.parse({view:'job',id:preview.id,page:1})) as Job
 await execute(user,importCommand.parse({action:'confirm',id:job.id,version:job.version,choices:[],confirmed:true}))
 await execute(user,{action:'process',id:job.id});await execute(user,{action:'process',id:job.id})
 job=await read(user,importQuery.parse({view:'job',id:job.id,page:2})) as Job
 assert.equal(job.counts.imported,30);assert.equal(job.counts.rejected,1)
 assert.equal(job.rows!.items.find(r=>r.state==='rejected')?.error_code,'student_limit')
 assert.equal((await db().query("SELECT count(*)::int AS n FROM student_links WHERE professional_id=$1 AND status='active'",[user])).rows[0].n,30)
})
