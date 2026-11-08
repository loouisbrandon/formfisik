import {loadEnvConfig} from '@next/env'
import {readFile,readdir,stat} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {join} from 'node:path'

// Never print values, matching bytes, database URLs or credential-bearing errors.
loadEnvConfig(process.cwd())
const keys=['DATABASE_URL','ABUSE_HMAC_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_CONNECT_SECRET_KEY','STRIPE_CONNECT_WEBHOOK_SECRET','SMTP_PASSWORD','R2_SECRET_ACCESS_KEY','R2_ACCESS_KEY_ID','STREAM_API_TOKEN','STREAM_WEBHOOK_SECRET','SETTINGS_ENCRYPTION_KEY']
const secrets=keys.map(k=>process.env[k]).filter((v):v is string=>!!v&&v.length>=8)
const database=process.env.DATABASE_URL
if(database){try{const password=decodeURIComponent(new URL(database).password);if(password.length>=8)secrets.push(password)}catch{/* no credential-bearing parse errors */}}
const credentialPattern=/\b(?:sk_(?:live|test)_[A-Za-z0-9]{24,}|re_[A-Za-z0-9]{24,}|AKIA[A-Z0-9]{16})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\r?\n[A-Za-z0-9+/]{24,}/
const files:string[]=[]
async function walk(dir:string){for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isSymbolicLink())continue;if(item.isDirectory())await walk(path);else files.push(path)}}
async function main(){
 if(!secrets.length)throw Error('NO_AUDIT_SECRETS_CONFIGURED')
 if(!(await stat('.next/BUILD_ID').catch(()=>null))?.isFile())throw Error('PRODUCTION_BUILD_REQUIRED')
 await walk('.next/static');await walk('public')
 const tracked=process.argv.includes('--public-only')?[]:execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean)
 const findings:{file:string;kind:string}[]=[]
 for(const file of new Set([...files,...tracked])){const bytes=await readFile(file).catch(()=>null);if(!bytes)continue;if(secrets.some(value=>bytes.includes(value)))findings.push({file,kind:'configured_secret'});if(credentialPattern.test(bytes.toString('utf8')))findings.push({file,kind:'credential_pattern'});if(file.startsWith('.next/static/')&&file.endsWith('.map'))findings.push({file,kind:'public_source_map'})}
 let historyRevisions=0
 if(process.argv.includes('--history')){
  const revisions=execFileSync('git',['rev-list','HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
  for(const revision of revisions){historyRevisions++;try{const matches=execFileSync('git',['grep','-l','-F','-f','-',revision],{input:secrets.join('\n')+'\n',encoding:'utf8',stdio:['pipe','pipe','ignore']}).trim().split('\n').filter(Boolean);for(const file of matches)findings.push({file,kind:'configured_secret_in_history'})}catch(e){if((e as {status?:number}).status!==1)throw Error('HISTORY_SCAN_FAILED')}}
 }
 console.info(JSON.stringify({publicArtifacts:files.length,trackedFiles:tracked.length,historyRevisions,configuredSecrets:secrets.length,findings},null,2))
 if(findings.length)process.exitCode=1
}
main().catch(()=>{console.error('EXPOSURE_AUDIT_FAILED: production build and local secret configuration required; no secret values logged.');process.exitCode=1})
