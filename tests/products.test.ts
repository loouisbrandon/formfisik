import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {productFields,emptyProduct,productCommand,productQuery,readiness} from '../src/modules/products/schema'
import {mutateProduct,productDetail,productList} from '../src/server/products/repository'
import {uploadProductFile,productFile,validateProductFile} from '../src/server/products/files'
import {productsHandler,productDownload} from '../src/server/products/handlers'
import sharp from 'sharp'
import PDFDocument from 'pdfkit'
const fields=()=>({...emptyProduct(),name:'Produto sintético',description:'Material sintético para testar o catálogo privado.',priceCents:4990,rightsConfirmed:true})
const pdf=()=>new Promise<Buffer>(resolve=>{const doc=new PDFDocument(),chunks:Buffer[]=[];doc.on('data',x=>chunks.push(x));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.text('Synthetic product material');doc.end()})
test('product validation distinguishes format, payment and bounded authoring',()=>{
 assert.ok(productFields.safeParse(fields()).success)
 assert.equal(productFields.safeParse({...fields(),kind:'physical'}).success,false)
 assert.equal(productFields.safeParse({...fields(),priceCents:1.2}).success,false)
 assert.equal(productFields.safeParse({...fields(),lessons:Array.from({length:41},()=>({id:randomUUID(),module:'M',title:'A',notes:'',youtube:''}))}).success,false)
 assert.equal(productFields.safeParse({...fields(),format:'course',lessons:[{id:randomUUID(),module:'M',title:'A',notes:'',youtube:'https://attacker.invalid'}]}).success,false)
 assert.equal(productCommand.safeParse({action:'save',operationKey:randomUUID(),fields:fields(),ownerId:randomUUID()}).success,false)
 assert.equal(productQuery.safeParse({page:10001}).success,false)
 assert.ok(readiness(fields(),[],0).length>=2)
})
test('files normalize images and reject disguised or malformed files',async()=>{
 const clean=await validateProductFile(await sharp({create:{width:64,height:64,channels:3,background:'#a9e600'}}).png().toBuffer(),'cover');assert.equal((await sharp(clean).metadata()).format,'jpeg')
 await assert.rejects(validateProductFile(Buffer.from('<svg onload="alert(1)"></svg>'),'cover'))
 await assert.rejects(validateProductFile(Buffer.from('%PDF-fake %%EOF'),'pdf'))
 assert.ok((await validateProductFile(await pdf(),'pdf')).length>0)
})
test('private products: ownership, idempotency, optimistic locking, files, readiness, snapshots, revocation and erasure',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 Object.assign(process.env,{DATABASE_URL:url,APP_URL:'http://localhost:3000',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')});delete process.env.RAILWAY_ENVIRONMENT_NAME
 const{migrate}=await import('../scripts/migrate');await migrate(url);await migrate(url)
 const{db}=await import('../src/server/db'),{createSession,revokeSession,cookieName}=await import('../src/server/sessions');const owner=randomUUID(),other=randomUUID(),admin=randomUUID()
 try{
 for(const[id,role]of[[owner,'professional'],[other,'professional'],[admin,'admin']])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Product Owner',$3,now())",[id,id+'@example.test',role])
 await db().query("INSERT INTO complimentary_access_grants(id,user_id,environment,reason,authorization_reference) VALUES($1,$2,'local','owner_authorized_test',$3)",[randomUUID(),owner,randomUUID()])
 const session=await createSession(owner),foreign=await createSession(other),asAdmin=await createSession(admin),save={action:'save' as const,operationKey:randomUUID(),fields:fields()}
 let p=await mutateProduct(owner,session.token,save);assert.equal((await mutateProduct(owner,session.token,save)).id,p.id)
 await assert.rejects(mutateProduct(owner,session.token,{...save,fields:{...fields(),name:'Different'}}))
 await assert.rejects(productDetail(other,p.id));await assert.rejects(mutateProduct(other,foreign.token,{...save,id:p.id,version:1,operationKey:randomUUID()}));await assert.rejects(mutateProduct(admin,asAdmin.token,save))
 await assert.rejects(mutateProduct(owner,session.token,{action:'state',id:p.id,version:p.version,state:'ready',confirmed:true,operationKey:randomUUID()}))
 const race=await Promise.allSettled(['First','Second'].map(name=>mutateProduct(owner,session.token,{...save,id:p.id,version:p.version,operationKey:randomUUID(),fields:{...fields(),name}})));assert.equal(race.filter(x=>x.status==='fulfilled').length,1);p=await productDetail(owner,p.id)
 p=await uploadProductFile(owner,session.token,p.id,p.version,randomUUID(),'cover','cover.png',await sharp({create:{width:64,height:64,channels:3,background:'#a9e600'}}).png().toBuffer());const cover=p.coverId!;assert.equal((await productFile(owner,cover)).mime,'image/jpeg');await assert.rejects(productFile(other,cover))
 p=await uploadProductFile(owner,session.token,p.id,p.version,randomUUID(),'pdf','ebook.pdf',await pdf());assert.equal(p.issues.length,0)
 const cookie=cookieName()+'='+session.token,request=(path:string,body?:unknown,cookieValue=cookie)=>new Request('http://localhost:3000'+path,{method:body?'POST':'GET',headers:{cookie:cookieValue,origin:'http://localhost:3000','content-type':'application/json'},body:body?JSON.stringify(body):undefined})
 assert.equal((await productsHandler(request('/api/products'))).status,200);assert.equal((await productsHandler(request('/api/products',undefined,''))).status,401)
 assert.equal((await productsHandler(request('/api/products',undefined,cookieName()+'='+foreign.token))).status,403)
 assert.equal((await productsHandler(new Request('http://localhost:3000/api/products',{method:'POST',headers:{origin:'https://attacker.invalid'}}))).status,403)
 const download=await productDownload(request('/api/products/files/'+cover),cover);assert.equal(download.status,200);assert.equal(download.headers.get('cache-control'),'private, no-store');assert.ok(download.headers.get('content-security-policy')?.includes('sandbox'))
 p=await mutateProduct(owner,session.token,{action:'state',id:p.id,version:p.version,state:'ready',confirmed:true,operationKey:randomUUID()});assert.equal(p.state,'ready')
 p=await mutateProduct(owner,session.token,{action:'state',id:p.id,version:p.version,state:'archived',confirmed:true,operationKey:randomUUID()});await assert.rejects(productFile(owner,cover));await assert.rejects(mutateProduct(owner,session.token,{...save,id:p.id,version:p.version,operationKey:randomUUID()}))
 p=await mutateProduct(owner,session.token,{action:'state',id:p.id,version:p.version,state:'draft',confirmed:true,operationKey:randomUUID()});assert.equal((await productList(owner,productQuery.parse({}))).total,1);assert.equal((await productList(other,productQuery.parse({}))).total,0);assert.equal((await productList(owner,productQuery.parse({q:'%'}))).total,0);assert.equal((await productList(owner,productQuery.parse({page:2}))).items.length,0)
 // Only owner templates can be snapshotted, without propagating later edits or student identity.
 const {emptyWorkout,newSet}=await import('../src/modules/workouts/schema'),{createPlan,editPlan}=await import('../src/server/workouts/repository'),{createExercise}=await import('../src/server/exercises/repository')
 const ex=await createExercise(owner,{name:'Synthetic movement',category:'forca',primaryMuscles:['peito'],secondaryMuscles:[],equipment:null,level:null,instructions:['Synthetic instruction'],aliases:[],creationKey:randomUUID()})
 const f={...emptyWorkout(),name:'Original template',objective:'Synthetic objective',divisions:[{id:randomUUID(),name:'A',description:'',notes:'',groups:[],exercises:[{id:randomUUID(),exerciseId:ex.id,exerciseVersion:1,technique:'standard' as const,notes:'',sets:[{...newSet(),repetition:{mode:'reps' as const,value:12,perSide:false},restSeconds:60}]}]}]},plan=await createPlan(owner,f,randomUUID())
 p=await mutateProduct(owner,session.token,{...save,id:p.id,version:p.version,operationKey:randomUUID(),fields:{...fields(),format:'workout'}})
 p=await mutateProduct(owner,session.token,{action:'workout_add',id:p.id,version:p.version,planId:plan.id,planVersion:plan.version,operationKey:randomUUID()});await editPlan(owner,plan.id,plan.version,{...f,name:'Changed template'});assert.equal((await productDetail(owner,p.id)).workouts[0].name,'Original template')
 const physical=await mutateProduct(owner,session.token,{...save,operationKey:randomUUID(),fields:{...fields(),kind:'physical',format:'physical'}});await assert.rejects(uploadProductFile(owner,session.token,physical.id,physical.version,randomUUID(),'pdf','fake.pdf',await pdf()))
 const{Pool}=await import('pg'),{readFile}=await import('node:fs/promises'),root=db(),role='product_runtime_'+randomBytes(4).toString('hex'),password=randomBytes(24).toString('hex')
 await root.query(`CREATE ROLE ${role} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`)
 await root.query((await readFile('db/operations/runtime-grants.sql','utf8')).replaceAll(':"runtime_role"','"'+role+'"'))
 const runtimeUrl=new URL(url);runtimeUrl.username=role;runtimeUrl.password=password
 const runtime=new Pool({connectionString:runtimeUrl.toString()}),globalPool=globalThis as unknown as{formfisikPool:import('pg').Pool};globalPool.formfisikPool=runtime
 try{const created=await mutateProduct(owner,session.token,{...save,operationKey:randomUUID()});assert.ok(created.id);assert.equal((await productList(owner,productQuery.parse({}))).total,3);assert.equal((await productDetail(owner,p.id)).workouts[0].version,1);assert.ok((await productFile(owner,cover)).content.length);await assert.rejects(runtime.query("UPDATE professional_product_events SET kind='created'"),{code:'42501'});await assert.rejects(runtime.query('DELETE FROM professional_product_operations'),{code:'42501'})}finally{globalPool.formfisikPool=root;await runtime.end();await root.query('DROP OWNED BY '+role);await root.query('DROP ROLE '+role)}
 await revokeSession(session.token);await assert.rejects(mutateProduct(owner,session.token,{...save,operationKey:randomUUID()}))
 const {requestErasure,processErasure}=await import('../src/server/privacy/erasure');await db().query('UPDATE users SET disabled_at=clock_timestamp() WHERE id=$1',[owner]);const job=await requestErasure({id:randomUUID(),ownerId:owner,subjectId:owner,scope:'professional',approvalReference:randomUUID()});assert.equal((await processErasure(job,null)).state,'completed');assert.equal((await db().query('SELECT count(*)::int n FROM professional_product_files WHERE owner_id=$1',[owner])).rows[0].n,0);assert.equal((await db().query('SELECT count(*)::int n FROM professional_product_events WHERE owner_id=$1',[owner])).rows[0].n,0)
 }finally{await db().end()}
})
