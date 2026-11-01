import {createAssessmentHandler} from '@/server/assessments/handlers'
export const runtime='nodejs'
export async function GET(request:Request){return createAssessmentHandler('list')(request)}
export async function POST(request:Request){return createAssessmentHandler('create')(request)}
