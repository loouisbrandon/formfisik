import {createExerciseHandler} from '@/server/exercises/handlers'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createExerciseHandler('get')(request,(await context.params).id)}
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){return createExerciseHandler('edit')(request,(await context.params).id)}
