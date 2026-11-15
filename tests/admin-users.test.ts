import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {adminUsers,adminUserDetail} from '../src/server/admin/users'
import {adminUsersQuery,usersHref} from '../src/modules/admin/users-schema'
const actor={id:randomUUID(),role:'admin',fullName:'Synthetic Admin',email:'synthetic@example.test'}
test('admin users query validates boundaries and fails closed before database access',async()=>{
 for(const role of ['professional','student','', 'ADMIN']){
  await assert.rejects(adminUsers({...actor,role},{}),/ADMIN_ACCESS_DENIED/)
  await assert.rejects(adminUserDetail({...actor,role},randomUUID()),/ADMIN_ACCESS_DENIED/)
 }
 for(const input of [{page:0},{page:10001},{role:'owner'},{state:'approved'},{sort:'created_at; DROP TABLE users'},{q:'x'.repeat(121)},{unknown:'x'},{view:'all'}])assert.equal(adminUsersQuery.safeParse(input).success,false)
 const q=adminUsersQuery.parse({q:'Synthetic',role:'professional',page:2,view:'cards'})
 const url=new URL(usersHref(q),'http://localhost')
 assert.equal(url.searchParams.get('page'),'2');assert.equal(url.searchParams.get('view'),'cards');assert.equal(url.searchParams.get('q'),'Synthetic')
 assert.equal(await adminUserDetail(actor,'bad-uuid'),null)
})
test('admin user directory is paginated, minimally projected and filterable',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const url=process.env.TEST_DATABASE_URL!;if(!new URL(url).pathname.endsWith('_test'))throw Error('DISPOSABLE_DATABASE_REQUIRED')
 process.env.DATABASE_URL=url
 const {migrate}=await import('../scripts/migrate');await migrate(url)
 const {db}=await import('../src/server/db'),ids:string[]=[],prefix=randomUUID().slice(0,8)
 try{
  for(let i=0;i<26;i++){
   const id=randomUUID();ids.push(id)
   await db().query("INSERT INTO users(id,email,full_name,role,email_verified_at,disabled_at,created_at) VALUES($1,$2,$3,$4,now(),$5,now()-$6*interval '1 day')",[id,id+'@example.test',prefix+(i===25?'%_literal':' User '+String(i).padStart(2,'0')),i===0?'admin':i===1?'student':'professional',i===2?new Date():null,i])
  }
  const first=await adminUsers(actor,{q:prefix,sort:'newest'})
  assert.equal(first.total,26);assert.equal(first.items.length,20);assert.equal(first.pages,2)
  const second=await adminUsers(actor,{q:prefix,sort:'newest',page:2})
  assert.equal(second.items.length,6);assert.ok(second.items.every(item=>!first.items.some(row=>row.id===item.id)))
  assert.deepEqual(Object.keys(first.items[0]).sort(),['createdAt','disabled','fullName','id','role'])
  assert.equal(first.items[0].id,ids[0])
  assert.equal((await adminUsers(actor,{q:prefix,sort:'oldest'})).items[0].id,ids[25])
  assert.equal((await adminUsers(actor,{q:prefix,role:'professional'})).total,24)
  assert.equal((await adminUsers(actor,{q:prefix,role:'student'})).total,1)
  assert.equal((await adminUsers(actor,{q:prefix,state:'disabled'})).total,1)
  assert.equal((await adminUsers(actor,{q:prefix,state:'enabled'})).total,25)
  assert.equal((await adminUsers(actor,{q:prefix+'%_'})).total,1)
  assert.equal((await adminUsers(actor,{q:prefix,page:10000})).items.length,0)
  assert.equal((await adminUsers(actor,{q:"' OR 1=1 --"})).total,0)
  const detail=await adminUserDetail(actor,ids[2]);assert.ok(detail);assert.equal(detail.disabled,true)
  assert.equal(detail.email,ids[2]+'@example.test')
  assert.deepEqual(Object.keys(detail).sort(),['closureAt','createdAt','disabled','disabledAt','email','emailVerifiedAt','fullName','id','role'])
  assert.equal(await adminUserDetail(actor,randomUUID()),null)
  assert.ok(first.summary.total>=26)
 }finally{await db().query('DELETE FROM users WHERE id=ANY($1::uuid[])',[ids]);await db().end()}
})
