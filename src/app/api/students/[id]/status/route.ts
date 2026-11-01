import { createStudentHandler } from '@/server/students/handlers'
export const runtime='nodejs'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return createStudentHandler('status')(request,(await context.params).id)}
