import {loadEnvConfig} from '@next/env'
import {randomBytes,randomUUID} from 'node:crypto'
import {writeFile} from 'node:fs/promises'
import {hash,argon2id} from 'argon2'
import {db} from '../src/server/db'
loadEnvConfig(process.cwd())
async function main(){
 const url=new URL(process.env.DATABASE_URL||''),app=new URL(process.env.APP_URL||'')
 if(process.env.NODE_ENV==='production'||process.env.RAILWAY_ENVIRONMENT_NAME||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||!['localhost','127.0.0.1','[::1]'].includes(app.hostname)||process.argv[2]!=='--create-local-test-admin')throw Error('LOCAL_ONLY')
 const client=await db().connect(),password='Ff!'+randomBytes(18).toString('base64url'),email='admin.local@example.test'
 try{
  await client.query('BEGIN')
  if((await client.query('SELECT id FROM users WHERE email=$1',[email])).rowCount)throw Error('LOCAL_ADMIN_ALREADY_EXISTS')
  const id=randomUUID(),digest=await hash(password,{type:argon2id,memoryCost:19456,timeCost:2,parallelism:1})
  await client.query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,'Administrador local','admin',now())",[id,email])
  await client.query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[id,digest])
  // Temporary local credentials, never logged or committed. No existing account is promoted.
  await writeFile('/tmp/formfisik-admin-local.txt',`Somente ambiente local\nLogin: ${email}\nSenha: ${password}\nURL: ${app.origin}/login\n`,{mode:0o600,flag:'wx'})
  await client.query('COMMIT')
  console.info('local_admin_created_credentials_in_restricted_temporary_file')
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
}
main().catch(()=>{console.error('local_admin_creation_failed');process.exitCode=1}).finally(()=>db().end())
