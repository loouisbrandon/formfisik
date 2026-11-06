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
