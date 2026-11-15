import { StudentPage } from '@/modules/students/student-page'
export const metadata={title:'Alunos | FormFisik'}
export default async function Page({params}:{params:Promise<{id:string}>}){return <StudentPage mode="edit" id={(await params).id}/>}
