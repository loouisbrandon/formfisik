import {notFound} from 'next/navigation'
import {z} from '@/lib/validation'
import {CheckinPage} from '@/modules/checkins/page'
export const metadata={title:'Check-ins do aluno | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();return <CheckinPage studentId={id}/>}
