import {WorkoutPage} from '@/modules/workouts/page'
export const metadata={title:'Treinos | FormFisik'}
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;return <WorkoutPage mode="list" studentId={typeof q.studentId==='string'?q.studentId:undefined} kind={q.kind==='individual'||q.kind==='template'?q.kind:undefined} applyTo={typeof q.applyTo==='string'?q.applyTo:undefined}/> }
