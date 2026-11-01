import {createExerciseHandler} from '@/server/exercises/handlers'
export function GET(request:Request){return createExerciseHandler('requests')(request)}
export function POST(request:Request){return createExerciseHandler('submit')(request)}
