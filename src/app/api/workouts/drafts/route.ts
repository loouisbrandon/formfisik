import {createWorkoutHandler} from '@/server/workouts/handlers'
export async function GET(request:Request){return createWorkoutHandler(new URL(request.url).searchParams.has('context')?'draft-get':'draft-list')(request)}
export async function PUT(request:Request){return createWorkoutHandler('draft-save')(request)}
