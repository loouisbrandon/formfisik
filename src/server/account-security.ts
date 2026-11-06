import 'server-only'
import {z} from '@/lib/validation'
import {transaction} from './exercises/repository'
/** Operator-only control, never exposed by an HTTP handler or the client. */
export async function setAccountDisabled(userId:string,disabled:boolean,reason:'owner_request'|'security_incident'|'administrative_review'){
 z.uuid().parse(userId);z.enum(['owner_request','security_incident','administrative_review']).parse(reason)
 await transaction(async c=>{
  const user=await c.query('SELECT disabled_at FROM users WHERE id=$1 FOR UPDATE',[userId])
  if(!user.rowCount)throw Error('ACCOUNT_NOT_FOUND')
  if(!disabled&&(await c.query("SELECT 1 FROM privacy_erasure_jobs WHERE owner_id=$1 AND state<>'completed' LIMIT 1",[userId])).rowCount)throw Error('ERASURE_IN_PROGRESS')
  if(!!user.rows[0].disabled_at===disabled)return
  await c.query('UPDATE users SET disabled_at=CASE WHEN $2 THEN clock_timestamp() ELSE NULL END WHERE id=$1',[userId,disabled])
  await c.query('INSERT INTO account_security_events(user_id,kind,reason) VALUES($1,$2,$3)',[userId,disabled?'disabled':'enabled',reason])
 })
}
