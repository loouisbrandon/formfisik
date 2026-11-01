import {createExerciseHandler} from '@/server/exercises/handlers'
export function POST(request:Request){return createExerciseHandler('selection')(request)}
