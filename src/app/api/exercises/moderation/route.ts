import {createExerciseHandler} from '@/server/exercises/handlers'
export function GET(request:Request){return createExerciseHandler('queue')(request)}
