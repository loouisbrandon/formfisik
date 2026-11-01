import {createWorkoutHandler} from '@/server/workouts/handlers'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return createWorkoutHandler('duplicate')(request,(await context.params).id)}
