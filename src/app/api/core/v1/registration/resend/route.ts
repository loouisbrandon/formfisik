import {personalRegistrationHandler} from '@/server/core/personal-registration'
export const runtime='nodejs'
export const POST=personalRegistrationHandler('resend')
