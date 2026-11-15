import {z} from 'zod'
export const adminUsersQuery=z.object({
 q:z.string().trim().max(120).default(''),
 role:z.enum(['all','professional','student','admin']).default('all'),
 state:z.enum(['all','enabled','disabled']).default('all'),
 sort:z.enum(['name_asc','newest','oldest']).default('newest'),
 view:z.enum(['list','cards']).default('list'),
 page:z.coerce.number().int().min(1).max(10000).default(1),
}).strict()
export type AdminUsersQuery=z.infer<typeof adminUsersQuery>
export const roleLabels:Record<string,string>={professional:'Personal',student:'Aluno',admin:'Admin'}
export function usersHref(query:AdminUsersQuery){return '/admin/usuarios?'+new URLSearchParams(Object.entries(query).map(([key,value])=>[key,String(value)]))}
export const accountSecurityInput=z.object({disabled:z.boolean(),expectedDisabled:z.boolean(),reason:z.enum(['owner_request','security_incident','administrative_review'])}).strict()
