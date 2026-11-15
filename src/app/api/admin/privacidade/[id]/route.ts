import {privacyDecisionHandler} from '@/server/admin/privacy-decisions'
export const runtime='nodejs'
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return privacyDecisionHandler(request,(await params).id)}
