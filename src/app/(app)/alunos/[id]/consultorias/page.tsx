import {notFound} from 'next/navigation'
import {z} from '@/lib/validation'
import {ConsultancyPage} from '@/modules/consultancies/page'
export const metadata={title:'Consultorias do aluno | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();return <ConsultancyPage studentId={id}/>}
