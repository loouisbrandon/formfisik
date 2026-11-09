import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes} from 'node:crypto'
import * as repo from '../src/server/exercises/repository'
import {exerciseQuery} from '../src/modules/exercises/schema'
test('admin moderation reuses canonical publication, linking and rejection rules',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 Object.assign(process.env,{DATABASE_URL:url,APP_URL:'http://localhost:3000',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex')})
 const{migrate}=await import('../scripts/migrate');await migrate(url)
 const{db}=await import('../src/server/db'),{createSession,revokeSession}=await import('../src/server/sessions'),admin=randomUUID(),owner=randomUUID()
 const fields={name:'Synthetic Admin Exercise '+randomUUID(),category:'forca' as const,primaryMuscles:['peito' as const],secondaryMuscles:[],equipment:null,level:null,instructions:['Instrução sintética revisada.'],aliases:[]},requests:string[]=[],published:string[]=[]
 try{
 for(const[id,role]of [[admin,'admin'],[owner,'professional']])await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Synthetic Moderator',$3,now())",[id,id+'@example.test',role])
 const session=await createSession(admin),submit=async()=>{const r=await repo.submitRequest(owner,{...fields,creationKey:randomUUID(),publicationPermission:true});requests.push(r.id);return r}
 assert.equal(await repo.canModerate(admin),true);assert.equal(await repo.canModerate(owner),false)
 const first=await submit();await assert.rejects(repo.reviewRequest(admin,first.id,{action:'reject',version:1,reason:'Justificativa sintética'}),/Sessão administrativa/)
 const approved=await repo.reviewRequest(admin,first.id,{action:'approve',version:1,fields,reason:'Revisão técnica sintética',confirmDistinct:false},session.token);assert.equal(approved.state,'approved');published.push(approved.publishedExerciseId!)
 const second=await submit();assert.equal((await repo.reviewRequest(admin,second.id,{action:'link',version:1,exerciseId:published[0],reason:'Vínculo sintético ao oficial'},session.token)).state,'linked_existing')
 const third=await submit(),decisions=await Promise.allSettled([repo.reviewRequest(admin,third.id,{action:'reject',version:1,reason:'Rejeição técnica sintética'},session.token),repo.reviewRequest(admin,third.id,{action:'link',version:1,exerciseId:published[0],reason:'Vínculo técnico sintético'},session.token)]);assert.equal(decisions.filter(r=>r.status==='fulfilled').length,1)
 const fourth=await submit();await assert.rejects(repo.reviewRequest(admin,fourth.id,{action:'approve',version:1,fields,reason:'Nome duplicado sintético',confirmDistinct:false},session.token),/Nome já/)
 const own=await repo.submitRequest(admin,{...fields,creationKey:randomUUID(),publicationPermission:true});requests.push(own.id);await assert.rejects(repo.reviewRequest(admin,own.id,{action:'reject',version:1,reason:'Não permite auto revisão'},session.token),/Outra pessoa/)
 await revokeSession(session.token);await assert.rejects(repo.reviewRequest(admin,fourth.id,{action:'reject',version:1,reason:'Tentativa com sessão revogada'},session.token),/SESSION_REVOKED/)
 assert.equal((await repo.listExercises(owner,exerciseQuery.parse({scope:'official',q:fields.name}))).total,1)
 assert.equal((await db().query('SELECT decided_by FROM exercise_requests WHERE id=$1',[first.id])).rows[0].decided_by,admin)
 }finally{
 await db().query('DELETE FROM exercise_request_events WHERE request_id=ANY($1::uuid[])',[requests]);await db().query('DELETE FROM exercise_requests WHERE id=ANY($1::uuid[])',[requests]);await db().query('DELETE FROM exercise_events WHERE exercise_id=ANY($1::uuid[])',[published]);await db().query('DELETE FROM exercise_versions WHERE exercise_id=ANY($1::uuid[])',[published]);await db().query('DELETE FROM exercise_entries WHERE id=ANY($1::uuid[])',[published]);await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[admin,owner]]);await db().end()}
})
