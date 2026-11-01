import {createPhotoHandler} from '@/server/progress-photos/handlers'
export const runtime='nodejs'
export async function GET(r:Request,c:{params:Promise<{id:string}>}){return createPhotoHandler('get')(r,(await c.params).id)}
export async function PUT(r:Request,c:{params:Promise<{id:string}>}){return createPhotoHandler('edit')(r,(await c.params).id)}
