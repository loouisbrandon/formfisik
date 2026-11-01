import {loadEnvConfig} from '@next/env'
import {z} from 'zod'
import {transaction} from '../src/server/exercises/repository'
loadEnvConfig(process.cwd())
// Deliberately CLI-only. The database operator must verify identity outside this application.
const [action,id,email,reason,confirmation]=process.argv.slice(2)
async function run(){if(!['grant','revoke'].includes(action)||!z.uuid().safeParse(id).success||!z.email().safeParse(email).success||!reason||reason.trim().length<10||reason.length>500||confirmation!=='--identity-verified')throw Error('Invalid provisioning arguments');await transaction(async c=>{const u=await c.query('SELECT id FROM users WHERE id=$1 AND email=$2 AND email_verified_at IS NOT NULL FOR UPDATE',[id,email.trim().toLowerCase()]);if(!u.rowCount)throw Error('Confirmed identity not found');if(action==='grant')await c.query("INSERT INTO exercise_moderators(user_id,reason,provisioning) VALUES($1,$2,'operator_verified') ON CONFLICT(user_id) DO UPDATE SET reason=$2,granted_at=now(),revoked_at=NULL",[id,reason]);else{const r=await c.query('UPDATE exercise_moderators SET revoked_at=now(),reason=$2 WHERE user_id=$1',[id,reason]);if(!r.rowCount)throw Error('Grant not found')}await c.query('INSERT INTO exercise_moderator_events(user_id,kind,reason) VALUES($1,$2,$3)',[id,action,reason])});console.log('Moderator capability updated; audit recorded.')}
run().then(()=>process.exit(0)).catch(()=>{console.error('Provisioning failed. Verify explicit arguments and confirmed identity.');process.exit(1)})
