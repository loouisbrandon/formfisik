import {loadEnvConfig} from '@next/env'
import {expireImports} from '../src/server/imports/repository'
import {db} from '../src/server/db'
loadEnvConfig(process.cwd())
expireImports().then(r=>console.info(JSON.stringify(r))).catch(()=>{console.error('imports_cleanup_failed');process.exitCode=1}).finally(()=>db().end())
