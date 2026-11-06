import {createHash} from 'node:crypto'
import {readdir,readFile} from 'node:fs/promises'
import {join} from 'node:path'

/** No env/DB side effects. Shared by migration, readiness and operator diagnostics. */
export async function migrationFiles(directory='db/migrations'){
 const names=(await readdir(directory)).filter(name=>name.endsWith('.sql')).sort()
 if(!names.length||names.some((name,index)=>!new RegExp('^'+String(index+1).padStart(3,'0')+'_[a-z0-9_]+\\.sql$').test(name)))throw Error('MIGRATION_SEQUENCE_INVALID')
 return Promise.all(names.map(async name=>{const sql=await readFile(join(directory,name),'utf8');return {name,sql,checksum:createHash('sha256').update(sql).digest('hex')}}))
}
export function migrationHistoryMatches(files:{name:string;checksum:string}[],rows:{name:string;checksum:string}[],complete=false){
 return (!complete||files.length===rows.length)&&rows.every((row,index)=>row.name===files[index]?.name&&row.checksum===files[index]?.checksum)
}
