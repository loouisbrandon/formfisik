import { loadEnvConfig } from '@next/env'
import { Pool } from 'pg'
loadEnvConfig(process.cwd())
async function main() {
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  if (!process.env.DATABASE_URL) throw new Error('Missing connection')
  await pool.query('DELETE FROM pending_registrations WHERE expires_at < now()')
  await pool.query('DELETE FROM password_resets WHERE expires_at < now()')
  await pool.query('DELETE FROM abuse_limits WHERE expires_at < now()')
  await pool.query("DELETE FROM sessions WHERE expires_at < now() OR revoked_at IS NOT NULL OR last_seen_at < now()-interval '30 minutes'")
  await pool.query('DELETE FROM workout_documents WHERE expires_at <= now()')
  console.info('Registros expirados removidos.')
} catch { console.error('cleanup_failed'); process.exitCode = 1 }
finally { await pool.end() }

}
void main()
