import 'server-only'
import {migrationFiles,migrationHistoryMatches} from '../../scripts/migration-files'
import {db} from './db'
let manifest:ReturnType<typeof migrationFiles>|undefined
export const expectedMigrations=()=>manifest??=migrationFiles()
export async function schemaReady(){const [files,result]=await Promise.all([expectedMigrations(),db().query('SELECT name,checksum FROM schema_migrations ORDER BY name')]);return migrationHistoryMatches(files,result.rows,true)}
