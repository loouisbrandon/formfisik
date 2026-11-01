import {createAssessmentHandler} from '@/server/assessments/handlers'
export const runtime='nodejs'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return createAssessmentHandler('status')(request,(await context.params).id)}
