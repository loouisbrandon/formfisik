import {test,before,after,beforeEach} from 'node:test'
import assert from 'node:assert/strict'
import {randomBytes,randomUUID} from 'node:crypto'
import {generateKeyPair,exportJWK,SignJWT} from 'jose'
import {migrate} from '../scripts/migrate'
import {db} from '../src/server/db'
import {serviceCheck} from '../src/server/core/service-auth'

const connection=process.env.TEST_DATABASE_URL
if(!connection||!['localhost','127.0.0.1'].includes(new URL(connection).hostname)||!new URL(connection).pathname.endsWith('_test'))throw Error('Explicit isolated local test database required')
process.env.DATABASE_URL=connection
process.env.APP_URL='http://localhost:3107'
process.env.ABUSE_HMAC_SECRET=randomBytes(32).toString('hex')
process.env.CORE_SERVICE_ENVIRONMENT='local'
process.env.CORE_SERVICE_AUDIENCE='urn:formfisik:core:local'
let keys:Awaited<ReturnType<typeof generateKeyPair>>
let configuration:string
before(async()=>{
 await migrate(connection)
 keys=await generateKeyPair('ES256',{extractable:true})
 configuration=JSON.stringify([{issuer:'formfisik-mobile-api',environment:'local',scopes:['core:service-check'],keys:[{kid:'local-1',publicJwk:await exportJWK(keys.publicKey),revoked:false}]}])
})
beforeEach(async()=>{process.env.CORE_SERVICE_CLIENTS_JSON=configuration;await db().query('TRUNCATE core_service_assertions,abuse_limits')})
after(async()=>{await db().end()})
async function assertion(overrides:Record<string,unknown>={},header:Record<string,unknown>={}){
 const now=Math.floor(Date.now()/1000)
 return new SignJWT({iss:'formfisik-mobile-api',sub:'formfisik-mobile-api',aud:'urn:formfisik:core:local',environment:'local',scope:'core:service-check',iat:now,exp:now+60,jti:randomUUID(),...overrides}).setProtectedHeader({alg:'ES256',typ:'JWT',kid:'local-1',...header}).sign(keys.privateKey)
}
const call=(token?:string,url='http://localhost:3107/api/core/v1/service-check')=>serviceCheck(new Request(url,{headers:token?{authorization:`Bearer ${token}`}:{}}))
test('AUTH-01 valid signed service, no user identity/cookie and no-store',async()=>{
 const response=await call(await assertion());assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true,contractVersion:'1'});assert.equal(response.headers.get('set-cookie'),null);assert.match(response.headers.get('cache-control')!,/no-store/);assert.ok(response.headers.get('x-request-id'))
 assert.equal((await db().query('SELECT count(*)::int n FROM core_service_assertions')).rows[0].n,1)
})
test('missing, malformed, forged, expired, wrong audience/issuer/environment/subject, lifetime and key rejected',async()=>{
 assert.equal((await call()).status,401);assert.equal((await call('invalid')).status,401)
 const valid=await assertion();const [h,p,s]=valid.split('.');assert.equal((await call(`${h}.${p}.${(s[0]==='a'?'b':'a')+s.slice(1)}`)).status,401)
 for(const overrides of [{exp:Math.floor(Date.now()/1000)-10},{aud:'urn:formfisik:core:production'},{iss:'other-service'},{sub:'other-service'},{environment:'production'},{exp:Math.floor(Date.now()/1000)+120},{iat:Math.floor(Date.now()/1000)+30},{aud:['urn:formfisik:core:local']},{jti:'not-uuid'},{scope:'core:users'}]){
  const response=await call(await assertion(overrides));assert.equal(response.status,overrides.scope?403:401)
 }
 assert.equal((await call(await assertion({},{kid:'unknown'}))).status,401)
 assert.equal((await call(await assertion({},{typ:'at+jwt'}))).status,401)
 assert.equal((await db().query('SELECT count(*)::int n FROM core_service_assertions')).rows[0].n,0)
})
test('revocation, rotation and configured scope authorization',async()=>{
 const config=JSON.parse(configuration);config[0].keys[0].revoked=true;process.env.CORE_SERVICE_CLIENTS_JSON=JSON.stringify(config);assert.equal((await call(await assertion())).status,401)
 config[0].keys.push({...config[0].keys[0],kid:'local-2',revoked:false});process.env.CORE_SERVICE_CLIENTS_JSON=JSON.stringify(config);assert.equal((await call(await assertion({},{kid:'local-2'}))).status,200)
 config[0].scopes=[];process.env.CORE_SERVICE_CLIENTS_JSON=JSON.stringify(config);assert.equal((await call(await assertion({},{kid:'local-2'}))).status,403)
})
test('replay is atomic under concurrent calls and across key rotation',async()=>{
 const jti=randomUUID(),token=await assertion({jti});const responses=await Promise.all(Array.from({length:8},()=>call(token)));assert.equal(responses.filter(r=>r.status===200).length,1);assert.equal(responses.filter(r=>r.status===401).length,7)
 assert.equal((await call(await assertion({jti}))).status,401)
})
test('configuration fails closed, private JWK prohibited and query rejected',async()=>{
 process.env.CORE_SERVICE_CLIENTS_JSON='invalid';assert.equal((await call(await assertion())).status,503)
 const config=JSON.parse(configuration);config[0].keys[0].publicJwk=await exportJWK(keys.privateKey);process.env.CORE_SERVICE_CLIENTS_JSON=JSON.stringify(config);assert.equal((await call(await assertion())).status,503)
 process.env.CORE_SERVICE_CLIENTS_JSON=configuration;assert.equal((await call(await assertion(),'http://localhost:3107/api/core/v1/service-check?userId=x')).status,400)
})
test('production process rejects local and staging trust configurations',async()=>{
 const previous=process.env.NODE_ENV
 try {
  Object.assign(process.env,{NODE_ENV:'production'})
  assert.equal((await call(await assertion())).status,503)
  process.env.CORE_SERVICE_ENVIRONMENT='staging';process.env.CORE_SERVICE_AUDIENCE='urn:formfisik:core:staging'
  assert.equal((await call(await assertion())).status,503)
 }finally{if(previous===undefined)Reflect.deleteProperty(process.env,'NODE_ENV');else Object.assign(process.env,{NODE_ENV:previous});process.env.CORE_SERVICE_ENVIRONMENT='local';process.env.CORE_SERVICE_AUDIENCE='urn:formfisik:core:local'}
})
test('only UUID correlation is reflected, no arbitrary header text',async()=>{
 const correlation=randomUUID()
 for(const value of [correlation,'untrusted-text']){
  const response=await serviceCheck(new Request('http://localhost:3107/api/core/v1/service-check',{headers:{authorization:`Bearer ${await assertion()}`,'x-correlation-id':value}}))
  assert.equal(response.status,200)
  assert.equal(response.headers.get('x-correlation-id'),value===correlation?correlation:null)
 }
})
test('database failure never produces technical success or sensitive error',async()=>{
 await db().query('ALTER TABLE core_service_assertions RENAME TO core_service_assertions_unavailable')
 try{const token=await assertion(),response=await call(token),body=JSON.stringify(await response.json());assert.equal(response.status,503);assert.ok(!body.includes(token));assert.ok(!body.includes('relation'));assert.ok(!body.includes('formfisik-mobile-api'))}
 finally{await db().query('ALTER TABLE core_service_assertions_unavailable RENAME TO core_service_assertions')}
})
