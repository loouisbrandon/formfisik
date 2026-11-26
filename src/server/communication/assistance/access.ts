import 'server-only'
import type {PoolClient} from 'pg'
import {readSession,sessionDigest} from '../../sessions'
import {professionalAccess} from '../../professional-dashboard'
import {aiAccess} from '../../ecoach/access'
import {CoachError,consentFingerprint,aiRuntime} from '../../ecoach/provider'
import {db} from '../../db'
export const supportConsent=()=>`support-v1:${consentFingerprint()}`
export async function supportAccess(owner:string,token:string,c?:PoolClient,ai=false){
 const user=await readSession(token)
 if(!user||user.id!==owner)throw new CoachError(401,'Entre novamente.')
 if(user.role!=='professional')throw new CoachError(403,'Área exclusiva do profissional.')
 const access=await professionalAccess(user)
 if(access.status!=='allowed')throw new CoachError(access.status==='denied'?403:503,'Acesso profissional necessário.')
 if(c&&!(await c.query("SELECT 1 FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.user_id=$1 AND s.token_hash=$2 AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND s.last_seen_at>clock_timestamp()-interval '365 days' AND u.disabled_at IS NULL FOR SHARE OF s,u",[owner,sessionDigest(token)])).rowCount)throw new CoachError(401,'Entre novamente.')
 if(ai){if(!aiRuntime().ready)throw new CoachError(503,'Configure o eCoach antes de gerar respostas.');await aiAccess(owner,token,undefined,c);const settings=await(c??db()).query('SELECT consent_fingerprint FROM communication_assistance_settings WHERE owner_id=$1',[owner]);if(settings.rows[0]?.consent_fingerprint!==supportConsent())throw new CoachError(403,'Autorize o atendimento assistido na aba Automações.')}
}
