import {reportHandler} from '@/server/physical-reports/handlers'
export const runtime='nodejs'
export async function GET(r:Request,c:{params:Promise<{id:string}>}){return reportHandler('candidates')(r,(await c.params).id)}
export async function POST(r:Request,c:{params:Promise<{id:string}>}){return reportHandler('generate')(r,(await c.params).id)}
