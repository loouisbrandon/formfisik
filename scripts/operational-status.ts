import {loadEnvConfig} from '@next/env'
import {operationalStatus} from '../src/server/operations'
import {db} from '../src/server/db'
loadEnvConfig(process.cwd())
async function main(){try{const result=await operationalStatus();console.info(JSON.stringify(result));if(result.schema!=='ready'||!result.connectionBasicPrivilegeChecksPass)process.exitCode=1}catch{console.error('operational_status_unavailable');process.exitCode=1}finally{await db().end()}}
void main()
