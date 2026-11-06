import {loadEnvConfig} from '@next/env'
import {readFile,writeFile,stat,realpath} from 'node:fs/promises'
import {isAbsolute,resolve,relative,dirname,basename,sep} from 'node:path'
import {requestErasure,processErasure,processErasureQueue,erasureInput} from '../src/server/privacy/erasure'
import {exportErasureLedger,replayErasureLedger,erasureStatus} from '../src/server/privacy/ledger'
import {r2PhotoStore} from '../src/server/progress-photos/storage'
import {db} from '../src/server/db'
loadEnvConfig(process.cwd())
async function protectedPath(value:string){if(!isAbsolute(value))throw Error('ABSOLUTE_LEDGER_PATH_REQUIRED');const path=resolve(await realpath(dirname(value)),basename(value)),rel=relative(await realpath(process.cwd()),path);if(rel!=='..'&&!rel.startsWith('..'+sep))throw Error('LEDGER_MUST_BE_OUTSIDE_REPOSITORY');return path}
async function main(){try{
 const args=process.argv.slice(2),flags=args.filter(a=>a.startsWith('--')),values=args.filter(a=>!a.startsWith('--')),[action,...p]=values
 const database=new URL(process.env.DATABASE_URL||'').pathname.slice(1)
 if(!database||!flags.includes('--database-confirmed='+database))throw Error('DATABASE_CONFIRMATION_REQUIRED')
 const known=['--database-confirmed='+database,'--apply','--identity-and-scope-verified','--retention-reviewed','--maintenance-verified']
 if(flags.some(flag=>!known.includes(flag)))throw Error('INVALID_ARGUMENTS')
 if(['request','run','run-due','ledger-replay'].includes(action)&&!known.slice(1).every(flag=>flags.includes(flag)))throw Error('OPERATIONAL_APPROVAL_REQUIRED')
 if(action==='request'&&p.length===5){const [scope,ownerId,subjectId,id,approvalReference]=p;const job=await requestErasure(erasureInput.parse({scope,ownerId,subjectId,id,approvalReference}));console.info(JSON.stringify({event:'erasure_requested',job}))}
 else if(action==='run'&&p.length===1){const result=await processErasure(p[0],r2PhotoStore());console.info(JSON.stringify(result));if(result.state!=='completed'||result.failed)process.exitCode=1}
 else if(action==='run-due'&&p.length===0){const result=await processErasureQueue(r2PhotoStore());console.info(JSON.stringify(result));if(result.failed)process.exitCode=1}
 else if(action==='status'&&p.length<=1)console.info(JSON.stringify(await erasureStatus(p[0]?Number(p[0]):1)))
 else if(action==='ledger-export'&&p.length===1){await writeFile(await protectedPath(p[0]),await exportErasureLedger(),{mode:0o600,flag:'wx'});console.info('erasure_ledger_exported')}
 else if(action==='ledger-replay'&&p.length===1){const file=await protectedPath(p[0]);if((await stat(file)).size>11000000)throw Error('LEDGER_TOO_LARGE');console.info(JSON.stringify(await replayErasureLedger(await readFile(file,'utf8'))))}
 else throw Error('INVALID_ARGUMENTS')
 }catch{console.error('privacy_operation_failed');process.exitCode=1}finally{await db().end()}}
void main()
