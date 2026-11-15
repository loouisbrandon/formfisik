import {documentHandler} from '@/server/workout-documents/handlers'
export const runtime='nodejs'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return documentHandler('generate')(request,(await context.params).id)}
