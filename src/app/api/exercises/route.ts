import {createExerciseHandler} from '@/server/exercises/handlers'
export function GET(request:Request){return createExerciseHandler('list')(request)}
export function POST(request:Request){return createExerciseHandler('create')(request)}
