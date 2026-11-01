import {createWorkoutHandler} from '@/server/workouts/handlers'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createWorkoutHandler('history')(request,(await context.params).id)}
