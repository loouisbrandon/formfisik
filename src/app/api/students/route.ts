import { createStudentHandler } from '@/server/students/handlers'
export const runtime='nodejs'
const list=createStudentHandler('list'),create=createStudentHandler('create')
export function GET(request:Request){return list(request)}
export function POST(request:Request){return create(request)}
