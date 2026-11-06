import {createServer} from 'node:http'
import {randomUUID} from 'node:crypto'
import {configureAgendaTests,agendaFixture,appointment,reserve,db,migrate,today} from './agenda-fixture'
import {addDays} from '../../src/modules/agenda/time'
import {agendaHandler} from '../../src/server/agenda/handlers'
import {consultancyHandler} from '../../src/server/consultancies/handlers'
import {crmHandler} from '../../src/server/crm/handlers'
import {createStudentHandler} from '../../src/server/students/handlers'
import {createStudent} from '../../src/server/students/repository'
import {createDashboardHandler} from '../../src/server/professional-dashboard'
import {readSession,sessionToken} from '../../src/server/sessions'
import {reply} from '../../src/server/http'
import {logout} from '../../src/server/auth'
async function main(){const connection=configureAgendaTests();await migrate(connection);const f=await agendaFixture();for(let i=1;i<23;i++)await createStudent(f.owner,{fullName:'Aluno Agenda '+String(i).padStart(2,'0'),email:'',phone:'',birthDate:'',adminNotes:'',creationKey:randomUUID()});const past=await reserve(f.owner,appointment(f,{date:addDays(today(),-1),time:'14:00',contractId:f.contract.id,deliveryId:f.delivery.id}));const foreign=(await db().query("INSERT INTO agenda_settings(professional_id,weekly) VALUES($1,'[]') ON CONFLICT DO NOTHING",[f.other]),randomUUID());await db().query("INSERT INTO agenda_occurrences(id,professional_id,student_link_id,type_id,kind,title,starts_at,ends_at,occupied_start,occupied_end,timezone,local_date,local_time,fold,mode) SELECT $1,$2,NULL,NULL,'personal','FOREIGN_PRIVATE_NOTES',transaction_timestamp()+interval '1 day',transaction_timestamp()+interval '2 day',transaction_timestamp()+interval '1 day',transaction_timestamp()+interval '2 day','UTC',CURRENT_DATE+1,'00:00','reject','onsite'",[foreign,f.other]);
 if(process.env.TEST_AGENDA_MOVE_FLOW==='1'){
 await reserve(f.owner,appointment(f,{kind:'personal',studentId:null,typeId:null,title:'Compromisso arrastável',date:addDays(today(),2),time:'10:00'}))
 await reserve(f.owner,appointment(f,{kind:'block',studentId:null,typeId:null,title:'Bloqueio arrastável',date:addDays(today(),2),time:'08:00',endDate:addDays(today(),2),endTime:'09:00'}))
 await reserve(f.owner,appointment(f,{date:addDays(today(),2),time:'12:00'}))
 }
 if(process.env.TEST_EMPTY_AVAILABILITY_FLOW==='1')await db().query('UPDATE agenda_settings SET weekly=$2,version=version+1 WHERE professional_id=$1',[f.owner,JSON.stringify(Array.from({length:7},(_,day)=>({day,windows:[]})))])
 const server=createServer(async(req,res)=>{try{const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));const r=new Request(process.env.APP_URL+req.url!,{method:req.method,headers:req.headers as Record<string,string>,body:['GET','HEAD'].includes(req.method!)?undefined:Buffer.concat(chunks)}),url=new URL(r.url);let response:Response
 if(url.pathname==='/api/agenda')response=await agendaHandler(f.provider)(r)
 else if(url.pathname==='/api/consultancies')response=await consultancyHandler(f.provider)(r)
 else if(url.pathname==='/api/crm')response=await crmHandler(f.provider)(r)
 else if(url.pathname==='/api/students')response=await createStudentHandler(req.method==='POST'?'create':'list',f.provider)(r)
 else if(url.pathname==='/api/professional/dashboard')response=await createDashboardHandler(f.provider)(r)
 else if(url.pathname==='/api/auth/session'){const user=await readSession(sessionToken(r.headers.get('cookie')));response=reply(user?{user}:{message:'Entre novamente'},user?200:401)}
 else if(url.pathname==='/api/auth/logout')response=await logout(r)
 else response=reply({message:'Não encontrado'},404)
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch{res.writeHead(503);res.end('{"message":"Fixture indisponível."}')}})
 await new Promise<void>(resolve=>server.listen(3131,'127.0.0.1',resolve));process.send?.({type:'ready',token:f.session.token,student:f.student.id,pastId:past.id,foreignId:foreign,delivery:f.delivery.id});process.on('SIGTERM',()=>server.close(()=>void db().end().then(()=>process.exit(0))))
}
main().catch(e=>{console.error(JSON.stringify({event:'agenda_browser_fixture_unavailable',code:e?.code??'UNKNOWN',location:(e?.stack??'').split('\n')[1]}));process.exitCode=1})
