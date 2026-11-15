import {reportHandler} from '@/server/physical-reports/handlers'
export const runtime='nodejs'
export async function GET(r:Request,c:{params:Promise<{id:string}>}){return reportHandler('read')(r,(await c.params).id)}
export async function DELETE(r:Request,c:{params:Promise<{id:string}>}){return reportHandler('discard')(r,(await c.params).id)}
