import 'server-only'
import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import { db } from './db'
import { config } from './config'

export const privateHeaders = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'Vary': 'Cookie' }
export const reply = (body: object, status: number, extra = {}) => Response.json(body, { status, headers: { ...privateHeaders, ...extra } })
export class RateLimit extends Error {}
export class BadRequest extends Error {}

export async function jsonBody(request: Request, maxBytes = 8192): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new BadRequest()
  const reader = request.body?.getReader()
  if (!reader) throw new BadRequest()
  let size = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > maxBytes) { await reader.cancel(); throw new BadRequest() }
      chunks.push(value)
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch { throw new BadRequest() }
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === config().appUrl && request.headers.get('sec-fetch-site') !== 'cross-site'
}
export function clientAddress(request: Request) {
  const name = process.env.TRUSTED_CLIENT_IP_HEADER
  const value = name ? request.headers.get(name)?.trim() : undefined
  return value && isIP(value) ? value : 'shared-untrusted-ingress'
}
export async function limit(key: string, max: number, seconds: number) {
  const keyHash = createHmac('sha256', config().abuseSecret).update(key).digest('hex')
  const result = await db().query(`INSERT INTO abuse_limits(key,attempts,expires_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN abuse_limits.expires_at<=now() THEN 1 ELSE abuse_limits.attempts+1 END,
    expires_at=CASE WHEN abuse_limits.expires_at<=now() THEN EXCLUDED.expires_at ELSE abuse_limits.expires_at END RETURNING attempts`, [keyHash, seconds])
  if (result.rows[0].attempts > max) throw new RateLimit()
}
export function failure(error: unknown, event = 'registration_dependency_unavailable') {
  if (error instanceof RateLimit) return reply({ message: 'Muitas tentativas. Aguarde e tente novamente.' }, 429, { 'Retry-After': '900' })
  if (error instanceof BadRequest) return reply({ message: 'Envie um formulário válido.' }, 400)
  console.error(event)
  return reply({ message: 'Não foi possível concluir agora. Tente novamente em alguns minutos.' }, 503)
}
