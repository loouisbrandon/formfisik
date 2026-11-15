import {AssessmentPage} from '@/modules/assessments/page'
export const metadata={title:'Acompanhamento individual | FormFisik',robots:{index:false,follow:false}}
export default async function Page({params}:{params:Promise<{studentId:string}>}){return <AssessmentPage studentId={(await params).studentId}/>}
