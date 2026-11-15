import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import {manageComplimentary,adminComplimentary,complimentaryHandler} from '../src/server/admin/complimentary'
import {complimentaryInput} from '../src/modules/admin/complimentary-schema'
import {complimentaryEnvironment,hasComplimentaryAccess} from '../src/server/subscriptions/complimentary'
test('strict grant input and explicit environment boundary',()=>{
 Object.assign(process.env,{APP_URL:'http://localhost:3000',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')});delete process.env.RAILWAY_ENVIRONMENT_NAME
 assert.equal(complimentaryEnvironment(),'local');process.env.RAILWAY_ENVIRONMENT_NAME='production';assert.equal(complimentaryEnvironment(),null);delete process.env.RAILWAY_ENVIRONMENT_NAME
 assert.equal(complimentaryInput.safeParse({operation:'grant',userId:randomUUID(),expiresAt:null,justification:'Autorização sintética',role:'admin'}).success,false)
})
test('admin grants expire, serialize, audit, revoke sessions and preserve billing',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 Object.assign(process.env,{DATABASE_URL:url,APP_URL:'http://localhost:3000',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')});delete process.env.RAILWAY_ENVIRONMENT_NAME
 const{migrate}=await import('../scripts/migrate');await migrate(url)
 const{db}=await import('../src/server/db'),{createSession,revokeSession,readSession}=await import('../src/server/sessions'),{subscriptionStatus}=await import('../src/server/subscriptions/status');const admin=randomUUID(),owner=randomUUID(),other=randomUUID()
 try{
 for(const[id,role]of[[admin,'admin'],[owner,'professional'],[other,'professional']])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Courtesy',$3,now())",[id,id+'@example.test',role])
 const session=await createSession(admin),target=await createSession(owner),body={operation:'grant',userId:owner,expiresAt:new Date(Date.now()+86400000).toISOString(),justification:'Homologação de cortesia sintética'}
 await assert.rejects(manageComplimentary(owner,target.token,body),/ADMIN_REVOKED/)
 await assert.rejects(manageComplimentary(admin,session.token,{...body,expiresAt:new Date(0).toISOString()}),/FUTURE_EXPIRY_REQUIRED/)
 const race=await Promise.allSettled([manageComplimentary(admin,session.token,body),manageComplimentary(admin,session.token,body)]);assert.equal(race.filter(r=>r.status==='fulfilled').length,1)
 assert.ok(await hasComplimentaryAccess(owner));const view=await subscriptionStatus(owner);assert.equal(view.state,'courtesy');assert.equal(view.accessUntil,body.expiresAt);assert.equal(view.studentLimit,null);assert.deepEqual(view.invoices,[])
 const identity={id:admin,role:'admin',email:'admin@example.test',fullName:'Synthetic Admin'},list=await adminComplimentary(identity,1);assert.equal(list.total,1);const grant=list.items[0].id
 const audit=await adminComplimentary(identity,1,grant);assert.equal(audit.events[0].actor,'Synthetic Courtesy');assert.equal(audit.events[0].justification,body.justification)
 const {Pool}=await import('pg'),{readFile}=await import('node:fs/promises'),root=db(),role='courtesy_runtime_'+randomBytes(4).toString('hex'),password=randomBytes(24).toString('hex')
 await root.query(`CREATE ROLE ${role} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`)
 await root.query((await readFile('db/operations/runtime-grants.sql','utf8')).replaceAll(':"runtime_role"','"'+role+'"'))
 const runtimeUrl=new URL(url);runtimeUrl.username=role;runtimeUrl.password=password
 const runtime=new Pool({connectionString:runtimeUrl.toString()}),globalPool=globalThis as unknown as {formfisikPool:import('pg').Pool};globalPool.formfisikPool=runtime
 try{const granted=await manageComplimentary(admin,session.token,{...body,userId:other,expiresAt:null});assert.ok(await hasComplimentaryAccess(other));await manageComplimentary(admin,session.token,{operation:'revoke',userId:other,grantId:granted.id,justification:body.justification});assert.equal(await hasComplimentaryAccess(other),false)}finally{globalPool.formfisikPool=root;await runtime.end();await root.query('DROP OWNED BY '+role);await root.query('DROP ROLE '+role)}
 await db().query("UPDATE complimentary_access_grants SET granted_at=now()-interval '2 days',expires_at=now()-interval '1 second' WHERE id=$1",[grant]);assert.equal(await hasComplimentaryAccess(owner),false)
 const next=await manageComplimentary(admin,session.token,{...body,expiresAt:null});assert.ok(await hasComplimentaryAccess(owner))
 await manageComplimentary(admin,session.token,{operation:'revoke',userId:owner,grantId:next.id,justification:body.justification});assert.equal(await hasComplimentaryAccess(owner),false);assert.equal(await readSession(target.token),null)
 await assert.rejects(manageComplimentary(admin,session.token,{operation:'revoke',userId:other,grantId:next.id,justification:body.justification}),/STALE_GRANT/)
 const account=randomUUID();await db().query('INSERT INTO billing_accounts(id,user_id) VALUES($1,$2)',[account,other]);await db().query("INSERT INTO billing_checkouts(id,account_id,price_id,product_id,app_origin,expires_at) VALUES($1,$2,'price_test','prod_test','http://localhost:3000',now()+interval '1 hour')",[randomUUID(),account]);await assert.rejects(manageComplimentary(admin,session.token,{...body,userId:other}),/BILLING_EXISTS/)
 await db().query('UPDATE users SET disabled_at=now() WHERE id=$1',[owner]);await assert.rejects(manageComplimentary(admin,session.token,body),/ACCOUNT_UNAVAILABLE/)
 await revokeSession(session.token);await assert.rejects(manageComplimentary(admin,session.token,body),/SESSION_REVOKED/)
 process.env.RAILWAY_ENVIRONMENT_NAME='production';await assert.rejects(manageComplimentary(admin,session.token,body),/ENVIRONMENT_DISABLED/);assert.equal(await hasComplimentaryAccess(owner),false)
 assert.equal((await complimentaryHandler(new Request('http://localhost:3000/api/admin/cortesias',{method:'POST',headers:{origin:'https://attacker.invalid'}}))).status,403)
 assert.equal((await db().query('SELECT count(*)::int n FROM billing_invoices')).rows[0].n,0)
 }finally{delete process.env.RAILWAY_ENVIRONMENT_NAME;await db().query('DELETE FROM complimentary_access_events WHERE grant_id IN(SELECT id FROM complimentary_access_grants WHERE user_id=ANY($1::uuid[]))',[[owner,other]]);await db().query('DELETE FROM complimentary_access_grants WHERE user_id=ANY($1::uuid[])',[[owner,other]]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[admin,owner,other]]);await db().end()}
})
