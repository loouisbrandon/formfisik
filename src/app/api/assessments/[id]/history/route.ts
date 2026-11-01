import {createAssessmentHandler} from '@/server/assessments/handlers'
export const runtime='nodejs'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return createAssessmentHandler('history')(request,(await context.params).id)}
