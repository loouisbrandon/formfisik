import {loadEnvConfig} from '@next/env'
import {setAccountDisabled} from '../src/server/account-security'
import {db} from '../src/server/db'
loadEnvConfig(process.cwd())
async function main(){try{
 const [action,id,reason,confirmed]=process.argv.slice(2)
 if(!['disable','enable'].includes(action)||!['owner_request','security_incident','administrative_review'].includes(reason)||confirmed!=='--identity-and-scope-verified'||process.argv.slice(2).length!==4)throw Error('INVALID_ARGUMENTS')
 await setAccountDisabled(id,action==='disable',reason as 'owner_request'|'security_incident'|'administrative_review')
 console.info('account_security_state_updated')
 }catch{console.error('account_security_operation_failed');process.exitCode=1}finally{await db().end()}}
void main()
