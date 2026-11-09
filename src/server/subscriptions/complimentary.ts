import 'server-only'
import type {PoolClient} from 'pg'
import {db} from '../db'
import {config} from '../config'
/** Explicit environment/domain pairing; staging data cannot unlock production. */
export function complimentaryEnvironment(): 'local'|'staging'|null {
 const url=new URL(config().appUrl),environment=process.env.RAILWAY_ENVIRONMENT_NAME
 if(environment==='staging'&&url.origin==='https://sta.formfisik.com.br')return 'staging'
 if(!environment&&process.env.NODE_ENV!=='production'&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname))return 'local'
 return null
}
export async function complimentaryAccess(userId:string,client?:PoolClient):Promise<{expiresAt:string|null}|null>{
 const environment=complimentaryEnvironment();if(!environment)return null
 const row=(await (client??db()).query(`SELECT g.expires_at FROM complimentary_access_grants g JOIN users u ON u.id=g.user_id
 WHERE u.id=$1 AND u.role='professional' AND u.email_verified_at IS NOT NULL AND u.disabled_at IS NULL
 AND g.environment=$2 AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())
 AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) LIMIT 1`,[userId,environment])).rows[0]
 return row?{expiresAt:row.expires_at?.toISOString()??null}:null
}
export async function hasComplimentaryAccess(userId:string,client?:PoolClient){return !!await complimentaryAccess(userId,client)}
