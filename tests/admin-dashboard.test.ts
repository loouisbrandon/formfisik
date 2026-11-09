import {test} from 'node:test'
import assert from 'node:assert/strict'
import {isAdministrator,adminDashboard} from '../src/server/admin/dashboard'
import {destinationFor} from '../src/server/access'
import type {Identity} from '../src/server/sessions'
test('admin destination and deny-by-default role boundary',async()=>{
 assert.equal(destinationFor({role:'admin'}),'/admin')
 assert.equal(destinationFor({role:'professional'}),'/dashboard')
 assert.equal(destinationFor({role:'student'}),'/conta')
 assert.equal(isAdministrator(null),false)
 for(const role of ['professional','student','ADMIN','owner','']){
  assert.equal(isAdministrator({role}),false)
  await assert.rejects(adminDashboard({id:'synthetic',role,email:'synthetic@example.test',fullName:'Synthetic'} as Identity),/ADMIN_ACCESS_DENIED/)
 }
 assert.equal(isAdministrator({role:'admin'}),true)
})

test('real login, aggregate DTO, role revocation and logout', {skip:!process.env.TEST_DATABASE_URL},async()=>{
 const connection=process.env.TEST_DATABASE_URL!
 if(!new URL(connection).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 process.env.DATABASE_URL=connection;process.env.APP_URL='http://localhost:3107'
 const {randomUUID,randomBytes}=await import('node:crypto')
 process.env.ABUSE_HMAC_SECRET=randomBytes(32).toString('hex')
 const {migrate}=await import('../scripts/migrate');await migrate(connection)
 const {db}=await import('../src/server/db'),{hash,argon2id}=await import('argon2'),{login,logout}=await import('../src/server/auth'),{readSession}=await import('../src/server/sessions')
 const professionalId=randomUUID(),studentId=randomUUID(),accountId=randomUUID()
 const id=randomUUID(),email=id+'@example.test',password='Synthetic-Admin123!'
 const request=(path:string,body:unknown,cookie='')=>new Request('http://localhost:3107'+path,{method:'POST',headers:{origin:'http://localhost:3107','content-type':'application/json',cookie},body:JSON.stringify(body)})
 try{
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Admin','admin',now())",[id,email])
  await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[id,await hash(password,{type:argon2id,memoryCost:19456,timeCost:2,parallelism:1})])
  const response=await login(request('/api/auth/login',{email,password}))
  assert.equal(response.status,200);assert.equal((await response.json()).destination,'/admin')
  const cookie=response.headers.get('set-cookie')!.split(';')[0],token=cookie.split('=')[1],identity=await readSession(token)
  assert.ok(identity);assert.equal(identity.role,'admin')
  const result=await adminDashboard(identity)
  assert.deepEqual(Object.keys(result).sort(),['exercisePreview','months','pendingExercises','professionals','revenueCents','students','users'])
  assert.ok(result.users>=result.professionals);assert.equal(result.months.length,6);assert.ok(result.months.every(m=>Number.isInteger(m.count)&&m.count>=0));assert.match(result.revenueCents,/^\d+$/)
  await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Professional','professional',now())",[professionalId,professionalId+'@example.test'])
  await db().query("INSERT INTO student_records(id,professional_id,full_name) VALUES($1,$2,'Synthetic Student')",[studentId,professionalId])
  await db().query('INSERT INTO billing_accounts(id,user_id) VALUES($1,$2)',[accountId,professionalId])
  for(const [invoice,status,paid] of [['paid','paid',15990],['unpaid','open',5000]] as const)await db().query("INSERT INTO billing_invoices(stripe_invoice_id,account_id,stripe_subscription_id,status,currency,amount_due,amount_paid,attempt_count,created_at) VALUES($1,$2,'synthetic_subscription',$3,'brl',15990,$4,1,now())",[id+invoice,accountId,status,paid])
  await db().query("INSERT INTO exercise_requests(id,requested_by,proposal,creation_key,creation_digest) VALUES($1,$2,$5,$3,$4)",[randomUUID(),professionalId,randomUUID(),'synthetic',{name:'Exercício sintético',category:'forca',instructions:['Teste sintético']}])
  await db().query("INSERT INTO exercise_requests(id,requested_by,proposal,creation_key,creation_digest) SELECT gen_random_uuid(),$1,jsonb_build_object('name','Exercício adicional '||n,'category','forca','instructions',jsonb_build_array('Teste')),gen_random_uuid(),'synthetic' FROM generate_series(1,22) n",[professionalId])
  const updated=await adminDashboard(identity)
  assert.equal(updated.pendingExercises,result.pendingExercises+23)
  assert.ok(updated.exercisePreview.some(item=>item.name==='Exercício sintético'))
  assert.ok(updated.exercisePreview.length===5)
  const {adminExerciseRequests}=await import('../src/server/admin/exercise-requests')
  const list=await adminExerciseRequests(identity,{page:1})
  assert.equal(list.total,updated.pendingExercises)
  assert.equal(list.items.length,20)
  assert.equal((await adminExerciseRequests(identity,{page:2})).items.length,3)
  const selected=await adminExerciseRequests(identity,{solicitacao:list.items[0].id})
  assert.equal(selected.selected?.name,'Exercício sintético')
  assert.deepEqual(Object.keys(list.items[0]).sort(),['createdAt','id','name','state'])
  const empty=await adminExerciseRequests(identity,{page:10000})
  assert.equal(empty.items.length,0)
  await assert.rejects(adminExerciseRequests({...identity,role:'professional'},{}),/ADMIN_ACCESS_DENIED/)
  await assert.rejects(adminExerciseRequests(identity,{solicitacao:'invalid'}))
  assert.equal(updated.professionals,result.professionals+1)
  assert.equal(updated.students,result.students+1)
  assert.equal(updated.users,result.users+1)
  assert.equal(BigInt(updated.revenueCents),BigInt(result.revenueCents)+BigInt(15990))
  assert.equal(updated.months.at(-1)!.count,result.months.at(-1)!.count+1)
  await db().query("UPDATE users SET role='student' WHERE id=$1",[id])
  const changed=await readSession(token);assert.ok(changed);assert.equal(changed.role,'student')
  await assert.rejects(adminDashboard(changed),/ADMIN_ACCESS_DENIED/)
  assert.equal((await logout(request('/api/auth/logout',{},cookie))).status,200)
  assert.equal(await readSession(token),null)
 }finally{await db().query('DELETE FROM exercise_requests WHERE requested_by=$1',[professionalId]);await db().query('DELETE FROM billing_accounts WHERE id=$1',[accountId]);await db().query('DELETE FROM student_records WHERE id=$1',[studentId]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[id,professionalId]]);await db().end()}
})
