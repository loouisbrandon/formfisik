import { loadEnvConfig } from '@next/env'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { Pool } from 'pg'

loadEnvConfig(process.cwd())
export async function migrate(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('DATABASE_URL obrigatória')
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    await client.query('SELECT pg_advisory_lock(71924001)')
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())')
    for (const name of (await readdir('db/migrations')).filter(n => n.endsWith('.sql')).sort()) {
      const sql = await readFile(`db/migrations/${name}`, 'utf8')
      const checksum = createHash('sha256').update(sql).digest('hex')
      const applied = await client.query('SELECT checksum FROM schema_migrations WHERE name=$1', [name])
      if (applied.rowCount) {
        if (applied.rows[0].checksum !== checksum) throw new Error('Migration aplicada foi alterada')
        continue
      }
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [name, checksum])
        await client.query('COMMIT')
      } catch (error) { await client.query('ROLLBACK'); throw error }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(71924001)')
    client.release()
    await pool.end()
  }
}
if (process.argv[1]?.endsWith('migrate.ts')) {
  migrate().then(() => console.info('Migrations aplicadas.')).catch(() => {
    console.error('Falha nas migrations. Confira conexão e histórico; credenciais não são registradas.')
    process.exitCode = 1
  })
}
