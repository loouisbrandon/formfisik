import {notFound} from 'next/navigation'
import {z} from '@/lib/validation'
import {AgendaPage} from '@/modules/agenda/page'
export const metadata={title:'Atendimentos do aluno | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();return <AgendaPage studentId={id}/>}
