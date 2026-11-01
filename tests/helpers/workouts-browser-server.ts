// Test process only: real PostgreSQL, real opaque sessions, explicit controlled provider.
// Never imported or provisioned by the production application.
import {createServer} from 'node:http'
import {randomUUID,randomBytes} from 'node:crypto'
import Stripe from 'stripe'
import {migrate} from '../../scripts/migrate'
import {db} from '../../src/server/db'
import {createSession,readSession,sessionToken} from '../../src/server/sessions'
import {startCheckout,processBillingEvent} from '../../src/server/subscriptions/service'
import {createStudentHandler} from '../../src/server/students/handlers'
import {createStudent} from '../../src/server/students/repository'
import {documentHandler} from '../../src/server/workout-documents/handlers'
import {createPlan,changePlanState,editPlan} from '../../src/server/workouts/repository'
import {emptyWorkout,newSet,cloneDivisions} from '../../src/modules/workouts/schema'
import {createWorkoutHandler,type WorkoutOperation} from '../../src/server/workouts/handlers'
import {createExerciseHandler,type ExerciseOperation} from '../../src/server/exercises/handlers'
import {importExercises} from '../../scripts/import-exercises'
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
 await importExercises()
 const moderatorSession=await createSession(other)
 await db().query("INSERT INTO exercise_moderators(user_id,reason,provisioning) VALUES($1,'Identidade sintética verificada para teste','operator_verified')",[other])
 const session=await createSession(owner)
 await startCheckout(owner,provider);const completed=provider.complete()
 await processBillingEvent(fixture<Stripe.Event>({id:'evt_'+randomUUID(),livemode:false,type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:completed.session}}),provider)
 const studentA=await createStudent(owner,{fullName:'Aluno Aurora',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const studentB=await createStudent(owner,{fullName:'Aluno Bruno',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 const foreign=await createStudent(other,{fullName:'Confidencial de outro profissional',email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
 let planId:string|undefined
 if(process.env.WORKOUT_DOCUMENTS_FIXTURE==='1'){const exercise=(await db().query("SELECT id,version FROM exercise_entries WHERE scope='official' AND state='published' ORDER BY name LIMIT 1")).rows[0];const division={id:randomUUID(),name:'Treino A',description:'Divisão real de teste',notes:'Observação da divisão',groups:[],exercises:[{id:randomUUID(),exerciseId:exercise.id,exerciseVersion:exercise.version,technique:'standard' as const,notes:'Observação do exercício',sets:Array.from({length:process.env.WORKOUT_DOCUMENTS_DENSE_FIXTURE==='1'?12:1},()=>({...newSet(),repetition:{mode:'reps' as const,value:12,perSide:true},load:20,restSeconds:60}))}]};const fields={...emptyWorkout('individual',studentA.id),name:'Ficha de exportação Aurora',objective:'Objetivo controlado do teste',notes:'Orientações do profissional',divisions:[division,...cloneDivisions([{...division,name:'Treino B'}])]};let p=await createPlan(owner,fields,randomUUID());p=await changePlanState(owner,p.id,1,'active');p=await editPlan(owner,p.id,p.version,{...fields,name:'Ficha atual de exportação Aurora'});planId=p.id}
 const server=createServer(async(incoming,outgoing)=>{
  try{
   const chunks:Buffer[]=[];for await(const chunk of incoming)chunks.push(Buffer.from(chunk))
   const request=new Request(process.env.APP_URL+incoming.url!,{method:incoming.method,headers:incoming.headers as Record<string,string>,body:['GET','HEAD'].includes(incoming.method!)?undefined:Buffer.concat(chunks).toString()})
   const url=new URL(request.url),match=url.pathname.match(/^\/api\/students\/([\w-]+)(?:\/(status|pdf))?$/)
   let response:Response
   if(url.pathname==='/api/auth/session'){const user=await readSession(sessionToken(request.headers.get('cookie')));response=reply(user?{user}:{message:'Sessão inválida.'},user?200:401)}
   else if(url.pathname==='/api/auth/logout')response=await logout(request)
   else if(url.pathname==='/api/professional/dashboard')response=await createDashboardHandler(provider)(request)
   else if(url.pathname==='/api/professional/presentation')response=await documentHandler(incoming.method==='PUT'?'savePresentation':'presentation',provider)(request)
   else if(url.pathname.startsWith('/api/workout-documents/'))response=await documentHandler('read',provider)(request,url.pathname.split('/').pop())
   else if(/^\/api\/workouts\/[^/]+\/documents$/.test(url.pathname))response=await documentHandler('generate',provider)(request,url.pathname.split('/')[3])
   else if(url.pathname.startsWith('/api/workouts')){const parts=url.pathname.slice('/api/workouts'.length).split('/').filter(Boolean);const op:WorkoutOperation=parts[1]==='history'?'history':parts[1]==='status'?'status':parts[1]==='duplicate'?'duplicate':parts[1]==='apply'?'apply':parts[0]?(incoming.method==='PUT'?'edit':'get'):incoming.method==='POST'?'create':'list';response=await createWorkoutHandler(op,provider)(request,parts[0])}
   else if(url.pathname.startsWith('/api/exercises')){
    const path=url.pathname.slice('/api/exercises'.length),parts=path.split('/').filter(Boolean)
    let op:ExerciseOperation='list',id:string|undefined
    if(parts[0]==='moderation'){op=parts[1]==='catalog'?'candidates':parts[1]?(incoming.method==='POST'?'review':'reviewDetail'):'queue';id=parts[1]==='catalog'?undefined:parts[1]}
    else if(parts[0]==='requests'){op=parts[1]?'request':incoming.method==='POST'?'submit':'requests';id=parts[1]}
    else if(parts[0]==='selection')op='selection'
    else if(parts[0]==='capability')op='capability'
    else if(parts[0]){op=parts[1]==='status'?'status':incoming.method==='PATCH'?'edit':'get';id=parts[0]}
    else op=incoming.method==='POST'?'create':'list'
    response=await createExerciseHandler(op,provider)(request,id)
   }
   else if(url.pathname==='/api/students/export')response=await createStudentHandler('export',provider)(request)
   else if(url.pathname==='/api/students')response=await createStudentHandler(incoming.method==='POST'?'create':'list',provider)(request)
   else if(match)response=await createStudentHandler(match[2]==='status'?'status':match[2]==='pdf'?'pdf':incoming.method==='PUT'?'edit':'get',provider)(request,match[1])
   else response=reply({message:'Não encontrado.'},404)
   outgoing.writeHead(response.status,Object.fromEntries(response.headers));outgoing.end(Buffer.from(await response.arrayBuffer()))
  }catch{outgoing.writeHead(503);outgoing.end('{"message":"Indisponível no teste."}')}
 })
 await new Promise<void>(resolve=>server.listen(3111,'127.0.0.1',resolve))
 process.send?.({type:'ready',planId,token:session.token,moderatorToken:moderatorSession.token,foreignId:foreign.id,studentIds:[studentA.id,studentB.id]})
 process.on('SIGTERM',()=>{server.close(()=>{void db().end().then(()=>process.exit(0))})})
}
main().catch(()=>{console.error('students_browser_fixture_unavailable');process.exitCode=1})
