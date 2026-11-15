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
 const server=createServer(async(incoming,outgoing)=>{
  try{
   const chunks:Buffer[]=[];for await(const chunk of incoming)chunks.push(Buffer.from(chunk))
   const request=new Request(process.env.APP_URL+incoming.url!,{method:incoming.method,headers:incoming.headers as Record<string,string>,body:['GET','HEAD'].includes(incoming.method!)?undefined:Buffer.concat(chunks).toString()})
   const url=new URL(request.url),match=url.pathname.match(/^\/api\/students\/([\w-]+)(?:\/(status|pdf))?$/)
   let response:Response
   if(url.pathname==='/api/auth/session'){const user=await readSession(sessionToken(request.headers.get('cookie')));response=reply(user?{user}:{message:'Sessão inválida.'},user?200:401)}
   else if(url.pathname==='/api/auth/logout')response=await logout(request)
   else if(url.pathname==='/api/professional/dashboard')response=await createDashboardHandler(provider)(request)
   else if(url.pathname==='/api/assessments/portfolio')response=await createAssessmentHandler('portfolio',provider)(request)
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
 process.send?.({type:'ready',token:session.token,foreignId:foreign.id,studentId:student.id,emptyId:empty.id,extensiveId:extensive.id})
 process.on('SIGTERM',()=>{server.close(()=>{void db().end().then(()=>process.exit(0))})})
}
main().catch(()=>{console.error('students_browser_fixture_unavailable');process.exitCode=1})
