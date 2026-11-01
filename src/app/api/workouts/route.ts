import {createWorkoutHandler} from '@/server/workouts/handlers'
export async function GET(request:Request){return createWorkoutHandler('list')(request)}
export async function POST(request:Request){return createWorkoutHandler('create')(request)}
