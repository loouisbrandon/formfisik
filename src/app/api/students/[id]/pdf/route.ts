import { createStudentHandler } from '@/server/students/handlers'
export const runtime='nodejs'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createStudentHandler('pdf')(request,(await context.params).id)}
