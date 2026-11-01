import {documentHandler} from '@/server/workout-documents/handlers'
export const runtime='nodejs'
export async function GET(request:Request){return documentHandler('presentation')(request)}
export async function PUT(request:Request){return documentHandler('savePresentation')(request)}
