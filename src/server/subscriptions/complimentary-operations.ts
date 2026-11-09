import 'server-only'
import { randomUUID } from 'node:crypto'
import argon2 from 'argon2'
import { z } from '@/lib/validation'
import { passwordSchema } from '@/modules/auth/password-policy'
import { db } from '../db'
import { config } from '../config'
import { locked,transaction } from './store'
const inputSchema=z.object({email:z.email().max(254).transform(s=>s.toLowerCase()),fullName:z.string().trim().min(3).max(120),password:passwordSchema,authorizationReference:z.uuid()}).strict()
function staging(){if(process.env.RAILWAY_ENVIRONMENT_NAME!=='staging'||config().appUrl!=='https://sta.formfisik.com.br')throw Error('STAGING_ONLY')}
/** Operator credential only; never exposed by HTTP. Existing identities are not overwritten. */
export async function provisionComplimentaryProfessional(raw:unknown){staging();const input=inputSchema.parse(raw),id=randomUUID(),grant=randomUUID()
 const passwordHash=await argon2.hash(input.password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1})
 const c=await db().connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[input.email])
 if((await c.query('SELECT 1 FROM users WHERE email=$1',[input.email])).rowCount)throw Error('IDENTITY_ALREADY_EXISTS')
 // Administrative staging provisioning, explicitly authorized by the system owner.
 // This timestamp is not evidence of an inbox verification ceremony.
 await c.query("INSERT INTO users(id,email,full_name,role,email_verified_at) VALUES($1,$2,$3,'professional',clock_timestamp())",[id,input.email,input.fullName])
 await c.query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[id,passwordHash])
 await c.query("INSERT INTO complimentary_access_grants(id,user_id,environment,reason,authorization_reference) VALUES($1,$2,'staging','owner_authorized_test',$3)",[grant,id,input.authorizationReference])
 await c.query("INSERT INTO complimentary_access_events(grant_id,operation,authorization_reference) VALUES($1,'granted',$2)",[grant,input.authorizationReference])
 await c.query('DELETE FROM pending_registrations WHERE email=$1',[input.email])
 await c.query('COMMIT');return {userId:id,grantId:grant}
 }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
}
export async function revokeComplimentaryAccess(userId:string,authorizationReference:string){staging();z.uuid().parse(userId);z.uuid().parse(authorizationReference)
 return locked(userId,c=>transaction(c,async()=>{
 const rows=await c.query("UPDATE complimentary_access_grants SET revoked_at=clock_timestamp() WHERE user_id=$1 AND environment='staging' AND revoked_at IS NULL RETURNING id",[userId])
 for(const row of rows.rows)await c.query("INSERT INTO complimentary_access_events(grant_id,operation,authorization_reference) VALUES($1,'revoked',$2)",[row.id,authorizationReference])
 await c.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE user_id=$1 AND revoked_at IS NULL',[userId])
 return {revoked:rows.rowCount??0}
 }))
}
