import {test,after} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {db} from '../src/server/db'
import {createSession,revokeSession,cookieName} from '../src/server/sessions'
import {GET,POST} from '../src/app/api/ecoach/permissions/route'
import {saveSettings,settings} from '../src/server/settings/repository'
const origin='http://localhost:3000'
const connection=process.env.TEST_DATABASE_URL
if(!connection||!new URL(connection).pathname.endsWith('_test'))throw Error('Disposable _test database required')
Object.assign(process.env,{DATABASE_URL:connection,APP_URL:origin,ECOACH_AI_ENABLED:'false',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')})
after(async()=>{await db().end()})
test('eCoach preference isolates owner, rejects CSRF/roles/invalid input and stale writes; notification edits preserve permission',async()=>{
 const owner=randomUUID(),other=randomUUID(),admin=randomUUID(),sessions:Awaited<ReturnType<typeof createSession>>[]=[]
 try{
 for(const [id,role]of [[owner,'professional'],[other,'professional'],[admin,'admin']])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic permission test',$3,now())",[id,id+'@example.test',role])
 for(const id of [owner,other,admin])sessions.push(await createSession(id))
 const req=(method:string,who=0,body?:object,source=origin)=>new Request(origin+'/api/ecoach/permissions',{method,headers:{cookie:cookieName()+'='+sessions[who].token,origin:source,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
 assert.equal((await GET(new Request(origin+'/api/ecoach/permissions'))).status,401)
 assert.equal((await GET(req('GET',2))).status,403)
 const initial=await (await GET(req('GET'))).json();assert.equal(initial.mode,null);assert.equal(initial.version,0);assert.equal(initial.externalConsent,false);assert.equal(initial.runtime.enabled,false)
 assert.equal((await POST(req('POST',0,{mode:'manage',version:0},'https://evil.example'))).status,403)
 assert.equal((await POST(req('POST',0,{mode:'admin',version:0}))).status,400)
 assert.equal((await POST(req('POST',0,{mode:'read',version:0,userId:other}))).status,400)
 const saved=await POST(req('POST',0,{mode:'manage',version:0}));assert.equal(saved.status,200);const data=await saved.json();assert.equal(data.mode,'manage')
 assert.equal((await POST(req('POST',0,{mode:'read',version:0}))).status,409)
 assert.equal((await (await GET(req('GET',1))).json()).mode,null)
 await saveSettings(owner,data.version,{preferences:{agenda:false,checkins:true,contracts:true}})
 assert.equal((await (await GET(req('GET'))).json()).mode,'manage')
 assert.deepEqual((await settings(owner)).preferences,{agenda:false,checkins:true,contracts:true})
 assert.equal((await db().query('SELECT role FROM users WHERE id=$1',[owner])).rows[0].role,'professional')
 await revokeSession(sessions[0].token);assert.equal((await POST(req('POST',0,{mode:'read',version:data.version+1}))).status,401)
 }finally{for(const session of sessions)await revokeSession(session.token);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[owner,other,admin]])}
})
