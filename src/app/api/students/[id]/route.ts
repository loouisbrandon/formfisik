import { createStudentHandler } from '@/server/students/handlers'
export const runtime='nodejs'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createStudentHandler('get')(request,(await context.params).id)}
export async function PUT(request:Request,context:{params:Promise<{id:string}>}){return createStudentHandler('edit')(request,(await context.params).id)}
