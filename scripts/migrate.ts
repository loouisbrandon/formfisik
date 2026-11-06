import { loadEnvConfig } from '@next/env'
import { Pool, type PoolClient } from 'pg'
import {migrationFiles,migrationHistoryMatches} from './migration-files'

loadEnvConfig(process.cwd())
export async function migrate(connectionString = process.env.DATABASE_URL, directory='db/migrations') {
  if (!connectionString) throw new Error('DATABASE_URL obrigatória')
  const files=await migrationFiles(directory)
  const pool = new Pool({ connectionString, connectionTimeoutMillis:5000 })
  let client:PoolClient|undefined,locked=false
  try {
    client=await pool.connect()
    await client.query('SELECT pg_advisory_lock(71924001)')
    locked=true
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())')
    const history=await client.query('SELECT name,checksum FROM schema_migrations ORDER BY name')
    if(!migrationHistoryMatches(files,history.rows))throw Error('MIGRATION_HISTORY_DIVERGED')
    for (const {name,sql,checksum} of files.slice(history.rows.length)) {
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [name, checksum])
        await client.query('COMMIT')
      } catch (error) { await client.query('ROLLBACK'); throw error }
    }
  } finally {
    try {if(locked)await client!.query('SELECT pg_advisory_unlock(71924001)')}
    finally {client?.release();await pool.end()}
  }
}
if (process.argv[1]?.endsWith('migrate.ts')) {
  migrate().then(() => console.info('Migrations aplicadas.')).catch(() => {
    console.error('Falha nas migrations. Confira conexão e histórico; credenciais não são registradas.')
    process.exitCode = 1
  })
}
