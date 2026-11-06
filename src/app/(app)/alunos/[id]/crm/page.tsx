import {CrmPage} from '@/modules/crm/page'
import {notFound} from 'next/navigation'
import {z} from '@/lib/validation'
export const metadata={title:'Atendimento do aluno | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();return <CrmPage studentId={id}/>}
