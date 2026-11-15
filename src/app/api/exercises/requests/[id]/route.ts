import {createExerciseHandler} from '@/server/exercises/handlers'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createExerciseHandler('request')(request,(await context.params).id)}
