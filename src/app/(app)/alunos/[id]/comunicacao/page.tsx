import {CommunicationPage} from '@/modules/communication/page'
export const metadata={title:'Comunicação do aluno | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){return <CommunicationPage studentId={(await params).id}/>}
