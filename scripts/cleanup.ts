import { loadEnvConfig } from '@next/env'
import { Pool } from 'pg'
loadEnvConfig(process.cwd())
async function main() {
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  if (!process.env.DATABASE_URL) throw new Error('Missing connection')
  await pool.query('DELETE FROM pending_registrations WHERE expires_at < now()')
  await pool.query('DELETE FROM password_resets WHERE expires_at < now()')
  await pool.query('DELETE FROM settings_email_changes WHERE expires_at < now()')
  await pool.query('DELETE FROM abuse_limits WHERE expires_at < now()')
  await pool.query("DELETE FROM sessions WHERE expires_at < now() OR revoked_at IS NOT NULL OR last_seen_at < now()-interval '30 minutes'")
  await pool.query('DELETE FROM workout_documents WHERE expires_at <= now()')
  await pool.query('DELETE FROM ecoach_ai_requests WHERE expires_at <= now()')
  await pool.query('DELETE FROM ecoach_proposals WHERE expires_at <= now()')
  await pool.query("UPDATE communication_inbox_jobs SET state='failed',lease_until=NULL,failure='Processamento interrompido. Solicite nova tentativa.',updated_at=clock_timestamp() WHERE state='running' AND lease_until<clock_timestamp()")
  await pool.query("DELETE FROM communication_inbox_threads WHERE updated_at<clock_timestamp()-interval '180 days'")
  await pool.query("DELETE FROM communication_inbox_operations o WHERE NOT EXISTS(SELECT 1 FROM communication_inbox_threads t WHERE t.owner_id=o.owner_id AND t.id=o.thread_id) AND o.thread_id IS NOT NULL")
  console.info('Registros expirados removidos.')
} catch { console.error('cleanup_failed'); process.exitCode = 1 }
finally { await pool.end() }

}
void main()
