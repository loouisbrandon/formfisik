import {z} from '@/lib/validation'
import {loginSchema} from './schema'
export const opaque=z.string().regex(/^[\w-]{43}$/)
export const deviceSchema=z.object({installationId:z.uuid(),label:z.string().trim().min(1).max(80),platform:z.enum(['android','ios'])}).strict()
export const mobileLogin=loginSchema.extend({device:deviceSchema,operationId:z.uuid()}).strict()
export const mobileRefresh=z.object({refreshToken:opaque,operationId:z.uuid(),retrySecret:opaque}).strict()
export const mobileInspect=z.object({accessToken:opaque,interaction:z.boolean().default(false)}).strict()
export const mobileLogout=z.union([z.object({accessToken:opaque}).strict(),z.object({refreshToken:opaque}).strict()])
export const mobileChoice=z.object({challengeToken:opaque,revokeSessionId:z.uuid(),operationId:z.uuid()}).strict()
export type MobileIdentity={id:string;fullName:string;email:string;role:string;capabilities:string[]}
export type MobileSessionEnvelope={accessToken:string;refreshToken:string;sessionId:string;expiresIn:300;identity:MobileIdentity}
export type SessionChoice={id:string;kind:'web'|'mobile';label:string;lastRelevantAt:string}
export type SessionLimitEnvelope={error:{code:'session_limit'};challengeToken:string;sessions:SessionChoice[]}
export const mobileErrorCodes=['invalid_credentials','session_invalid','access_expired','session_expired','session_revoked','session_limit','challenge_invalid','refresh_reuse','refresh_recovery_expired','refresh_conflict','rate_limited','dependency_unavailable','invalid_request'] as const
