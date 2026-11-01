import 'server-only'
import type { PoolClient } from 'pg'
import { db } from '../db'

export type Account = { id: string; user_id: string; stripe_customer_id: string | null; trial_used_at: Date | null; created_at: Date }
export type Attempt = { id: string; account_id: string; stripe_session_id: string | null; state: string; price_id: string; product_id: string; app_origin: string; expires_at: Date }
export async function locked<T>(userId: string, work: (client: PoolClient) => Promise<T>) {
  const client = await db().connect()
  let locked = false
  try {
    await client.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [`billing:${userId}`])
    locked = true
    return await work(client)
  } finally {
    let discard = false
    try { if (locked) await client.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [`billing:${userId}`]) }
    catch { discard = true }
    finally { client.release(discard) }
  }
}
export async function transaction<T>(client: PoolClient, work: () => Promise<T>) {
  await client.query('BEGIN')
  try { const result = await work(); await client.query('COMMIT'); return result }
  catch (error) { await client.query('ROLLBACK'); throw error }
}
