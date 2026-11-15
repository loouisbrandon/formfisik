import {loadEnvConfig} from '@next/env'
loadEnvConfig(process.cwd())
async function main(){const {cleanupMedia}=await import('../src/server/media/repository');const result=await cleanupMedia();console.info(JSON.stringify({event:'media_cleanup',...result}));const {db}=await import('../src/server/db');await db().end();if(result.failed)process.exitCode=1}
main().catch(()=>{console.error('media_cleanup_unavailable');process.exitCode=1})
