import 'server-only'
import type {z} from 'zod'
import {db} from '../db'
import type {Identity} from '../sessions'
import {isAdministrator} from './dashboard'
import {adminPrivacyQuery} from '@/modules/admin/privacy-schema'
export type PrivacyItem={id:string;name:string;type:string;state:string;createdAt:string}
export type PrivacyDetail=PrivacyItem&{userId:string|null;updatedAt:string|null;effectiveAt:string|null;blocker:string|null}
// Read-only projections. No student identity, operator approval, storage key, credential or lease.
const sources={
 requests:`SELECT r.id::text,u.id AS user_id,u.full_name,r.kind AS type,r.status AS state,r.created_at,r.resolved_at AS updated_at,NULL::timestamptz AS effective_at,NULL::text AS blocker FROM settings_privacy_requests r LEFT JOIN users u ON u.id=r.user_id`,
 closures:`SELECT c.id::text,u.id AS user_id,u.full_name,'closure'::text AS type,c.state,c.requested_at AS created_at,c.processed_at AS updated_at,c.effective_at,NULL::text AS blocker FROM account_closures c LEFT JOIN users u ON u.id=c.user_id`,
 erasures:`SELECT j.id::text,u.id AS user_id,u.full_name,j.scope AS type,j.state,j.created_at,j.completed_at AS updated_at,j.not_before AS effective_at,j.blocker FROM privacy_erasure_jobs j LEFT JOIN users u ON u.id=j.owner_id`,
 security:`SELECT e.id::text,u.id AS user_id,u.full_name,e.reason AS type,e.kind AS state,e.occurred_at AS created_at,NULL::timestamptz AS updated_at,NULL::timestamptz AS effective_at,NULL::text AS blocker FROM account_security_events e LEFT JOIN users u ON u.id=e.user_id`,
} as const
export async function adminPrivacy(user:Identity,input:z.input<typeof adminPrivacyQuery>){
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const q=adminPrivacyQuery.parse(input),term=q.q.replace(/[\\%_]/g,'\\$&'),order=q.sort==='newest'?'created_at DESC,id DESC':'created_at,id'
 const {rows}=await db().query(`WITH source AS (${sources[q.tab]}),filtered AS (SELECT * FROM source WHERE ($1='' OR full_name ILIKE '%'||$1||'%') AND ($2='all' OR state=$2) AND ($3::int IS NULL OR created_at>=now()-$3::int*interval '1 day')) SELECT
 (SELECT count(*)::int FROM filtered) AS total,
 json_build_object('requests',(SELECT count(*)::int FROM settings_privacy_requests WHERE status IN ('pending','processing')),'closures',(SELECT count(*)::int FROM account_closures WHERE state='scheduled'),'blockedErasures',(SELECT count(*)::int FROM privacy_erasure_jobs WHERE state='blocked'),'disabledUsers',(SELECT count(*)::int FROM users WHERE disabled_at IS NOT NULL)) AS summary,
 coalesce((SELECT json_agg(item) FROM (SELECT id,coalesce(full_name,'Conta removida') AS name,type,state,created_at AS "createdAt" FROM filtered ORDER BY ${order} LIMIT 20 OFFSET $4) item),'[]') AS items,
 (SELECT json_build_object('id',id,'userId',user_id,'name',coalesce(full_name,'Conta removida'),'type',type,'state',state,'createdAt',created_at,'updatedAt',updated_at,'effectiveAt',effective_at,'blocker',blocker) FROM source WHERE id=$5) AS selected,
 coalesce((SELECT json_agg(item) FROM (SELECT d.previous_state AS "previousState",d.new_state AS "newState",d.justification,d.reference,d.created_at AS "createdAt",coalesce(u.full_name,'Administrador removido') AS actor FROM admin_privacy_decisions d LEFT JOIN users u ON u.id=d.actor_id WHERE d.request_id::text=$5 AND $6='requests' ORDER BY d.created_at DESC,d.id DESC LIMIT 10) item),'[]') AS decisions`,[term,q.state,q.period==='all'?null:Number(q.period),(q.page-1)*20,q.detalhe??null,q.tab])
 const r=rows[0];return {items:r.items as PrivacyItem[],total:Number(r.total),page:q.page,pages:Math.max(1,Math.ceil(Number(r.total)/20)),selected:r.selected as PrivacyDetail|null,decisions:r.decisions as {previousState:string;newState:string;justification:string;reference:string;createdAt:string;actor:string}[],summary:r.summary as {requests:number;closures:number;blockedErasures:number;disabledUsers:number}}
}
