import {getRequest} from '../exercises/repository'
import 'server-only'
import {z} from 'zod'
import type {Identity} from '../sessions'
import {db} from '../db'
import {isAdministrator} from './dashboard'
export const adminRequestQuery=z.object({state:z.enum(['pending','approved','linked_existing','rejected','all']).default('pending'),page:z.coerce.number().int().min(1).max(10000).default(1),solicitacao:z.uuid().optional()}).strict()
export type RequestPreview={id:string;name:string;createdAt:string;state:'pending'|'approved'|'linked_existing'|'rejected'}
export async function adminExerciseRequests(user:Identity,input:z.input<typeof adminRequestQuery>){
 if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED')
 const query=adminRequestQuery.parse(input)
 const result=await db().query(`WITH pending AS (SELECT id,proposal,state,created_at FROM exercise_requests WHERE ($3='all' OR state=$3)) SELECT
 (SELECT count(*)::int FROM pending) AS total,
 coalesce((SELECT json_agg(row) FROM (SELECT id,left(proposal->>'name',160) AS name,state,created_at AS "createdAt" FROM pending ORDER BY created_at,id LIMIT 20 OFFSET $1) row),'[]') AS items,
 (SELECT json_build_object('id',id,'state',state,'name',left(proposal->>'name',160),'category',proposal->>'category','instructions',proposal->'instructions','createdAt',created_at) FROM pending WHERE id=$2::uuid) AS selected`,[(query.page-1)*20,query.solicitacao??null,query.state])
 const row=result.rows[0]
 return {items:row.items as RequestPreview[],total:Number(row.total),page:query.page,pages:Math.max(1,Math.ceil(Number(row.total)/20)),selected:row.selected as null|RequestPreview&{category:string;instructions:string[]}}
}

export async function adminReviewDetail(user:Identity,id:string){if(!isAdministrator(user))throw Error('ADMIN_ACCESS_DENIED');return getRequest(user.id,id,true)}
