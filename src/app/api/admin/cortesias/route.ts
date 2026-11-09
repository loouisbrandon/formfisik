import {complimentaryHandler} from '@/server/admin/complimentary'
export const runtime='nodejs'
export async function POST(request:Request){return complimentaryHandler(request)}
