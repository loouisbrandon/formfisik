import {IntakePage} from '@/modules/intake/page'
import {notFound} from 'next/navigation'
import {z} from '@/lib/validation'
export const metadata={title:'Anamneses do aluno | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();return <IntakePage studentId={id}/>}
