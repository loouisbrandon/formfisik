import { z } from 'zod'
const text = (max: number) => z.string().trim().normalize('NFC').max(max).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),'Remova caracteres de controle.')
export const studentFields = z.object({
 fullName: text(120).min(2,'Informe o nome completo.').refine(v=>!/[\r\n]/.test(v),'Informe o nome em uma linha.').transform(v=>v.replace(/[ \t]+/g,' ')),
 email: text(254).transform(v=>v.toLowerCase()).refine(v=>!v || z.email().safeParse(v).success,'Informe um e-mail válido.').default(''),
 phone: text(30).transform(v=>v.replace(/[\s().-]/g,'')).refine(v=>!v || /^\+?\d{8,15}$/.test(v),'Informe de 8 a 15 dígitos, com DDI opcional.').default(''),
 birthDate: z.string().refine(v=>!v || /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v && v>='1900-01-01' && v<=new Date().toISOString().slice(0,10),'Informe uma data válida entre 1900 e hoje.').default(''),
 adminNotes: text(1000).default(''),
}).strict()
export const createStudentSchema = studentFields.extend({creationKey:z.uuid(),allowDuplicate:z.boolean().optional()}).strict()
export const editStudentSchema = studentFields.extend({version:z.int().positive()}).strict()
export const statusStudentSchema = z.object({status:z.enum(['active','archived']),version:z.int().positive()}).strict()
export const studentQuerySchema = z.object({q:text(120).default(''),status:z.enum(['all','active','archived']).default('active'),sort:z.enum(['name_asc','name_desc','newest','oldest']).default('name_asc'),page:z.coerce.number().int().min(1).max(100000).default(1)}).strict()
export type StudentFields=z.infer<typeof studentFields>
export type StudentQuery=z.infer<typeof studentQuerySchema>
export type AdministrativeEvent={kind:'created'|'updated'|'archived'|'reactivated';version:number;occurredAt:string}
export type Student = StudentFields & {history:AdministrativeEvent[];id:string;status:'active'|'archived';version:number;createdAt:string;updatedAt:string;archivedAt:string|null;reactivatedAt:string|null}
export type StudentSummary=Pick<Student,'id'|'fullName'|'status'|'version'|'createdAt'|'updatedAt'>
export type StudentList={items:StudentSummary[];total:number;page:number;pageSize:number;pages:number;filters:StudentQuery}
