import {loadEnvConfig} from '@next/env'
loadEnvConfig(process.cwd())
async function main(){const {cleanupPhotoObjects}=await import('../src/server/progress-photos/repository');const {r2PhotoStore}=await import('../src/server/progress-photos/storage');const {db}=await import('../src/server/db');try{const result=await cleanupPhotoObjects(r2PhotoStore());console.info(JSON.stringify(result));if(result.failed)process.exitCode=1}catch{console.error('photo_cleanup_failed');process.exitCode=1}finally{await db().end()}}
void main()
