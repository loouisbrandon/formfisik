import assert from 'node:assert/strict'
import {test} from 'node:test'
import {randomBytes} from 'node:crypto'
import {createStripeWebhookHandler} from '../src/server/subscriptions/handlers'
Object.assign(process.env,{DATABASE_URL:process.env.TEST_DATABASE_URL,APP_URL:'http://localhost:3107',ABUSE_HMAC_SECRET:randomBytes(32).toString('hex'),STRIPE_SECRET_KEY:'sk_test_controlled_not_real',STRIPE_PRICE_ID:'price_fixture',STRIPE_PRODUCT_ID:'prod_fixture',STRIPE_WEBHOOK_SECRET:'whsec_not_real'})
test('016: raw webhook body has a total deadline and cancels slow input before signature parsing',async()=>{
 let cancelled=false,timer:ReturnType<typeof setTimeout>
 const stream=new ReadableStream<Uint8Array>({start(c){timer=setTimeout(()=>c.close(),150)},cancel(){cancelled=true;clearTimeout(timer)}})
 const request=new Request('http://localhost:3107/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':'invalid-controlled-signature'},body:stream,duplex:'half'} as RequestInit)
 const handler=createStripeWebhookHandler(undefined,20)
 assert.equal((await handler(request)).status,400);assert.equal(cancelled,true)
})

test('migration CLI rejects implicit fallback to another database when TEST_DATABASE_URL is present',async()=>{
 const {spawnSync}=await import('node:child_process')
 const result=spawnSync(process.execPath,['--import','tsx','scripts/migrate.ts'],{env:{...process.env,TEST_DATABASE_URL:'postgresql://synthetic:synthetic@127.0.0.1:1/isolated_test',DATABASE_URL:'postgresql://synthetic:synthetic@127.0.0.1:1/other_test'},encoding:'utf8'})
 assert.equal(result.status,1);assert.match(result.stderr,/MIGRATION_TARGET_MISMATCH/)
 assert.ok(!result.stderr.includes('synthetic@'))
})
