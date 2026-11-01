import {createWorkoutHandler} from '@/server/workouts/handlers'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return createWorkoutHandler('status')(request,(await context.params).id)}
