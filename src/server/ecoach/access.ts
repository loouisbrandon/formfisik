import 'server-only'
import type {PoolClient} from 'pg'
import {db} from '../db'
import {readSession,sessionDigest} from '../sessions'
import {subscriptionStatus} from '../subscriptions/status'
import {coachPermission} from '@/modules/ecoach/permissions-schema'
import {CoachError,consentFingerprint} from './provider'
export async function aiAccess(owner:string,token:string,write?:'create'|'edit',client?:PoolClient){
 const user=await readSession(token);if(!user||user.id!==owner||user.role!=='professional')throw new CoachError(401,'Entre novamente.')
 const access=await subscriptionStatus(owner,false,undefined,false,false);if(!access.paidAccess||access.planId!=='pro')throw new CoachError(403,'A IA requer acesso Pro vigente ou cortesia equivalente.')
 const store=client??db()
 if(client){const live=await client.query("SELECT 1 FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.user_id=$1 AND s.token_hash=$2 AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND s.last_seen_at>clock_timestamp()-interval '365 days' AND u.disabled_at IS NULL AND u.role='professional'",[owner,sessionDigest(token)]);if(!live.rowCount)throw new CoachError(401,'Entre novamente.')}
 const row=await store.query('SELECT preferences FROM professional_settings WHERE user_id=$1',[owner]);const prefs=row.rows[0]?.preferences,permission=coachPermission.safeParse(prefs?.ecoach)
 if(!permission.success)throw new CoachError(403,'Escolha as permissões do eCoach antes de continuar.')
 if(prefs?.ecoachExternalConsent!==consentFingerprint())throw new CoachError(403,'Autorize o compartilhamento com o provedor atual em Configurações → eCoach.')
 if(write==='create'&&permission.data==='read'||write==='edit'&&permission.data!=='manage')throw new CoachError(403,'Sua permissão atual não permite esta ação. Revise Configurações → eCoach.')
 return permission.data
}
