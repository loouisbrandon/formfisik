import {createPhotoHandler} from '@/server/progress-photos/handlers'
export const runtime='nodejs'
export async function POST(r:Request,c:{params:Promise<{id:string}>}){return createPhotoHandler('upload')(r,(await c.params).id)}
