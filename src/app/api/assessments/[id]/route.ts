import {createAssessmentHandler} from '@/server/assessments/handlers'
export const runtime='nodejs'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createAssessmentHandler('get')(request,(await context.params).id)}
export async function PUT(request:Request,context:{params:Promise<{id:string}>}){return createAssessmentHandler('edit')(request,(await context.params).id)}
