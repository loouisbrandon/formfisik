import {z} from '@/lib/validation'
import {studentFields} from '../students/schema'
import {exerciseFields} from '../exercises/schema'
import {workoutFields} from '../workouts/schema'
export const kinds=['students','exercises','templates'] as const
export type ImportKind=typeof kinds[number]
export const fieldNames={students:['fullName','email','phone','birthDate','adminNotes'],exercises:['name','category','primaryMuscles','secondaryMuscles','equipment','level','instructions','aliases'],templates:[]} as const
export const fieldLabels:Record<string,string>={fullName:'Nome completo',email:'E-mail',phone:'Telefone',birthDate:'Nascimento (AAAA-MM-DD)',adminNotes:'Observações administrativas',name:'Nome',category:'Categoria',primaryMuscles:'Músculos principais',secondaryMuscles:'Músculos secundários',equipment:'Equipamento',level:'Nível',instructions:'Instruções',aliases:'Nomes alternativos'}
export const kindLabels={students:'Alunos por CSV',exercises:'Exercícios particulares por CSV',templates:'Modelos de treino por JSON'}
export const templateFields=workoutFields.refine(v=>v.kind==='template'&&v.studentId===null,'Somente modelos sem aluno e sem ativação.')
const mapping=z.record(z.string().max(40),z.int().min(0).max(19)).refine(v=>new Set(Object.values(v)).size===Object.values(v).length,'Uma coluna não pode alimentar dois campos.')
export const previewCommand=z.object({action:z.literal('preview'),creationKey:z.uuid(),kind:z.enum(kinds),text:z.string().max(1048576),delimiter:z.enum([',',';']),mapping}).strict().superRefine((v,c)=>{const allowed:readonly string[]=fieldNames[v.kind];if(Object.keys(v.mapping).some(k=>!allowed.includes(k)))c.addIssue({code:'custom',message:'Campo não permitido.'});for(const key of v.kind==='students'?['fullName']:v.kind==='exercises'?['name','category','primaryMuscles']:[])if(v.mapping[key]===undefined)c.addIssue({code:'custom',message:'Mapeie os campos obrigatórios.'})})
export const decision=z.enum(['create','skip','distinct'])
export const importCommand=z.discriminatedUnion('action',[
 previewCommand,
 z.object({action:z.literal('confirm'),id:z.uuid(),version:z.int().positive(),choices:z.array(z.object({line:z.int().min(1).max(500),decision}).strict()).max(500).refine(v=>new Set(v.map(x=>x.line)).size===v.length),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal('process'),id:z.uuid()}).strict(),
 z.object({action:z.literal('cancel'),id:z.uuid(),confirmed:z.literal(true)}).strict(),
])
export const importQuery=z.object({view:z.enum(['history','job','report']).default('history'),id:z.uuid().optional(),page:z.coerce.number().int().min(1).max(10000).default(1)}).strict().refine(v=>v.view==='history'||!!v.id)
export type PreviewCommand=z.infer<typeof previewCommand>
export type ImportCommand=z.infer<typeof importCommand>
export type ImportQuery=z.infer<typeof importQuery>
export type ImportInput=z.infer<typeof studentFields>|z.infer<typeof exerciseFields>|z.infer<typeof workoutFields>
export type RowState='valid'|'invalid'|'duplicate'|'conflict'|'imported'|'ignored'|'rejected'|'erased'
export type Row={line:number;state:RowState;decision:z.infer<typeof decision>;error_code:string|null;fields:ImportInput|null;result_id:string|null;file_matches:number[];candidates:{id:string;name:string}[];moreCandidates:boolean}
export type Job={id:string;kind:ImportKind;state:'preview'|'processing'|'completed'|'canceled'|'expired';version:number;total:number;expires_at:string;created_at:string;counts:Record<RowState,number>;rows?:{items:Row[];total:number;page:number;pageSize:number}}
export const stateLabels:Record<string,string>={preview:'Prévia — nada importado',processing:'Importação em andamento',completed:'Importação concluída',canceled:'Importação cancelada',expired:'Prévia expirada',valid:'Válido',invalid:'Inválido',duplicate:'Duplicado potencial',conflict:'Possível conflito',imported:'Importado',ignored:'Ignorado',rejected:'Rejeitado',erased:'Referência eliminada'}
export const errorLabels:Record<string,string>={invalid_fields:'Confira os campos e os formatos informados para esta importação.',unsafe_cell:'Fórmulas e caracteres inseguros não são aceitos.',destination_changed:'O destino mudou ou surgiu possível duplicidade. Faça nova prévia.',invalid_reference:'Referência de exercício/versão indisponível ou não autorizada.',expired:'Dados temporários expirados.',canceled:'Registro não processado após cancelamento.',privacy:'Dados temporários removidos por procedimento de privacidade.'}
export const schemaFor=(kind:ImportKind)=>kind==='students'?studentFields:kind==='exercises'?exerciseFields:templateFields
