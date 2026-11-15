import {createWorkoutHandler} from '@/server/workouts/handlers'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createWorkoutHandler('get')(request,(await context.params).id)}
export async function PUT(request:Request,context:{params:Promise<{id:string}>}){return createWorkoutHandler('edit')(request,(await context.params).id)}
