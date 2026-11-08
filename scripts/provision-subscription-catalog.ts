/** Explicit operator task: read-only by default; --apply creates only missing TEST catalog objects via Stripe CLI. */
import { loadEnvConfig } from '@next/env'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import Stripe from 'stripe'
import { subscriptionPlans, planAmount, type BillingInterval } from '../src/modules/subscriptions/plan'
loadEnvConfig(process.cwd())
async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key?.startsWith('sk_test_') || !['http://localhost:3000','http://127.0.0.1:3000'].includes(process.env.APP_URL ?? '')) throw Error('LOCAL_TEST_CONFIGURATION_REQUIRED')
  const api = new Stripe(key, { timeout: 10000, maxNetworkRetries: 1 })
  const apply = process.argv.includes('--apply')
  const products = await api.products.list({ limit: 100 }).autoPagingToArray({ limit: 1000 })
  const prices = await api.prices.list({ limit: 100 }).autoPagingToArray({ limit: 1000 })
  if (products.some(p => p.livemode) || prices.some(p => p.livemode)) throw Error('TEST_MODE_REQUIRED')
  const cli = (args: string[], idempotency: string) => JSON.parse(execFileSync('stripe', [...args, '--confirm', '--idempotency', idempotency], { env: { ...process.env, STRIPE_API_KEY: key }, stdio: ['ignore','pipe','pipe'], maxBuffer: 1048576 }).toString())
  const values: Record<string,string> = {}
  for (const plan of Object.values(subscriptionPlans)) {
    const matching = products.filter(p => p.metadata.formfisik_plan === plan.id || p.name === plan.name)
    if (matching.length > 1) throw Error('DUPLICATE_PRODUCT_REQUIRES_REVIEW')
    let product = matching[0]
    if (plan.id === 'pro' && product?.id !== process.env.STRIPE_PRODUCT_ID) throw Error('EXISTING_PRO_PRODUCT_MISMATCH')
    if (!product) {
      if (!apply) { console.log(plan.id, 'PRODUCT_MISSING'); continue }
      product = cli(['products','create','--name',plan.name,'-d',`metadata[formfisik_plan]=${plan.id}`], `ff_catalog_product_${plan.id}_v1`) as Stripe.Product
    }
    if (!product.active || product.livemode) throw Error('INVALID_PRODUCT')
    values[`STRIPE_PRODUCT_${plan.id.toUpperCase()}`] = product.id
    for (const interval of ['month','year'] as BillingInterval[]) {
      const lookup = `formfisik_${plan.id}_${interval === 'year' ? 'annual' : 'monthly'}`
      const found = prices.filter(p => p.lookup_key === lookup)
      if (found.length > 1) throw Error('DUPLICATE_PRICE_REQUIRES_REVIEW')
      let price = found[0]
      if (!price) {
        const equivalent = prices.filter(p => p.active && p.product === product.id && p.currency === 'brl' && p.unit_amount === planAmount({ plan: plan.id, interval }) && p.recurring?.interval === interval && p.recurring.interval_count === 1)
        if (equivalent.length > 1) throw Error('MULTIPLE_EQUIVALENT_PRICES')
        price = equivalent[0]
      }
      if (!price) {
        if (!apply) { console.log(plan.id, interval, 'PRICE_MISSING'); continue }
        price = cli(['prices','create','--product',product.id,'--currency','brl','--unit-amount',String(planAmount({ plan: plan.id, interval })),'-d',`recurring[interval]=${interval}`,'--lookup-key',lookup], `ff_catalog_price_${lookup}_v1`) as Stripe.Price
      }
      if (price.livemode || !price.active || price.product !== product.id || price.unit_amount !== planAmount({ plan: plan.id, interval }) || price.currency !== 'brl' || price.recurring?.interval !== interval || price.recurring.interval_count !== 1 || price.recurring.usage_type !== 'licensed') throw Error('CATALOG_PRICE_MISMATCH')
      values[`STRIPE_PRICE_${plan.id.toUpperCase()}_${interval === 'year' ? 'ANNUAL' : 'MONTHLY'}`] = price.id
      console.log(plan.id, interval, price.id, price.unit_amount, 'brl', 'TEST_VERIFIED')
    }
  }
  if (apply) {
    let env = await readFile('.env.local','utf8')
    for (const [name,value] of Object.entries(values)) {
      const line = new RegExp(`^${name}=.*$`,'m')
      env = line.test(env) ? env.replace(line,`${name}=${value}`) : `${env}\n${name}=${value}\n`
    }
    await writeFile('.env.local', env, { mode: 0o600 })
    console.log('LOCAL_CATALOG_IDS_CONFIGURED; webhook and portal secrets preserved')
  }
}
main().catch(() => { console.error('CATALOG_PROVISIONING_FAILED; no credentials or provider payloads logged. Review test configuration before retry.'); process.exitCode = 1 })
