import {createExerciseHandler} from '@/server/exercises/handlers'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return createExerciseHandler('status')(request,(await context.params).id)}
