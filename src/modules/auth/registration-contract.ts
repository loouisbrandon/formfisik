import {z} from '@/lib/validation'
import {registrationSchema} from '@/modules/registration/schema'
import {opaque} from './mobile-contract'
export const legalReference=z.object({kind:z.enum(['terms','privacy']),version:z.string().min(1).max(80),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict()
export const legalAcceptance=z.object({documents:z.array(legalReference).length(2).refine(v=>new Set(v.map(x=>x.kind)).size===2),termsAccepted:z.literal(true),privacyAcknowledged:z.literal(true)}).strict()
export const personalRegistration=registrationSchema.safeExtend({legal:legalAcceptance,operationId:z.uuid()})
export const personalVerification=z.object({verificationId:opaque,code:z.string().regex(/^\d{6}$/)}).strict()
export const personalResend=z.object({verificationId:opaque}).strict()
export const legalStatusInput=z.object({accessToken:opaque}).strict()
export const legalAcceptInput=z.object({accessToken:opaque,legal:legalAcceptance,operationId:z.uuid()}).strict()
export type LegalDocument={kind:'terms'|'privacy';version:string;sha256:string;title:string;content:string;url:string|null;effectiveAt:string;synthetic:boolean}
export type LegalMetadata={registrationAvailable:boolean;documents:LegalDocument[];reason:'legal_unpublished'|null}
export const legalDocumentSchema=z.object({kind:z.enum(['terms','privacy']),version:z.string().min(1).max(80),sha256:z.string().regex(/^[a-f0-9]{64}$/),title:z.string().min(1).max(160),content:z.string().max(12288),url:z.string().max(2048).nullable(),effectiveAt:z.iso.datetime(),synthetic:z.boolean()}).strict()
export const registrationErrorCodes=['legal_unpublished','legal_version_changed','invalid_verification','invalid_request','rate_limited','dependency_unavailable','session_invalid','session_expired','session_revoked','access_expired'] as const
