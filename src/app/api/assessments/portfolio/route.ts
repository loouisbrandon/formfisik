import {createAssessmentHandler} from '@/server/assessments/handlers'
export const runtime='nodejs'
export async function GET(request:Request){return createAssessmentHandler('portfolio')(request)}
