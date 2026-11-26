import {recoveryHandler} from '@/server/core/recovery'
export const runtime='nodejs'
export const POST=recoveryHandler('request')
