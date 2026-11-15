import {adminSecurityHandler} from '@/server/admin/account-security'
export const runtime='nodejs'
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return adminSecurityHandler(request,(await params).id)}
