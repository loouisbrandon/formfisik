import 'server-only'
import {db} from '../db'
// Transitional read: old local databases keep their shell while migration authorization is pending.
export async function settingsAvatarVersion(owner:string){try{const r=await db().query('SELECT version FROM professional_settings WHERE user_id=$1 AND avatar IS NOT NULL',[owner]);return r.rows[0]?.version as number|undefined}catch(e){if((e as {code?:string}).code==='42P01')return undefined;throw e}}
