import {spawn} from 'node:child_process'
import {resolve} from 'node:path'

// Every credential used by this build is synthetic, including environments with .env.local.
const env:NodeJS.ProcessEnv={...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',APP_URL:'https://localhost:3443',
 DATABASE_URL:'postgresql://audit:FF_BUILD_CANARY_DATABASE_ONLY@127.0.0.1:1/security_test',
 ABUSE_HMAC_SECRET:'FF_BUILD_CANARY_HMAC_XXXXXXXXXXXXXXXXXXXXXXXX',
 STRIPE_SECRET_KEY:'sk_test_FF_BUILD_CANARY_STRIPE_ONLY',STRIPE_WEBHOOK_SECRET:'whsec_FF_BUILD_CANARY_BILLING_ONLY',
 STRIPE_CONNECT_SECRET_KEY:'sk_test_FF_BUILD_CANARY_CONNECT_ONLY',STRIPE_CONNECT_WEBHOOK_SECRET:'whsec_FF_BUILD_CANARY_CONNECT_WEBHOOK',
 MAIL_TRANSPORT:'resend',RESEND_API_KEY:'re_FF_BUILD_CANARY_RESEND_ONLY',SMTP_HOST:'127.0.0.1',SMTP_PORT:'1',SMTP_USER:'synthetic',SMTP_PASSWORD:'FF_BUILD_CANARY_SMTP_ONLY',
 R2_SECRET_ACCESS_KEY:'FF_BUILD_CANARY_R2_SECRET_ONLY',R2_ACCESS_KEY_ID:'FF_BUILD_CANARY_R2_ACCESS_ONLY',
 STREAM_API_TOKEN:'FF_BUILD_CANARY_STREAM_TOKEN_ONLY',STREAM_WEBHOOK_SECRET:'FF_BUILD_CANARY_STREAM_WEBHOOK_ONLY',
 SETTINGS_ENCRYPTION_KEY:'ab'.repeat(32)}
async function run(args:string[]){return new Promise<number>(resolveExit=>{const child=spawn(process.execPath,args,{env,stdio:'inherit'});child.once('error',()=>resolveExit(1));child.once('exit',code=>resolveExit(code??1))})}
async function main(){const built=await run([resolve('node_modules/next/dist/bin/next'),'build','--webpack']);if(built){process.exitCode=built;return}process.exitCode=await run(['--import','tsx','scripts/audit-browser-exposure.ts','--public-only'])}
main().catch(()=>{console.error('SECURITY_BUILD_FAILED');process.exitCode=1})
