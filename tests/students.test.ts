import {before,beforeEach,after,test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {mkdir,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import Stripe from 'stripe'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {createSession} from '../src/server/sessions'
import {startCheckout,processBillingEvent} from '../src/server/subscriptions/service'
import {ControlledGateway,fixture} from './helpers/controlled-billing'
import {createStudentHandler} from '../src/server/students/handlers'
import {createStudent,listStudents,updateStudent} from '../src/server/students/repository'
import {createDashboardHandler} from '../src/server/professional-dashboard'
import {studentFields,studentQuerySchema} from '../src/modules/students/schema'
const connection=process.env.TEST_DATABASE_URL
if(!connection||!new URL(connection).pathname.endsWith('_test'))throw new Error('Isolated _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_not_real',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_not_real',STRIPE_PORTAL_CONFIGURATION_ID:''})
let owner:string,cookie:string,provider:ControlledGateway
const fields={fullName:'Ágata Gonçalves',email:'',phone:'',birthDate:'',adminNotes:''}
const query=studentQuerySchema.parse({})
before(async()=>{await migrate(connection);await migrate(connection)})
beforeEach(async()=>{await db().query('TRUNCATE users,billing_events,abuse_limits CASCADE');owner=randomUUID();provider=new ControlledGateway();await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Profissional responsável','professional',now())",[owner,owner+'@example.test']);cookie='formfisik-session='+(await createSession(owner)).token;await startCheckout(owner,provider);const {session}=provider.complete();await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),livemode:false,type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:session}}),provider)})
after(async()=>{await db().end()})
function req(op:string,body?:unknown,session=cookie){return new Request(process.env.APP_URL+'/api/students'+(op==='list'?'':op),{method:body?'POST':'GET',headers:{origin:process.env.APP_URL!,'content-type':'application/json',cookie:session},body:body?JSON.stringify(body):undefined})}
const handler=(op:Parameters<typeof createStudentHandler>[0])=>createStudentHandler(op,provider)
const create=(data={})=>createStudent(owner,{...fields,creationKey:randomUUID(),...data})
test('schema validates required, optional, lengths, email, phone, real calendar dates and forbidden mass assignment',()=>{
 assert.equal(studentFields.safeParse(fields).success,true)
 for(const data of [{fullName:''},{email:'no-email'},{phone:'abc'},{birthDate:'2025-02-30'},{birthDate:'2099-01-01'},{adminNotes:'x'.repeat(1001)},{professionalId:randomUUID()},{fullName:'a\nb'}])assert.equal(studentFields.safeParse({...fields,...data}).success,false)
 assert.equal(studentFields.parse({...fields,email:' TEST@EXAMPLE.COM ',phone:'(11) 99999-1234'}).email,'test@example.com')
})
test('valid registration persists private identity/link, defaults active and creates no authentication user',async()=>{
 const response=await handler('create')(req('',{fullName:fields.fullName,creationKey:randomUUID()}));assert.equal(response.status,201)
 const student=(await response.json()).student;assert.equal(student.status,'active');assert.equal(student.email,'');assert.equal(student.version,1)
 assert.equal((await db().query('SELECT count(*)::int AS n FROM users')).rows[0].n,1)
 assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,1)
 assert.equal((await handler('get')(req('/'+student.id),student.id)).status,200)
})
test('same creation key is idempotent under concurrency, conflicting payload rejected and homonyms require explicit acknowledgement',async()=>{
 const input={...fields,creationKey:randomUUID()};const records=await Promise.all([createStudent(owner,input),createStudent(owner,input)]);assert.equal(records[0].id,records[1].id)
 await assert.rejects(createStudent(owner,{...input,fullName:'Outra pessoa'}),/key/)
 const denied=await handler('create')(req('',{...fields,creationKey:randomUUID()}));assert.equal(denied.status,409);assert.equal((await denied.json()).code,'duplicate')
 const homonym=await create({allowDuplicate:true});assert.notEqual(homonym.id,records[0].id)
})
test('database search literal wildcards, filters, sorting, total and SQL pagination use only owner rows',async()=>{
 for(let i=0;i<23;i++)await create({fullName:'Aluno '+String(i).padStart(2,'0')})
 const page=await listStudents(owner,{...query,q:'Aluno',page:2});assert.equal(page.total,23);assert.equal(page.items.length,3);assert.equal('adminNotes' in page.items[0],false);assert.equal('email' in page.items[0],false);assert.equal(page.pages,2)
 assert.equal((await listStudents(owner,{...query,q:'%',status:'all'})).total,0)
 const newest=await listStudents(owner,{...query,sort:'name_desc'});assert.equal(newest.items[0].fullName,'Aluno 22')
 const archived=await updateStudent(owner,newest.items[0].id,1,{status:'archived'})
 assert.equal((await listStudents(owner,{...query,status:'archived'})).total,1);assert.equal((await listStudents(owner,{...query,status:'active'})).total,22)
 assert.equal((await listStudents(owner,{...query,q:"' OR 1=1 --"})).total,0);assert.equal(archived.status,'archived')
})
test('edits validate input; optimistic version prevents lost edits across concurrent requests',async()=>{
 const student=await create();const results=await Promise.all([handler('edit')(req('',{...fields,fullName:'Nome atualizado',version:1}),student.id),handler('edit')(req('',{...fields,fullName:'Outra edição',version:1}),student.id)])
 assert.deepEqual(results.map(x=>x.status).sort(),[200,409]);assert.equal((await handler('edit')(req('',{...fields,fullName:'',version:2}),student.id)).status,400)
})
test('archive and reactivate preserve private identity, dates and version, no physical deletion',async()=>{
 const student=await create();let response=await handler('status')(req('',{version:1,status:'archived'}),student.id);assert.equal(response.status,200)
 const archived=(await response.json()).student;assert.ok(archived.archivedAt);assert.equal(archived.version,2)
 response=await handler('status')(req('',{version:2,status:'active'}),student.id);const restored=(await response.json()).student;assert.equal(restored.archivedAt,null);assert.ok(restored.reactivatedAt);assert.equal(restored.version,3);assert.deepEqual(restored.history.map((event:{kind:string})=>event.kind),['reactivated','archived','created'])
 assert.equal((await db().query('SELECT count(*)::int AS n FROM student_records')).rows[0].n,1)
})
test('all endpoints require session, paid authorization and ownership; nonexistent and foreign IDs return same 404',async()=>{
 const student=await create();for(const op of ['list','create','get','edit','status','pdf','export'] as const)assert.equal((await handler(op)(req('',undefined,''),student.id)).status,401)
 const other=randomUUID();await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Outro profissional','professional',now())",[other,other+'@example.test'])
 const otherRecord=await createStudent(other,{...fields,fullName:'Segredo do outro profissional',creationKey:randomUUID()})
 for(const op of ['get','edit','status','pdf'] as const){const response=await handler(op)(req('',op==='edit'?{...fields,version:1}:op==='status'?{status:'archived',version:1}:undefined),otherRecord.id);assert.equal(response.status,404);assert.deepEqual(await response.json(),{message:'Aluno não encontrado.'})}
 const ownList=await handler('list')(req('list'));assert.equal((await ownList.json()).total,1)
 const ownPdf=await handler('export')(req(''));const pdfText=execFileSync('pdftotext',['-','-'],{input:Buffer.from(await ownPdf.arrayBuffer()),encoding:'utf8'});assert.doesNotMatch(pdfText,/Segredo/);assert.match(pdfText,/Ágata/)
 assert.equal((await handler('get')(req(''),randomUUID())).status,404)
 assert.equal((await handler('get')(req(''),'not-a-uuid')).status,404)
 assert.equal((await handler('list')(req('?professionalId='+other))).status,400)
 const otherCookie='formfisik-session='+(await createSession(other)).token
 assert.equal((await handler('get')(req('',undefined,otherCookie),student.id)).status,403)
 assert.equal((await handler('export')(req('',undefined,otherCookie))).status,403)
 await db().query("UPDATE sessions SET last_seen_at=now()-interval '31 minutes'");assert.equal((await handler('get')(req(''),student.id)).status,401)
})
test('CSRF, strict schemas, abusive requests and cache headers protect administrative operations',async()=>{
 const wrong=new Request(process.env.APP_URL+'/api/students',{method:'POST',headers:{origin:'https://foreign.test',cookie,'content-type':'application/json'},body:JSON.stringify(fields)})
 assert.equal((await handler('create')(wrong)).status,403)
 assert.equal((await handler('create')(req('',{...fields,creationKey:randomUUID(),status:'active'}))).status,400)
 for(let i=0;i<5;i++){const r=await handler('export')(req(''));assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('referrer-policy'),'no-referrer')}
 assert.equal((await handler('export')(req(''))).status,429)
})
test('dashboard uses real owner counts and onboarding total, including archival, excluding third parties',async()=>{
 const first=await create();await create({fullName:'Segundo aluno'});await updateStudent(owner,first.id,1,{status:'archived'})
 const response=await createDashboardHandler(provider)(req(''));const data=(await response.json()).data
 assert.equal(data.studentTotal,2);assert.deepEqual(data.indicators.map((i:{value:string})=>i.value),['1','1','0','0','0','0','1'])
})
test('structured individual and extensive portfolio PDFs preserve accents, absent fields, privacy and pagination',async()=>{
 const student=await create({adminNotes:'Observações de organização. '.repeat(30)})
 await mkdir('test-results/008/pdf',{recursive:true})
 const individual=await handler('pdf')(req(''),student.id);assert.equal(individual.status,200);await writeFile('test-results/008/pdf/individual.pdf',Buffer.from(await individual.arrayBuffer()))
 for(let i=0;i<65;i++)await create({fullName:'Estudante Ção relatório '+i})
 const portfolio=await handler('export')(req('?q=Estudante&status=active&sort=name_asc'));assert.equal(portfolio.status,200);await writeFile('test-results/008/pdf/carteira.pdf',Buffer.from(await portfolio.arrayBuffer()))
 const single=execFileSync('pdftotext',['test-results/008/pdf/individual.pdf','-'],{encoding:'utf8'});assert.match(single,/Ágata Gonçalves/);assert.match(single,/Não informado/);assert.doesNotMatch(single,/sk_test|token|password|cus_/)
 const list=execFileSync('pdftotext',['test-results/008/pdf/carteira.pdf','-'],{encoding:'utf8'});assert.match(list,/65/);assert.match(list,/Estudante Ção/);assert.doesNotMatch(list,/Ágata|Observações de organização/)
 const info=execFileSync('pdfinfo',['test-results/008/pdf/carteira.pdf'],{encoding:'utf8'});assert.match(info,/A4/);assert.ok(Number(info.match(/Pages:\s+(\d+)/)?.[1])>1)
 const pageCount=Number(info.match(/Pages:\s+(\d+)/)?.[1]);assert.equal((list.match(/Página \d+ de/g)||[]).length,pageCount)
 for(const pdf of ['individual','carteira']){const bbox=execFileSync('pdftotext',['-bbox','test-results/008/pdf/'+pdf+'.pdf','-'],{encoding:'utf8'});for(const match of bbox.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"/g)){assert.ok(Number(match[1])>=45&&Number(match[2])>=30&&Number(match[3])<=550&&Number(match[4])<=820,'PDF words stay within print bounds')}}
})
test('large portfolio exports reject above 500 records rather than silently truncate',async()=>{
 await db().query(`WITH records AS (INSERT INTO student_records(id,professional_id,full_name) SELECT gen_random_uuid(),$1,'Volume '||n FROM generate_series(1,501)n RETURNING id,professional_id) INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) SELECT gen_random_uuid(),professional_id,id,gen_random_uuid(),'test' FROM records`,[owner])
 assert.equal((await handler('export')(req(''))).status,422)
})
