import 'server-only'
import { createHash,createHmac, randomBytes } from 'node:crypto'
import { parseCookie, stringifySetCookie } from 'cookie'
import { db } from './db'
import { config } from './config'

export const IDLE_SECONDS = 30 * 60
export const ABSOLUTE_SECONDS = 12 * 60 * 60
export const sessionDigest = (token: string) => createHash('sha256').update(token).digest('hex')
export const cookieName = () => process.env.NODE_ENV === 'production' ? '__Host-formfisik-session' : 'formfisik-session'
export function sessionToken(cookieHeader: string | null): string | undefined {
  const value = parseCookie(cookieHeader || '')[cookieName()]
  return value && /^[\w-]{43}$/.test(value) ? value : undefined
}
export function sessionCookie(token: string, expires: Date) {
  return stringifySetCookie({ name: cookieName(), value: token, httpOnly: true, secure: config().production, sameSite: 'lax', path: '/', expires })
}
export function clearSessionCookie() {
  return stringifySetCookie({ name: cookieName(), value: '', httpOnly: true, secure: config().production, sameSite: 'lax', path: '/', maxAge: 0, expires: new Date(0) })
}
export type Identity = { id: string; fullName: string; email: string; role: string }
// Public display-account correlation; never accepted as a bearer credential.
export const sessionContext=(userId:string)=>createHmac('sha256',config().abuseSecret).update('display-context:'+userId).digest('base64url')

// Atomic predicate + update: concurrent logout/expiry cannot revive a session.
// Read-only checks (API session inspection) do not prolong inactivity.
export async function readSession(token: string | undefined, touch = false): Promise<Identity | null> {
  if (!token || !/^[\w-]{43}$/.test(token)) return null
  const predicate = `s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp()
    AND s.last_seen_at>clock_timestamp()-$2*interval '1 second' AND u.email_verified_at IS NOT NULL AND u.disabled_at IS NULL`
  const result = touch
    ? await db().query(`UPDATE sessions s SET last_seen_at=clock_timestamp() FROM users u
        WHERE u.id=s.user_id AND ${predicate} RETURNING u.id,u.email,u.full_name,u.role`, [sessionDigest(token), IDLE_SECONDS])
    : await db().query(`SELECT u.id,u.email,u.full_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id
        WHERE ${predicate}`, [sessionDigest(token), IDLE_SECONDS])
  if (!result.rowCount) return null
  const row = result.rows[0]
  return { id: row.id, email: row.email, fullName: row.full_name, role: row.role }
}
export class CredentialsChanged extends Error {}
export async function createSession(userId: string, previous?: string, expectedPasswordHash?: string) {
  const token = randomBytes(32).toString('base64url')
  const client = await db().connect()
  try {
    await client.query('BEGIN')
    // Recheck user state under lock before issuing the new bearer cookie.
    const user = await client.query('SELECT id FROM users WHERE id=$1 AND email_verified_at IS NOT NULL AND disabled_at IS NULL FOR SHARE', [userId])
    if (expectedPasswordHash) {
      const credential = await client.query('SELECT user_id FROM credentials WHERE user_id=$1 AND password_hash=$2', [userId, expectedPasswordHash])
      if (!credential.rowCount) throw new CredentialsChanged()
    }
    if (!user.rowCount) throw new CredentialsChanged()
    if (previous) await client.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1 AND revoked_at IS NULL', [sessionDigest(previous)])
    const result = await client.query(`INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+$3*interval '1 second') RETURNING expires_at`, [sessionDigest(token), userId, ABSOLUTE_SECONDS])
    await client.query('COMMIT')
    return { token, expiresAt: result.rows[0].expires_at as Date }
  } catch (error) { await client.query('ROLLBACK'); throw error }
  finally { client.release() }
}
export async function revokeSession(token: string | undefined) {
  if (token) await db().query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE token_hash=$1 AND revoked_at IS NULL', [sessionDigest(token)])
}
