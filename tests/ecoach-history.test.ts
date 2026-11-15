import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {configureAgendaTests,migrate,db} from './helpers/agenda-fixture'
import {createSession,cookieName,revokeSession} from '../src/server/sessions'
import {historyHandler} from '../src/server/ecoach/history'
const origin='http://localhost:3000',connection=configureAgendaTests(origin)
process.env.ECOACH_AI_ENABLED='false'
after(async()=>{await db().end()})
test('private history: persistence, concurrent retries, version conflicts, context ownership, pagination and cascade deletion',async()=>{
 await migrate(connection)
 const owner=randomUUID(),other=randomUUID(),sessions:Awaited<ReturnType<typeof createSession>>[]=[]
 try{
 for(const id of [owner,other]){await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic history','professional',now())",[id,id+'@example.test']);await db().query("INSERT INTO complimentary_access_grants(id,user_id,environment,reason,authorization_reference) VALUES($1,$2,'local','owner_authorized_test',$3)",[randomUUID(),id,randomUUID()]);sessions.push(await createSession(id))}
 const req=(query='',body?:object,who=0,source=origin)=>new Request(origin+'/api/ecoach/conversations'+query,{method:body?'POST':'GET',headers:{origin:source,cookie:cookieName()+'='+sessions[who].token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
 assert.equal((await historyHandler(new Request(origin+'/api/ecoach/conversations'))).status,401)
 const id=randomUUID(),command={action:'turn',id,version:0,operationId:randomUUID(),text:'Meu resumo financeiro',context:{module:'Financeiro',period:{from:'2026-11-01',to:'2026-11-30'},filters:[{label:'Situação',value:'open'}]}}
 assert.equal((await historyHandler(req('',command,0,'https://evil.example'))).status,403)
 assert.equal((await historyHandler(req('',{...command,assistant:'spoofed'}))).status,400)
 const results=await Promise.all([historyHandler(req('',command)),historyHandler(req('',command))]);for(const r of results)assert.equal(r.status,200)
 let data=(await results[0].json()).conversation;assert.equal(data.turns.length,1);assert.equal(data.turns[0].text,command.text);assert.match(data.turns[0].answer,/Nenhum valor financeiro real/)
 assert.deepEqual(data.turns[0].context,command.context)
 assert.equal((await historyHandler(req('?id='+id,undefined,1))).status,404)
 assert.equal((await historyHandler(req('',{action:'rename',id,version:data.version,title:'Foreign'},1))).status,404)
 assert.equal((await historyHandler(req('',{action:'delete',id,version:data.version},1))).status,404)
 assert.equal((await historyHandler(req('',{...command,operationId:randomUUID(),version:0}))).status,409)
 assert.equal((await historyHandler(req('',{...command,operationId:randomUUID(),version:data.version,context:{module:'Alunos',record:{kind:'student',id:randomUUID()}}}))).status,404)
 const renamed=await historyHandler(req('',{action:'rename',id,version:data.version,title:'Planejamento'}));assert.equal(renamed.status,200);data=(await renamed.json()).conversation;assert.equal(data.title,'Planejamento')
 const next=await historyHandler(req('',{...command,version:data.version,operationId:randomUUID(),text:'Sem contexto',context:null}));assert.equal(next.status,200);data=(await next.json()).conversation;assert.equal(data.turns[1].context,null)
 for(let i=0;i<21;i++)await db().query("INSERT INTO ecoach_conversations(id,owner_id,title) VALUES($1,$2,'Other conversation')",[randomUUID(),owner])
 const first=await(await historyHandler(req('?page=1'))).json(),second=await(await historyHandler(req('?page=2'))).json();assert.equal(first.items.length,20);assert.equal(second.items.length,2);assert.equal(first.total,22);assert.equal('turns' in first.items[0],false)
 assert.equal((await historyHandler(req('',{action:'delete',id,version:data.version}))).status,200)
 assert.equal((await db().query('SELECT count(*)::integer AS total FROM ecoach_turns WHERE conversation_id=$1',[id])).rows[0].total,0)
 assert.equal((await historyHandler(req('',command))).status,404)
 await revokeSession(sessions[0].token);assert.equal((await historyHandler(req('?page=1'))).status,401)
 }finally{for(const session of sessions)await revokeSession(session.token);await db().query('DELETE FROM complimentary_access_events WHERE grant_id IN(SELECT id FROM complimentary_access_grants WHERE user_id=ANY($1::uuid[]))',[[owner,other]]);await db().query('DELETE FROM complimentary_access_grants WHERE user_id=ANY($1::uuid[])',[[owner,other]]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[owner,other]])}
})
