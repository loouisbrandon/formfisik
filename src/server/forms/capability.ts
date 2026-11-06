import 'server-only'
import {createHash,randomBytes} from 'node:crypto'
/** Shared invitation primitive; a capability authorizes one submission, never a person or account. */
export const capabilityDigest=(value:string)=>createHash('sha256').update(value).digest('hex')
export const newCapability=()=>randomBytes(32).toString('base64url')
export const validCapability=(value:string)=>/^[\w-]{43}$/.test(value)
