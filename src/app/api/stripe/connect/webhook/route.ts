import {connectWebhook} from '@/server/finance/handlers'
export const runtime='nodejs'
export const POST=connectWebhook()
