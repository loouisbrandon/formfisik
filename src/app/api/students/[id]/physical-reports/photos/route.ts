import {reportHandler} from '@/server/physical-reports/handlers'
export const runtime='nodejs'
export async function GET(r:Request,c:{params:Promise<{id:string}>}){return reportHandler('photos')(r,(await c.params).id)}
