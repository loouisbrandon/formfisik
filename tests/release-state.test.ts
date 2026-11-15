import {test} from 'node:test'
import assert from 'node:assert/strict'
import {NextRequest} from 'next/server'
import {proxy} from '../src/proxy'
import {releaseClosed} from '../src/server/release-state'
test('production release is closed by default and requires explicit open state',()=>{
 for(const state of [undefined,'','closed','OPEN','true','test'])assert.equal(releaseClosed('production',state),true)
 assert.equal(releaseClosed('production','open'),false)
 for(const environment of ['staging','development',undefined])assert.equal(releaseClosed(environment,'closed'),false)
})
test('closed production denies pages and mutation APIs regardless of client claims; health only GET/HEAD',()=>{
 const oldEnvironment=process.env.RAILWAY_ENVIRONMENT_NAME,oldState=process.env.PRODUCTION_RELEASE_STATE
 try{process.env.RAILWAY_ENVIRONMENT_NAME='production';delete process.env.PRODUCTION_RELEASE_STATE
 for(const path of ['/','/cadastro','/admin','/ecoach','/api/auth/login','/api/register','/api/subscriptions/checkout','/api/stripe/webhook','/api/health/extra'])for(const method of ['GET','POST']){
  const r=proxy(new NextRequest('https://formfisik.com.br'+path,{method,headers:{'x-production-release-state':'open','x-nonce':'forged'}}));assert.equal(r.status,503);assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.equal(r.headers.get('Retry-After'),'300')
 }
 for(const method of ['GET','HEAD'])assert.equal(proxy(new NextRequest('https://formfisik.com.br/api/health',{method})).status,200)
 assert.equal(proxy(new NextRequest('https://formfisik.com.br/api/health',{method:'POST'})).status,503)
 process.env.PRODUCTION_RELEASE_STATE='open';assert.equal(proxy(new NextRequest('https://formfisik.com.br/login')).status,200)
 }finally{if(oldEnvironment===undefined)delete process.env.RAILWAY_ENVIRONMENT_NAME;else process.env.RAILWAY_ENVIRONMENT_NAME=oldEnvironment;if(oldState===undefined)delete process.env.PRODUCTION_RELEASE_STATE;else process.env.PRODUCTION_RELEASE_STATE=oldState}
})
