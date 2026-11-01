import { loadEnvConfig } from '@next/env'
import { db } from '../src/server/db'
import { stripeSettings } from '../src/server/subscriptions/stripe'
import { reconcileUser } from '../src/server/subscriptions/service'
loadEnvConfig(process.cwd())
async function main() {
  let connected=false
  try {
    stripeSettings() // Reject absent/live/non-local configuration before reading or modifying billing data.
    const pool=db(); connected=true
    const users=await pool.query('SELECT user_id FROM billing_accounts WHERE stripe_customer_id IS NOT NULL ORDER BY created_at')
    let failed=0
    for (const row of users.rows) {
      try { await reconcileUser(row.user_id) }
      catch { failed++; console.error('billing_reconciliation_failed') }
    }
    console.info(`Reconciliação: ${users.rowCount! - failed} concluídas; ${failed} falhas.`)
    if (failed) process.exitCode=1
  } catch { console.error('billing_reconciliation_unavailable'); process.exitCode=1 }
  finally { if (connected) await db().end() }
}
void main()
