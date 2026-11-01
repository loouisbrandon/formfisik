import 'server-only'
import { randomBytes } from 'node:crypto'
import { hash, verify, argon2id } from 'argon2'
import { setTimeout as delay } from 'node:timers/promises'
import { loginSchema, invalidCredentials } from '../modules/auth/schema'
import { db } from './db'
import { clientAddress, failure, jsonBody, limit, reply, sameOrigin } from './http'
import { accessFor, destinationFor } from './access'
import { CredentialsChanged, clearSessionCookie, createSession, readSession, revokeSession, sessionCookie, sessionToken } from './sessions'

// Lazy per-process dummy hash uses the SAME Argon2 work as real credentials.
// Existing/non-existing/unconfirmed accounts all perform password verification.
let dummy: Promise<string> | undefined
function dummyHash() {
  return dummy ??= hash(randomBytes(32), { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
}
const unauthenticated = () => reply({ message: 'Sua sessão não está disponível. Entre novamente.' }, 401, { 'Set-Cookie': clearSessionCookie() })

export async function login(request: Request) {
  const started = Date.now()
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`login:ip:${clientAddress(request)}`, 20, 900)
    await limit('login:global', 100, 60)
    const parsed = loginSchema.safeParse(await jsonBody(request))
    if (!parsed.success) return reply({ message: 'Confira os campos informados.', errors: parsed.error.flatten().fieldErrors }, 400)
    const { email, password } = parsed.data
    await limit(`login:email:${email}`, 5, 900)
    const result = await db().query(`SELECT u.id,u.role,u.email_verified_at,c.password_hash FROM users u
      JOIN credentials c ON c.user_id=u.id WHERE u.email=$1`, [email])
    const user = result.rows[0]
    const valid = await verify(user?.password_hash || await dummyHash(), password)
    if (!user || !valid || !user.email_verified_at) {
      console.info('auth_login_rejected')
      return reply({ message: invalidCredentials }, 401)
    }
    const session = await createSession(user.id, sessionToken(request.headers.get('cookie')), user.password_hash)
    console.info('auth_login_succeeded')
    return reply({ destination: destinationFor(user) }, 200, { 'Set-Cookie': sessionCookie(session.token, session.expiresAt) })
  } catch (error) {
    if (error instanceof CredentialsChanged) return reply({ message: invalidCredentials }, 401)
    return failure(error, 'auth_dependency_unavailable')
  }
  finally { await delay(Math.max(0, 750 - (Date.now() - started))) }
}
export async function logout(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await jsonBody(request)
    await revokeSession(sessionToken(request.headers.get('cookie')))
    console.info('auth_logout_completed')
    return reply({ destination: '/login' }, 200, { 'Set-Cookie': clearSessionCookie() })
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
export async function getSession(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return unauthenticated()
    return reply({ user, access: await accessFor(user) }, 200)
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
export async function getAccount(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return unauthenticated()
    if (user.role !== 'professional') return reply({ message: 'Acesso não permitido para este perfil.' }, 403)
    // Identity always comes from the session; no caller-selected user ID.
    return reply({ user, access: await accessFor(user) }, 200)
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
// Deny-by-default commercial boundary with fresh canonical verification.
export async function paidAccess(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return unauthenticated()
    const access = await accessFor(user,true)
    return reply({ message: access.paidAccess ? 'Assinatura elegível confirmada no servidor.' : 'Acesso pago indisponível para esta conta.', access }, access.paidAccess ? 200 : 403)
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
