import {createPhotoHandler} from '@/server/progress-photos/handlers'
export const runtime='nodejs'
export async function GET(r:Request){return createPhotoHandler('list')(r)}
export async function POST(r:Request){return createPhotoHandler('create')(r)}
