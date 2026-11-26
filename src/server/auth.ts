import 'server-only'
import { setTimeout as delay } from 'node:timers/promises'
import { loginSchema, invalidCredentials } from '../modules/auth/schema'
import { db } from './db'
import { clientAddress, failure, jsonBody, limit, reply, sameOrigin } from './http'
import { accessFor, destinationFor } from './access'
import { CredentialsChanged, clearSessionCookie, createSession, readSession, revokeSession, sessionCookie, sessionToken,sessionContext } from './sessions'
import {SessionLimit,createChallenge} from './core/logical-sessions'
import {verifyCredentials} from './credential-verification'

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
    const user = await verifyCredentials(email,password)
    if (!user) {
      console.info('auth_login_rejected')
      return reply({ message: invalidCredentials }, 401)
    }
    let session
    try{session = await createSession(user.id, sessionToken(request.headers.get('cookie')), user.password_hash)}catch(error){
      if(!(error instanceof SessionLimit))throw error
      const c=await db().connect()
      try{await c.query('BEGIN');const live=await c.query('SELECT c.password_hash FROM users u JOIN credentials c ON c.user_id=u.id WHERE u.id=$1 AND u.disabled_at IS NULL AND u.email_verified_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM account_closures x WHERE x.user_id=u.id AND x.effective_at<=clock_timestamp()) FOR UPDATE OF u',[user.id]);if(live.rows[0]?.password_hash!==user.password_hash)throw new CredentialsChanged();const challenge=await createChallenge(c,user.id,user.password_hash,'web');await c.query('COMMIT');return reply(challenge,409)}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
    }
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
    await limit(`session-read:${user.id}`, 120, 60)
    return reply({ authenticated: true,context:sessionContext(user.id) }, 200)
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
export async function getAccount(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return unauthenticated()
    if (user.role !== 'professional') return reply({ message: 'Acesso não permitido para este perfil.' }, 403)
    await limit(`account-read:${user.id}`, 90, 60)
    // Identity always comes from the session; no caller-selected user ID.
    return reply({ user, access: await accessFor(user) }, 200)
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
// Deny-by-default commercial boundary with fresh canonical verification.
export async function paidAccess(request: Request) {
  try {
    const user = await readSession(sessionToken(request.headers.get('cookie')))
    if (!user) return unauthenticated()
    await limit(`paid-access-read:${user.id}`, 30, 60)
    const access = await accessFor(user,true)
    return reply({ message: access.paidAccess ? 'Assinatura elegível confirmada no servidor.' : 'Acesso pago indisponível para esta conta.', access }, access.paidAccess ? 200 : 403)
  } catch (error) { return failure(error, 'auth_dependency_unavailable') }
}
