// Test process only: real PostgreSQL, real opaque sessions, explicit controlled provider.
// Never imported or provisioned by the production application.
import {createServer} from 'node:http'
import {randomUUID,randomBytes} from 'node:crypto'
import Stripe from 'stripe'
import {migrate} from '../../scripts/migrate'
import {db} from '../../src/server/db'
import {createSession,readSession,sessionToken} from '../../src/server/sessions'
import {startCheckout,processBillingEvent} from '../../src/server/subscriptions/service'
import {createWorkoutHandler} from '../../src/server/workouts/handlers'
import sharp from 'sharp'
import {ControlledPhotoStore} from './private-photo-store'
import {createPhotoHandler} from '../../src/server/progress-photos/handlers'
import {createPhotoRecord,uploadPhoto,cleanupPhotoObjects} from '../../src/server/progress-photos/repository'
import {createRecordSchema,uploadSchema} from '../../src/modules/progress-photos/schema'
import {today} from '../../src/modules/assessments/schema'
import {createAssessmentHandler} from '../../src/server/assessments/handlers'
import {createPhysicalAssessment} from '../../src/server/assessments/repository'
import {blankAssessment} from '../../src/modules/assessments/schema'
import {createStudentHandler} from '../../src/server/students/handlers'
import {createStudent} from '../../src/server/students/repository'
import {createDashboardHandler} from '../../src/server/professional-dashboard'
import {reply} from '../../src/server/http'
import {logout} from '../../src/server/auth'
import {ControlledGateway,fixture} from './controlled-billing'
async function main(){
 const connection=process.env.TEST_DATABASE_URL
 if(!connection||!new URL(connection).pathname.endsWith('_test'))throw new Error('Isolated test database required')
 Object.assign(process.env,{DATABASE_URL:connection,APP_URL:'http://localhost:3109',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_not_real',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_not_real',STRIPE_PORTAL_CONFIGURATION_ID:''})
 await migrate(connection);await db().query('TRUNCATE users,billing_events,abuse_limits CASCADE')
 const owner=randomUUID(),provider=new ControlledGateway(),other=randomUUID()
 for(const id of [owner,other])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Profissional de teste','professional',now())",[id,id+'@example.test'])
 const session=await createSession(owner)
 await startCheckout(owner,provider);const completed=provider.complete()
 await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),livemode:false,type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:completed.session}}),provider)
 const foreign=await createStudent(other,{fullName:'Confidencial de outro profissional',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const student=await createStudent(owner,{fullName:'Ana Avaliação controlada',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const empty=await createStudent(owner,{fullName:'Bruno Sem avaliações',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const extensive=await createStudent(owner,{fullName:'Carla Histórico extenso',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 for(let i=0;i<35;i++)await createPhysicalAssessment(owner,extensive.id,{...blankAssessment(),date:new Date(Date.UTC(2024,0,1+i*10)).toISOString().slice(0,10),weight:(80-i*.1).toFixed(2),waist:i%3===0?null:(90-i*.2).toFixed(2),notes:'Registro controlado '+(i+1)},randomUUID())
 const storage=new ControlledPhotoStore();let available=true
 const current=today(),past=new Date(Date.parse(current+'T12:00:00Z')-10*86400000).toISOString().slice(0,10)
 const raw1=await sharp({create:{width:360,height:600,channels:3,background:'#183123'}}).composite([{input:Buffer.from('<svg width="360" height="600"><rect x="70" y="80" width="220" height="440" fill="#96D100"/><text x="100" y="310" font-size="24">TESTE A</text></svg>')}]).png().toBuffer()
 const raw2=await sharp({create:{width:420,height:600,channels:3,background:'#1B1035'}}).composite([{input:Buffer.from('<svg width="420" height="600"><rect x="90" y="60" width="240" height="480" fill="#b8d09a"/><text x="130" y="310" font-size="24">TESTE B</text></svg>')}]).png().toBuffer()
 async function photo(studentId:string,date:string,source:Buffer){const r=await createPhotoRecord(owner,createRecordSchema.parse({studentId,date,notes:'Fotografia sintética controlada, não representa uma pessoa.',creationKey:randomUUID(),authorization:{source:'Referência de autorização sintética para teste isolado',obtainedOn:current,subject:'adult',guardian:'',attested:true}}));return uploadPhoto(owner,r.id,uploadSchema.parse({version:r.version,uploadKey:randomUUID(),position:'front',description:'Imagem sintética de teste',data:source.toString('base64')}),storage)}
 for(let i=0;i<12;i++)await createPhotoRecord(owner,createRecordSchema.parse({studentId:student.id,date:'2024-01-'+String(i+1).padStart(2,'0'),notes:'Registro controlado sem imagem',creationKey:randomUUID(),authorization:{source:'Referência sintética de teste',obtainedOn:current,subject:'adult',guardian:'',attested:true}}))
 const first=await photo(student.id,past,raw1);let latest=await photo(student.id,current,raw2)
 latest=await uploadPhoto(owner,latest.id,uploadSchema.parse({version:latest.version,uploadKey:randomUUID(),position:'front',description:'Segunda imagem da mesma posição',data:raw1.toString('base64')}),storage)
 await createPhysicalAssessment(owner,student.id,{...blankAssessment(),date:current,weight:'80.25',waist:'90.10'},randomUUID())
 await photo(extensive.id,current,raw1)
 const server=createServer(async(incoming,outgoing)=>{
  try{
   const chunks:Buffer[]=[];for await(const chunk of incoming)chunks.push(Buffer.from(chunk))
   const request=new Request(process.env.APP_URL+incoming.url!,{method:incoming.method,headers:incoming.headers as Record<string,string>,body:['GET','HEAD'].includes(incoming.method!)?undefined:Buffer.concat(chunks).toString()})
   const url=new URL(request.url),match=url.pathname.match(/^\/api\/students\/([\w-]+)(?:\/(status|pdf))?$/)
   let response:Response
   if(url.pathname==='/api/auth/session'){const user=await readSession(sessionToken(request.headers.get('cookie')));response=reply(user?{user}:{message:'Sessão inválida.'},user?200:401)}
   else if(url.pathname==='/api/auth/logout')response=await logout(request)
   else if(url.pathname==='/api/professional/dashboard')response=await createDashboardHandler(provider)(request)
   else if(url.pathname==='/__test__/photos-off'){available=false;response=reply({ok:true},200)}
   else if(url.pathname==='/__test__/photos-on'){available=true;response=reply({ok:true},200)}
   else if(url.pathname==='/__test__/cleanup'){response=reply(await cleanupPhotoObjects(storage),200)}
   else if(url.pathname==='/__test__/image'){response=new Response(new Uint8Array(raw1),{headers:{'Content-Type':'image/png'}})}
   else if(url.pathname==='/api/photos/availability')response=await createPhotoHandler('availability',provider,available?storage:null)(request)
   else if(url.pathname==='/api/photos/choices')response=await createPhotoHandler('choices',provider,available?storage:null)(request)
   else if(url.pathname==='/api/progress/calendar')response=await createPhotoHandler('calendar',provider,available?storage:null)(request)
   else if(url.pathname==='/api/photo-records')response=await createPhotoHandler(incoming.method==='POST'?'create':'list',provider,available?storage:null)(request)
   else if(url.pathname.startsWith('/api/photo-records/')){const p=url.pathname.split('/');response=await createPhotoHandler(p[4]==='images'?'upload':p[4]==='remove'?'remove':p[4]==='state'?'state':p[4]==='history'?'history':incoming.method==='PUT'?'edit':'get',provider,available?storage:null)(request,p[3])}
   else if(url.pathname.startsWith('/api/photo-images/'))response=await createPhotoHandler('read',provider,available?storage:null)(request,url.pathname.split('/')[3])
   else if(url.pathname==='/api/assessments')response=await createAssessmentHandler(incoming.method==='POST'?'create':'list',provider)(request)
   else if(url.pathname.startsWith('/api/assessments/')){const parts=url.pathname.split('/');response=await createAssessmentHandler(parts[4]==='status'?'status':parts[4]==='history'?'history':incoming.method==='PUT'?'edit':'get',provider)(request,parts[3])}
   else if(url.pathname==='/api/workouts')response=await createWorkoutHandler('list',provider)(request)
   else if(url.pathname==='/api/students/export')response=await createStudentHandler('export',provider)(request)
   else if(url.pathname==='/api/students')response=await createStudentHandler(incoming.method==='POST'?'create':'list',provider)(request)
   else if(match)response=await createStudentHandler(match[2]==='status'?'status':match[2]==='pdf'?'pdf':incoming.method==='PUT'?'edit':'get',provider)(request,match[1])
   else response=reply({message:'Não encontrado.'},404)
   outgoing.writeHead(response.status,Object.fromEntries(response.headers));outgoing.end(Buffer.from(await response.arrayBuffer()))
  }catch{outgoing.writeHead(503);outgoing.end('{"message":"Indisponível no teste."}')}
 })
 await new Promise<void>(resolve=>server.listen(3111,'127.0.0.1',resolve))
 process.send?.({type:'ready',token:session.token,foreignId:foreign.id,studentId:student.id,emptyId:empty.id,extensiveId:extensive.id,current,past,firstId:first.id,latestId:latest.id})
 process.on('SIGTERM',()=>{server.close(()=>{void db().end().then(()=>process.exit(0))})})
}
main().catch(()=>{console.error('photos_browser_fixture_unavailable');process.exitCode=1})
