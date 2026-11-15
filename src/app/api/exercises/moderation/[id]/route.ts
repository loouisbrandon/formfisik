import {createExerciseHandler} from '@/server/exercises/handlers'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createExerciseHandler('reviewDetail')(request,(await context.params).id)}
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return createExerciseHandler('review')(request,(await context.params).id)}
