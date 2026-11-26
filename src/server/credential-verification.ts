import 'server-only'
import {randomBytes} from 'node:crypto'
import {hash,verify,argon2id} from 'argon2'
import {db} from './db'
let dummy:Promise<string>|undefined
function dummyHash(){return dummy??=hash(randomBytes(32),{type:argon2id,memoryCost:19456,timeCost:2,parallelism:1})}
/** Canonical password verification for Web and Core Mobile. No session/transport policy here.
 * Session issuance must recheck state/hash under its account lock. */
export async function verifyCredentials(email:string,password:string){
 const result=await db().query('SELECT u.id,u.role,u.email_verified_at,u.disabled_at,c.password_hash FROM users u JOIN credentials c ON c.user_id=u.id WHERE u.email=$1',[email])
 const user=result.rows[0] as {id:string;role:string;email_verified_at:Date|null;disabled_at:Date|null;password_hash:string}|undefined
 const valid=await verify(user?.password_hash??await dummyHash(),password)
 return user&&valid&&user.email_verified_at&&!user.disabled_at?user:null
}
