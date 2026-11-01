import {WorkoutPage} from '@/modules/workouts/page'
export const metadata={title:'Treinos | FormFisik'}
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;const {id}=await params;return <WorkoutPage mode="view" id={id} studentId={typeof q.studentId==='string'?q.studentId:undefined} kind={q.kind==='individual'||q.kind==='template'?q.kind:undefined} applyTo={typeof q.applyTo==='string'?q.applyTo:undefined}/> }
