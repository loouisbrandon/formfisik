import {notFound} from 'next/navigation'
import {requireUser} from '@/server/current-user'
import {canModerate} from '@/server/exercises/repository'
import {ExerciseArea} from '@/modules/exercises/area'
export const metadata={title:'Moderação de exercícios | FormFisik'}
export default async function Page(){const user=await requireUser();if(!await canModerate(user.id))notFound();return <ExerciseArea moderation/>}
