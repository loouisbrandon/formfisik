import {createPhotoHandler} from '@/server/progress-photos/handlers'
export const runtime='nodejs'
export async function GET(r:Request,c:{params:Promise<{id:string}>}){return createPhotoHandler('history')(r,(await c.params).id)}
