import {productDownload} from '@/server/products/handlers'
export const runtime='nodejs'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return productDownload(request,(await params).id)}
