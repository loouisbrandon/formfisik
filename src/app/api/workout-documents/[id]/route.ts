import {documentHandler} from '@/server/workout-documents/handlers'
export const runtime='nodejs'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return documentHandler('read')(request,(await context.params).id)}
