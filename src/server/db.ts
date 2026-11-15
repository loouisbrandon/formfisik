import 'server-only'
import { Pool } from 'pg'
import { config } from './config'

const globalDb = globalThis as unknown as { formfisikPool?: Pool }
export function db() {
  if (!globalDb.formfisikPool) {
    globalDb.formfisikPool = new Pool({ connectionString: config().databaseUrl, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, statement_timeout: 15000, idle_in_transaction_session_timeout: 20000 })
    globalDb.formfisikPool.on('error', () => console.error('database_connection_error'))
  }
  return globalDb.formfisikPool
}
