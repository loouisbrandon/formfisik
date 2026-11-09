import 'server-only'
import type {PoolClient} from 'pg'
import {sessionDigest,IDLE_SECONDS} from '../sessions'
export class AdminOperationConflict extends Error{}
export async function guardAdminTransaction(c:PoolClient,actorId:string,token:string){
 const actor=await c.query("SELECT id FROM users u WHERE id=$1 AND role='admin' AND disabled_at IS NULL AND email_verified_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) FOR SHARE",[actorId])
 if(!actor.rowCount)throw new AdminOperationConflict('ADMIN_REVOKED')
 const session=await c.query("SELECT 1 FROM sessions WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL AND expires_at>clock_timestamp() AND last_seen_at>clock_timestamp()-$3*interval '1 second' FOR SHARE",[actorId,sessionDigest(token),IDLE_SECONDS])
 if(!session.rowCount)throw new AdminOperationConflict('SESSION_REVOKED')
}
