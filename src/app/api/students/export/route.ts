import { createStudentHandler } from '@/server/students/handlers'
export const runtime='nodejs'
const exportStudents=createStudentHandler('export')
export function GET(request:Request){return exportStudents(request)}
