import {z} from '@/lib/validation'
import {demoReference} from '../media/schema'
const text=(max:number)=>z.string().trim().normalize('NFC').max(max,`Use até ${max} caracteres.`).refine(v=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),'Remova caracteres de controle.')
const date=z.union([z.literal(''),z.iso.date()])
export const repetition=z.discriminatedUnion('mode',[
 z.object({mode:z.literal('reps'),value:z.int().min(1).max(1000).nullable(),perSide:z.boolean()}).strict(),
 z.object({mode:z.literal('range'),min:z.int().min(1).max(1000).nullable(),max:z.int().min(1).max(1000).nullable(),perSide:z.boolean()}).strict().refine(v=>v.max===null||v.min===null||v.max>=v.min,'Intervalo de repetições inválido.'),
 z.object({mode:z.literal('failure')}).strict(),
 z.object({mode:z.literal('duration'),seconds:z.int().min(1).max(86400).nullable()}).strict(),
])
export const prescribedSet=z.object({id:z.uuid(),repetition,load:z.number().min(0).max(100000).nullable(),unit:z.enum(['kg','lb','percent','bodyweight']),restSeconds:z.int().min(0).max(86400).nullable(),executionSeconds:z.int().min(1).max(86400).nullable(),phase:z.enum(['work','drop','rest_pause']),notes:text(500)}).strict()
export const prescribedExercise=z.object({id:z.uuid(),exerciseId:z.uuid(),exerciseVersion:z.int().positive(),demos:z.array(demoReference).max(10).refine(v=>new Set(v.map(x=>x.videoId)).size===v.length,'Demonstração repetida.').optional(),technique:z.enum(['standard','drop_set','rest_pause']),sets:z.array(prescribedSet).max(50),notes:text(1000)}).strict()
export const groupSchema=z.object({id:z.uuid(),technique:z.enum(['bi_set','tri_set','superset','circuit']),members:z.array(z.uuid()).min(2).max(50),roundRestSeconds:z.int().min(0).max(86400).nullable(),notes:text(500)}).strict()
export const divisionSchema=z.object({id:z.uuid(),name:text(120).min(1,'Nomeie a divisão.'),description:text(1000),notes:text(1000),exercises:z.array(prescribedExercise).max(100),groups:z.array(groupSchema).max(50)}).strict()
export const workoutFields=z.object({kind:z.enum(['individual','template']),studentId:z.uuid().nullable(),name:text(160).min(2,'Informe o nome do planejamento.'),objective:text(1000),notes:text(3000),startDate:date,endDate:date,divisions:z.array(divisionSchema).max(30)}).strict().superRefine((v,c)=>{
 const issue=(message:string)=>c.addIssue({code:'custom',message})
 if((v.kind==='individual')!==!!v.studentId)issue('Selecione um aluno para a ficha individual; modelos não possuem aluno.')
 if(v.kind==='template'&&(v.startDate||v.endDate))issue('Datas pertencem à ficha individual.')
 if(v.startDate&&v.endDate&&v.endDate<v.startDate)issue('A data final deve ser posterior ou igual à inicial.')
 const ids=new Set<string>();let total=0,totalSets=0
 const unique=(id:string)=>{if(ids.has(id))issue('Identificadores internos repetidos.');ids.add(id)}
 for(const d of v.divisions){unique(d.id);const grouped=new Set<string>();total+=d.exercises.length;const members=new Set(d.exercises.map(e=>e.id));for(const e of d.exercises){unique(e.id);for(const s of e.sets){unique(s.id);totalSets++}if(e.sets.length&&e.sets[0].phase!=='work')issue('A primeira etapa deve iniciar uma série normal.');if(e.technique==='drop_set'&&e.sets.some(s=>s.phase==='rest_pause'))issue('Drop-set não contém retomadas rest-pause.');if(e.technique==='rest_pause'&&e.sets.some(s=>s.phase==='drop'))issue('Rest-pause não contém etapas de drop-set.');if(e.technique==='drop_set'&&e.sets.length&&(!e.sets.some(s=>s.phase==='drop')||e.sets.length<2))issue('Drop-set exige pelo menos duas etapas e uma redução marcada.');if(e.technique==='rest_pause'&&e.sets.length&&(!e.sets.some(s=>s.phase==='rest_pause')||e.sets.length<2))issue('Rest-pause exige pelo menos duas etapas e uma retomada marcada.');if(e.technique==='standard'&&e.sets.some(s=>s.phase!=='work'))issue('Série convencional usa etapas normais.')}
 for(const g of d.groups){unique(g.id);if(g.members.length!==new Set(g.members).size)issue('Exercício repetido no grupo.');if((['bi_set','superset'].includes(g.technique)&&g.members.length!==2)||(g.technique==='tri_set'&&g.members.length!==3))issue('Quantidade de exercícios incompatível com a técnica.');for(const id of g.members){if(!members.has(id)||grouped.has(id))issue('O grupo deve conter exercícios desta divisão, sem participação duplicada.');grouped.add(id)}}}
 if(totalSets>1000)issue('Use até 1000 séries por planejamento.');if(total>300)issue('Use até 300 exercícios por planejamento.')
})
export const createWorkout=workoutFields.safeExtend({creationKey:z.uuid()})
export const editWorkout=workoutFields.safeExtend({version:z.int().positive()})
export const statusWorkout=z.object({version:z.int().positive(),state:z.enum(['draft','active','archived'])}).strict()
export const copyWorkout=z.object({version:z.int().positive(),creationKey:z.uuid(),name:text(160).min(2)}).strict()
export const applyWorkout=z.object({version:z.int().positive(),creationKey:z.uuid(),studentIds:z.array(z.uuid()).min(1).max(50).refine(v=>v.length===new Set(v).size,'Alunos repetidos.')}).strict()
export const workoutQuery=z.object({q:text(160).default(''),kind:z.enum(['all','individual','template']).default('all'),state:z.enum(['all','draft','active','archived']).default('all'),studentId:z.uuid().optional(),sort:z.enum(['updated','name_asc','name_desc']).default('updated'),page:z.coerce.number().int().min(1).max(10000).default(1)}).strict()
export type WorkoutFields=z.infer<typeof workoutFields>
export type Division=z.infer<typeof divisionSchema>
export type PrescribedExercise=z.infer<typeof prescribedExercise>
export type PrescribedSet=z.infer<typeof prescribedSet>
export type WorkoutState='draft'|'active'|'archived'
export type Workout={id:string;version:number;state:WorkoutState;fields:WorkoutFields;studentName:string|null;professionalName:string;sourceTemplateId:string|null;sourceTemplateVersion:number|null;copiedFromId:string|null;copiedFromVersion:number|null;createdAt:string;updatedAt:string;exerciseDefinitions:Record<string,{name:string;category:string;instructions:string[]}>}
export type WorkoutSummary=Pick<Workout,'id'|'version'|'state'|'studentName'|'updatedAt'>&{name:string;kind:WorkoutFields['kind'];divisionCount:number;exerciseCount:number}
export const stateLabels={draft:'Rascunho',active:'Ativo',archived:'Arquivado'}
export const techniqueLabels={standard:'Convencional',drop_set:'Drop-set',rest_pause:'Rest-pause',bi_set:'Bi-set',tri_set:'Tri-set',superset:'Superset',circuit:'Circuito'}
export function emptyWorkout(kind:WorkoutFields['kind']='template',studentId:string|null=null):WorkoutFields{return {kind,studentId,name:'',objective:'',notes:'',startDate:'',endDate:'',divisions:[]}}
export function cloneDivisions(divisions:Division[]):Division[]{return divisions.map(d=>{const map=new Map(d.exercises.map(e=>[e.id,crypto.randomUUID()]));return {...d,id:crypto.randomUUID(),exercises:d.exercises.map(e=>({...e,id:map.get(e.id)!,sets:e.sets.map(s=>({...s,repetition:{...s.repetition},id:crypto.randomUUID()}))})),groups:d.groups.map(g=>({...g,id:crypto.randomUUID(),members:g.members.map(id=>map.get(id)!)}))}})}
export function newSet():PrescribedSet{return {id:crypto.randomUUID(),repetition:{mode:'reps',value:null,perSide:false},load:null,unit:'kg',restSeconds:null,executionSeconds:null,phase:'work',notes:''}}
export function activationIssue(f:WorkoutFields){if(!f.objective.trim())return 'Informe o objetivo antes de ativar.';if(!f.divisions.length||f.divisions.some(d=>!d.exercises.length||d.exercises.some(e=>!e.sets.length)))return 'Todas as divisões precisam de exercícios com séries antes de ativar.';for(const d of f.divisions)for(const e of d.exercises)for(const s of e.sets){const r=s.repetition;if((r.mode==='reps'&&r.value===null)||(r.mode==='range'&&(r.min===null||r.max===null))||(r.mode==='duration'&&r.seconds===null))return 'Preencha as repetições ou o tempo de todas as séries antes de ativar.'}return null}

export function setCountLabel(e:PrescribedExercise){return e.technique==='standard'?`${e.sets.length} séries`:`${e.sets.filter(s=>s.phase==='work').length} séries · ${e.sets.length} etapas`}

export type AppliedPlan=Pick<Workout,'id'|'version'|'state'|'studentName'|'sourceTemplateId'|'sourceTemplateVersion'>&{studentId:string}
