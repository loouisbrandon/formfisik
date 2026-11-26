import {z} from '@/lib/validation'
import {workoutFields,divisionSchema,type WorkoutFields,type Workout} from './schema'
// Structural safety is required during editing; publication retains all business refinements.
export const draftFields=z.object({...workoutFields.shape,name:z.string().max(160),divisions:z.array(z.object({...divisionSchema.shape,name:z.string().max(120)}).strict()).max(30)}).strict().refine(f=>f.divisions.reduce((n,d)=>n+d.exercises.length,0)<=300&&f.divisions.reduce((n,d)=>n+d.exercises.reduce((s,e)=>s+e.sets.length,0),0)<=1000,'Limite de exercícios ou séries excedido.')
export const draftContext=z.string().regex(/^(new:(template|individual)(:[0-9a-f-]{36})?|edit:[0-9a-f-]{36})$/).max(80)
export const draftReference=z.object({context:draftContext,revision:z.int().positive()}).strict()
export const saveDraft=z.object({context:draftContext,revision:z.int().min(0),baseVersion:z.int().min(0),fields:draftFields}).strict()
export type WorkoutDraft={context:string;revision:number;baseVersion:number;fields:WorkoutFields;studentName:string|null;exerciseDefinitions:Workout['exerciseDefinitions'];updatedAt:string}
export type DraftSummary={context:string;name:string;kind:WorkoutFields['kind'];studentName:string|null;updatedAt:string}
export function editorContext(id:string,kind:WorkoutFields['kind'],studentId?:string){return id?'edit:'+id:'new:'+kind+(studentId?':'+studentId:'')}
export function draftHref(context:string){if(context.startsWith('edit:'))return '/treinos/'+context.slice(5)+'/editar';const [,kind,studentId]=context.split(':');return '/treinos/novo?kind='+kind+(studentId?'&studentId='+studentId:'')}
