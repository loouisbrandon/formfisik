import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {decidePrivacyRequest} from '../src/server/admin/privacy-decisions'
import {privacyDecisionInput} from '../src/modules/admin/privacy-decision-schema'
test('privacy decision inputs are strict',()=>{assert.equal(privacyDecisionInput.safeParse({expectedState:'pending',state:'processing',justification:'Justificativa sintética',reference:'case-001',actor_id:randomUUID()}).success,false)})
test('privacy transitions, concurrent decisions, erasure evidence and revocation',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 Object.assign(process.env,{DATABASE_URL:url,APP_URL:'http://localhost:3000',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')})
 const{migrate}=await import('../scripts/migrate');await migrate(url)
 const{db}=await import('../src/server/db'),{createSession,revokeSession}=await import('../src/server/sessions');const admin=randomUUID(),owner=randomUUID(),ids=[randomUUID(),randomUUID()]
 try{
 for(const[id,role]of [[admin,'admin'],[owner,'professional']])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Privacy Decision',$3,now())",[id,id+'@example.test',role])
 for(let i=0;i<2;i++)await db().query('INSERT INTO settings_privacy_requests(id,user_id,kind) VALUES($1,$2,$3)',[ids[i],owner,i?'erasure':'access'])
 const session=await createSession(admin),body={expectedState:'pending',state:'processing',justification:'Análise operacional sintética',reference:'case-001'}
 await assert.rejects(decidePrivacyRequest(admin,session.token,ids[0],{...body,state:'completed',fulfilled:true}),/INVALID_TRANSITION/)
 await decidePrivacyRequest(admin,session.token,ids[0],body)
 const results=await Promise.allSettled(['completed','denied'].map(state=>decidePrivacyRequest(admin,session.token,ids[0],{...body,expectedState:'processing',state,fulfilled:true})))
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1)
 assert.equal((await db().query('SELECT count(*)::int n FROM admin_privacy_decisions WHERE request_id=$1',[ids[0]])).rows[0].n,2)
 await decidePrivacyRequest(admin,session.token,ids[1],body)
 await assert.rejects(decidePrivacyRequest(admin,session.token,ids[1],{...body,expectedState:'processing',state:'completed',fulfilled:true}),/ERASURE_NOT_COMPLETED/)
 await db().query("INSERT INTO privacy_erasure_jobs(id,owner_id,subject_id,scope,approval_reference,state,completed_at) VALUES($1,$2,$2,'professional',$1,'completed',now())",[randomUUID(),owner])
 await decidePrivacyRequest(admin,session.token,ids[1],{...body,expectedState:'processing',state:'completed',fulfilled:true})
 await revokeSession(session.token);await assert.rejects(decidePrivacyRequest(admin,session.token,ids[1],body),/SESSION_REVOKED/)
 }finally{await db().query('DELETE FROM privacy_erasure_jobs WHERE owner_id=$1',[owner]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[admin,owner]]);await db().end()}
})
