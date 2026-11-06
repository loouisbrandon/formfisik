import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { dashboardOverview } from '../src/server/dashboard-overview'
const connection=process.env.TEST_DATABASE_URL
if(!connection||!new URL(connection).pathname.endsWith('_test'))throw Error('Use isolated _test PostgreSQL')
process.env.DATABASE_URL=connection
const owner=randomUUID(),other=randomUUID(),empty=randomUUID(),ids:string[]=[]
before(async()=>{
 await migrate(connection)
 for(const id of [owner,other,empty])await db().query('INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,$3,now())',[id,id+'@example.test','Dashboard synthetic'])
 for(let i=0;i<6;i++){const id=randomUUID(),student=randomUUID();ids.push(id);await db().query('INSERT INTO student_records(id,professional_id,full_name) VALUES($1,$2,$3)',[student,owner,'Owner '+i]);await db().query('INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) VALUES($1,$2,$3,$4,$5)',[id,owner,student,randomUUID(),'a'.repeat(64)])}
 const sid=randomUUID();await db().query('INSERT INTO student_records(id,professional_id,full_name) VALUES($1,$2,$3)',[sid,other,'Foreign name must stay private']);await db().query('INSERT INTO student_links(id,professional_id,student_id,creation_key,creation_digest) VALUES($1,$2,$3,$4,$5)',[randomUUID(),other,sid,randomUUID(),'b'.repeat(64)])
 await db().query("INSERT INTO physical_assessments(id,professional_id,student_link_id,author_id,assessment_date,creation_key,creation_digest) VALUES($1,$2,$3,$2,(now() AT TIME ZONE 'America/Sao_Paulo')::date,$4,$5)",[randomUUID(),owner,ids[0],randomUUID(),'c'.repeat(64)])
})
after(async()=>{for(const id of [owner,other,empty]){await db().query('DELETE FROM physical_assessments WHERE professional_id=$1',[id]);await db().query('DELETE FROM student_links WHERE professional_id=$1',[id]);await db().query('DELETE FROM student_records WHERE professional_id=$1',[id]);await db().query('DELETE FROM agenda_settings WHERE professional_id=$1',[id]);await db().query('DELETE FROM users WHERE id=$1',[id])}await db().end()})
test('overview limits private projections and excludes recently assessed students',async()=>{const o=await dashboardOverview(owner);assert.equal(o.months.length,6);assert.equal(o.months.reduce((n,m)=>n+m.count,0),6);assert.equal(o.attention.length,3);assert.ok(!o.attention.some(a=>a.id===ids[0]));assert.equal(o.recentStudents.length,3);assert.ok(!JSON.stringify(o).includes('Foreign name'));assert.equal(o.receivedCents,'0');assert.equal(o.appointmentTotal,0);assert.deepEqual(o.appointments,[])})
test('empty owner gets actual zeroes and no data from another owner',async()=>{const o=await dashboardOverview(empty);assert.equal(o.months.reduce((n,m)=>n+m.count,0),0);assert.deepEqual(o.attention,[]);assert.deepEqual(o.recentStudents,[]);assert.equal(o.receivedCents,'0')})
test('parallel reads preserve ownership and contain no raw clinical fields',async()=>{const [a,b]=await Promise.all([dashboardOverview(owner),dashboardOverview(other)]);assert.equal(a.months.at(-1)?.count,6);assert.equal(b.months.at(-1)?.count,1);assert.equal(b.attention[0].name,'Foreign name must stay private');for(const o of [a,b])assert.ok(!JSON.stringify(o).includes('weight'));assert.deepEqual(Object.keys(a.attention[0]).sort(),['id','lastAssessment','name'])})
