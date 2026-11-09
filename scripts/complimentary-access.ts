import {loadEnvConfig} from '@next/env'
loadEnvConfig(process.cwd())
async function main(){const{db}=await import('../src/server/db');try{
 const name=new URL(process.env.DATABASE_URL||'').pathname.slice(1)
 if(!process.argv.includes('--database-confirmed='+name)||!process.argv.includes('--owner-authorized'))throw Error('TARGET_APPROVAL_REQUIRED')
 const {provisionComplimentaryProfessional,revokeComplimentaryAccess}=await import('../src/server/subscriptions/complimentary-operations')
 if(process.argv[2]==='create'){let body='';for await(const chunk of process.stdin){body+=chunk;if(body.length>4096)throw Error('INPUT_TOO_LARGE')}await provisionComplimentaryProfessional(JSON.parse(body));console.info('COMPLIMENTARY_ACCOUNT_CREATED')}
 else if(process.argv[2]==='revoke'){const result=await revokeComplimentaryAccess(process.argv[3],process.argv[4]);console.info(JSON.stringify(result))}
 else throw Error('INVALID_ACTION')
 }catch{console.error('COMPLIMENTARY_OPERATION_FAILED_DETAILS_REDACTED');process.exitCode=1}finally{await db().end()}}
void main()
