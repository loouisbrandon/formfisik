import 'server-only'
import {z} from 'zod'
import {db} from '../db'
import type {Identity} from '../sessions'
import {isAdministrator} from './dashboard'
import {adminUsersQuery} from '@/modules/admin/users-schema'
export type AdminUserSummary={id:string;fullName:string;role:string;disabled:boolean;createdAt:string}
export type AdminUserDetail=AdminUserSummary&{email:string;emailVerifiedAt:string|null;disabledAt:string|null;closureAt:string|null}
export async function adminUsers(user:Identity,input:z.input<typeof adminUsersQuery>){
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const q=adminUsersQuery.parse(input)
 // Ordering is a server-owned constant; no request string becomes SQL.
 const order={name_asc:'lower(full_name),id',newest:'created_at DESC,id',oldest:'created_at,id'}[q.sort]
 const term=q.q.replace(/[\\%_]/g,'\\$&')
 const {rows}=await db().query(`WITH filtered AS (
 SELECT id,full_name,role,disabled_at,created_at FROM users
 WHERE ($1='' OR full_name ILIKE '%'||$1||'%') AND ($2='all' OR role=$2)
 AND ($3='all' OR ($3='enabled' AND disabled_at IS NULL) OR ($3='disabled' AND disabled_at IS NOT NULL))
 ) SELECT (SELECT count(*)::int FROM filtered) AS total,
 (SELECT json_build_object('total',count(*),'professionals',count(*) FILTER(WHERE role='professional'),'admins',count(*) FILTER(WHERE role='admin')) FROM users) AS summary,
 coalesce((SELECT json_agg(item) FROM (SELECT id,full_name AS "fullName",role,(disabled_at IS NOT NULL) AS disabled,created_at AS "createdAt" FROM filtered ORDER BY ${order} LIMIT 20 OFFSET $4) item),'[]') AS items`,[term,q.role,q.state,(q.page-1)*20])
 const row=rows[0]
 return {items:row.items as AdminUserSummary[],total:Number(row.total),page:q.page,pages:Math.max(1,Math.ceil(Number(row.total)/20)),pageSize:20,summary:row.summary as {total:number;professionals:number;admins:number}}
}
export async function adminUserDetail(user:Identity,id:string):Promise<AdminUserDetail|null>{
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const parsed=z.uuid().safeParse(id);if(!parsed.success)return null
 const {rows}=await db().query(`SELECT u.id,u.full_name AS "fullName",u.email,u.role,(u.disabled_at IS NOT NULL) AS disabled,u.created_at AS "createdAt",u.email_verified_at AS "emailVerifiedAt",u.disabled_at AS "disabledAt",x.effective_at AS "closureAt" FROM users u LEFT JOIN account_closures x ON x.user_id=u.id WHERE u.id=$1`,[parsed.data])
 const row=rows[0];if(!row)return null
 return {id:row.id,fullName:row.fullName,email:row.email,role:row.role,disabled:row.disabled,createdAt:row.createdAt.toISOString(),emailVerifiedAt:row.emailVerifiedAt?.toISOString()??null,disabledAt:row.disabledAt?.toISOString()??null,closureAt:row.closureAt?.toISOString()??null}
}
