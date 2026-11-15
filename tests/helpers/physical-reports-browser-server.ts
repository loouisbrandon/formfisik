// Test process only: real PostgreSQL, real opaque sessions, explicit controlled provider.
// Never imported or provisioned by the production application.
import {reportHandler} from '../../src/server/physical-reports/handlers'
import {documentHandler} from '../../src/server/workout-documents/handlers'
import {configureReportTests,reportFixture} from './physical-report-fixture'
import {createServer} from 'node:http'
import {randomUUID} from 'node:crypto'
import {migrate} from '../../scripts/migrate'
import {db} from '../../src/server/db'
import {readSession,sessionToken} from '../../src/server/sessions'
import {createWorkoutHandler} from '../../src/server/workouts/handlers'
import {createPhotoHandler} from '../../src/server/progress-photos/handlers'
import {cleanupPhotoObjects} from '../../src/server/progress-photos/repository'
import {createAssessmentHandler} from '../../src/server/assessments/handlers'
import {createStudentHandler} from '../../src/server/students/handlers'
import {createStudent} from '../../src/server/students/repository'
import {createDashboardHandler} from '../../src/server/professional-dashboard'
import {reply} from '../../src/server/http'
import {logout} from '../../src/server/auth'
async function main(){
 const connection=configureReportTests('http://localhost:3109');await migrate(connection)
 const f=await reportFixture(),{owner,provider,student,empty,foreign}=f,storage=f.store,raw1=f.png;let available=true
 const session={token:f.cookie.split('=')[1]},extensive=student,current='2025-03-01',past='2025-01-01',first=f.photo1,latest=f.photo2
 for(let i=0;i<28;i++)await createStudent(owner,{fullName:'Aluno sintético '+String(i).padStart(2,'0'),email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()})
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
   else if(url.pathname==='/api/professional/presentation')response=await documentHandler(incoming.method==='PUT'?'savePresentation':'presentation',provider)(request)
   else if(url.pathname.match(/^\/api\/students\/[^/]+\/physical-reports/)){const p=url.pathname.split('/');response=await reportHandler(p[5]==='photos'?'photos':incoming.method==='POST'?'generate':'candidates',provider,available?storage:null)(request,p[3])}
   else if(url.pathname.startsWith('/api/physical-reports/'))response=await reportHandler(incoming.method==='DELETE'?'discard':'read',provider,available?storage:null)(request,url.pathname.split('/')[3])
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
