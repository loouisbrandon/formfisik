import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import {Suspense} from 'react'
import {TutorialsArea} from '@/modules/tutorials/area'
export const metadata={title:'Central de Tutoriais | FormFisik',robots:{index:false,follow:false}}
export default function TutorialsPage(){return <Suspense fallback={<LoadingSkeleton label="Carregando tutoriais…"/>}><TutorialsArea/></Suspense>}
