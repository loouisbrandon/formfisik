import { before, after, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { hash, argon2id } from 'argon2'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { checkoutAvailability } from '../src/server/subscriptions/availability'
import { proPlan, proPrice } from '../src/modules/subscriptions/plan'
import { login, logout, getSession, getAccount, paidAccess } from '../src/server/auth'
import { cookieName, sessionCookie, clearSessionCookie, sessionDigest, readSession,sessionContext } from '../src/server/sessions'

const connection = process.env.TEST_DATABASE_URL
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw new Error('Use banco isolado terminado em _test')
process.env.DATABASE_URL = connection
process.env.APP_URL = 'http://localhost:3107'
process.env.ABUSE_HMAC_SECRET = randomBytes(32).toString('hex')
const password = '  frase segura de login  '
const email = 'professional@example.test'
let userId = ''
let passwordHash = ''
function request(path: string, data?: unknown, cookie?: string, origin: string | null = process.env.APP_URL!) {
  const headers = new Headers()
  if (data !== undefined) { headers.set('content-type', 'application/json'); if (origin) headers.set('origin', origin) }
  if (cookie) headers.set('cookie', cookie)
  return new Request(`${process.env.APP_URL}${path}`, { method: data === undefined ? 'GET' : 'POST', headers, body: data === undefined ? undefined : JSON.stringify(data) })
}
const credentials = (overrides = {}) => ({ email, password, ...overrides })
const signIn = (overrides = {}, cookie?: string) => login(request('/api/auth/login', credentials(overrides), cookie))
function cookieOf(response: Response) {
  const value = response.headers.get('set-cookie')
  assert.ok(value)
  return value.split(';')[0]
}
function tokenOf(cookie: string) { return cookie.split('=')[1] }
async function validCookie() {
  const response = await signIn()
  assert.equal(response.status, 200)
  return cookieOf(response)
}
before(async () => {
  await migrate(connection)
  await migrate(connection)
  passwordHash = await hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
})
beforeEach(async () => {
  await db().query('TRUNCATE sessions,credentials,users,pending_registrations,abuse_limits CASCADE')
  userId = randomUUID()
  await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,'Profissional Teste',now())", [userId, email])
  await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)', [userId, passwordHash])
})
after(async () => { await db().end() })

test('valid login issues random opaque HttpOnly cookie and persists digest only; no SMTP dependency', async () => {
  delete process.env.SMTP_HOST
  const response = await signIn({ email: email.toUpperCase() })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.deepEqual(body, { destination: '/dashboard' })
  const cookie = cookieOf(response)
  const token = tokenOf(cookie)
  assert.match(token, /^[\w-]{43}$/)
  const stored = (await db().query('SELECT * FROM sessions')).rows[0]
  assert.equal(stored.token_hash, sessionDigest(token))
  assert.equal(stored.user_id, userId)
  assert.ok(!JSON.stringify(stored).includes(token))
  assert.ok(response.headers.get('set-cookie')?.includes('HttpOnly'))
  assert.ok(response.headers.get('set-cookie')?.includes('SameSite=Lax'))
  assert.ok(!response.headers.get('set-cookie')?.includes('Domain='))
  assert.ok(response.headers.get('cache-control')?.includes('no-store'))
  assert.equal(Math.round((stored.expires_at - stored.created_at) / 1000), 43200)
  const status = await getSession(request('/api/auth/session', undefined, cookie))
  assert.equal(status.status, 200)
  const payload = await status.json()
  assert.deepEqual(payload, {authenticated:true,context:sessionContext(userId)})
  assert.ok(!JSON.stringify(payload).includes(token))
  assert.ok(!JSON.stringify(payload).includes(passwordHash))
})
test('incorrect password, unknown user and unconfirmed account have same error and no session', async () => {
  const wrong = await signIn({ password: 'wrong-password' })
  const absent = await signIn({ email: 'unknown@example.test' })
  await db().query('UPDATE users SET email_verified_at=NULL WHERE id=$1', [userId])
  const unconfirmed = await signIn()
  assert.equal(wrong.status, 401)
  assert.equal(absent.status, 401)
  assert.equal(unconfirmed.status, 401)
  const expected = await wrong.json()
  assert.deepEqual(await absent.json(), expected)
  assert.deepEqual(await unconfirmed.json(), expected)
  assert.equal((await db().query('SELECT * FROM sessions')).rowCount, 0)
})
test('unconfirmed registration attempt cannot authenticate; malformed and oversized payloads rejected', async () => {
  await db().query('DELETE FROM users WHERE id=$1', [userId])
  await db().query("INSERT INTO pending_registrations(token_hash,email,full_name,password_hash,expires_at) VALUES($1,$2,'Pending', $3,now()+interval '30 minutes')", [sessionDigest('pending-fixture'), email, passwordHash])
  assert.equal((await signIn()).status, 401)
  assert.equal((await signIn({ password: '' })).status, 400)
  assert.equal((await signIn({ password: 'x'.repeat(9000) })).status, 400)
  const invalid = new Request(process.env.APP_URL + '/api/auth/login', { method: 'POST', headers: { origin: process.env.APP_URL!, 'content-type': 'application/json' }, body: '{' })
  assert.equal((await login(invalid)).status, 400)
})
test('session fixation prevented: successful reauthentication rotates and revokes old cookie', async () => {
  const previous = await validCookie()
  const response = await signIn({}, previous)
  const next = cookieOf(response)
  assert.notEqual(tokenOf(previous), tokenOf(next))
  assert.equal((await getSession(request('/api/auth/session', undefined, previous))).status, 401)
  assert.equal((await getSession(request('/api/auth/session', undefined, next))).status, 200)
  assert.ok((await db().query('SELECT revoked_at FROM sessions WHERE token_hash=$1', [sessionDigest(tokenOf(previous))])).rows[0].revoked_at)
  const attackerSelected = `${cookieName()}=${'a'.repeat(43)}`
  const fresh = cookieOf(await signIn({}, attackerSelected))
  assert.notEqual(tokenOf(fresh), tokenOf(attackerSelected))
})
test('idle expiry denies read, account and paid resource even if browser retains cookie', async () => {
  const cookie = await validCookie()
  await db().query("UPDATE sessions SET last_seen_at=now()-interval '31 minutes'")
  for (const handler of [getSession, getAccount, paidAccess]) {
    const response = await handler(request('/api/account', undefined, cookie))
    assert.equal(response.status, 401)
    assert.ok(response.headers.get('set-cookie')?.includes('Max-Age=0'))
  }
  assert.equal(await readSession(tokenOf(cookie), true), null)
})
test('absolute lifetime remains bounded despite recent activity', async () => {
  const cookie = await validCookie()
  await db().query("UPDATE sessions SET created_at=now()-interval '13 hours',expires_at=now()-interval '1 second',last_seen_at=now()")
  assert.equal((await getSession(request('/api/auth/session', undefined, cookie))).status, 401)
})
test('page activity refreshes idle only; passive inspection never extends session', async () => {
  const cookie = await validCookie()
  const token = tokenOf(cookie)
  await db().query("UPDATE sessions SET last_seen_at=now()-interval '10 minutes'")
  const initial = (await db().query('SELECT * FROM sessions')).rows[0]
  assert.equal((await getSession(request('/api/auth/session', undefined, cookie))).status, 200)
  assert.equal((await db().query('SELECT * FROM sessions')).rows[0].last_seen_at.getTime(), initial.last_seen_at.getTime())
  assert.ok(await readSession(token, true))
  const refreshed = (await db().query('SELECT * FROM sessions')).rows[0]
  assert.ok(refreshed.last_seen_at > initial.last_seen_at)
  assert.equal(refreshed.expires_at.getTime(), initial.expires_at.getTime())
})
test('logout revokes server state and clears cookie; replay stays rejected even in race with activity', async () => {
  const cookie = await validCookie()
  const [, response] = await Promise.all([readSession(tokenOf(cookie), true), logout(request('/api/auth/logout', {}, cookie))])
  assert.equal(response.status, 200)
  assert.ok(response.headers.get('set-cookie')?.includes('Max-Age=0'))
  assert.ok((await db().query('SELECT revoked_at FROM sessions')).rows[0].revoked_at)
  await Promise.all([readSession(tokenOf(cookie), true), readSession(tokenOf(cookie), true)])
  assert.equal((await getSession(request('/api/auth/session', undefined, cookie))).status, 401)
  assert.equal((await logout(request('/api/auth/logout', {}, cookie))).status, 200)
})
test('CSRF: login/logout reject foreign or missing Origin, wrong content type and cross-site requests', async () => {
  const cookie = await validCookie()
  for (const origin of ['https://evil.test', null]) {
    assert.equal((await login(request('/api/auth/login', credentials(), undefined, origin))).status, 403)
    assert.equal((await logout(request('/api/auth/logout', {}, cookie, origin))).status, 403)
  }
  const crossSite = request('/api/auth/logout', {}, cookie)
  crossSite.headers.set('sec-fetch-site', 'cross-site')
  assert.equal((await logout(crossSite)).status, 403)
  const text = request('/api/auth/logout', {}, cookie)
  text.headers.set('content-type', 'text/plain')
  assert.equal((await logout(text)).status, 400)
  assert.equal((await getSession(request('/api/auth/session', undefined, cookie))).status, 200)
})
test('email rate limit persists and cannot be bypassed with casing or client-supplied IP header', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await signIn({ password: 'incorrect' })).status, 401)
  const spoof = request('/api/auth/login', credentials({ email: email.toUpperCase() }))
  spoof.headers.set('x-forwarded-for', '203.0.113.1')
  const response = await login(spoof)
  assert.equal(response.status, 429)
  assert.equal(response.headers.get('retry-after'), '900')
  assert.equal((await db().query('SELECT * FROM sessions')).rowCount, 0)
})
test('missing, tampered, revoked, deleted-user and unconfirmed-user sessions fail closed', async () => {
  assert.equal((await getAccount(request('/api/account'))).status, 401)
  assert.equal((await getSession(request('/api/auth/session', undefined, `${cookieName()}=malformed`))).status, 401)
  const cookie = await validCookie()
  assert.equal((await getSession(request('/api/auth/session', undefined, `${cookieName()}=${randomBytes(32).toString('base64url')}`))).status, 401)
  await db().query('UPDATE users SET email_verified_at=NULL WHERE id=$1', [userId])
  assert.equal((await getSession(request('/api/auth/session', undefined, cookie))).status, 401)
  await db().query('DELETE FROM users WHERE id=$1', [userId])
  assert.equal((await getSession(request('/api/auth/session', undefined, cookie))).status, 401)
  assert.equal((await db().query('SELECT * FROM sessions')).rowCount, 0)
})
test('resource identity comes from cookie, not supplied ID; paid access denied and unsupported role forbidden', async () => {
  const cookie = await validCookie()
  const response = await getAccount(request('/api/account?userId=' + randomUUID(), undefined, cookie))
  assert.equal((await response.json()).user.id, userId)
  assert.equal((await paidAccess(request('/api/access', undefined, cookie))).status, 403)
  await db().query("UPDATE users SET role='student' WHERE id=$1", [userId])
  assert.equal((await getAccount(request('/api/account', undefined, cookie))).status, 403)
})
test('production cookie uses host-only Secure HttpOnly SameSite and clearing identical scope', () => {
  const env = { NODE_ENV: process.env.NODE_ENV, APP_URL: process.env.APP_URL }
  Object.assign(process.env, { NODE_ENV: 'production', APP_URL: 'https://formfisik.example' })
  try {
    const cookie = sessionCookie(randomBytes(32).toString('base64url'), new Date(Date.now() + 43200000))
    assert.ok(cookie.startsWith('__Host-formfisik-session='))
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(cookie.includes(flag))
    assert.ok(!cookie.includes('Domain='))
    assert.ok(clearSessionCookie().startsWith('__Host-formfisik-session='))
    assert.ok(clearSessionCookie().includes('Max-Age=0'))
  } finally {
    if (env.NODE_ENV === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV')
    else Object.assign(process.env, { NODE_ENV: env.NODE_ENV })
    process.env.APP_URL = env.APP_URL
  }
})
test('security events never include credentials, email, session identifier or SQL error payload', async () => {
  const messages: string[] = []
  const info = console.info
  const error = console.error
  console.info = (...args) => { messages.push(args.join(' ')) }
  console.error = (...args) => { messages.push(args.join(' ')) }
  try {
    await signIn({ password: 'wrong' })
    const cookie = await validCookie()
    await logout(request('/api/auth/logout', {}, cookie))
    assert.ok(messages.includes('auth_login_succeeded'))
    for (const secret of [email, password, passwordHash, tokenOf(cookie)]) assert.ok(!messages.join(' ').includes(secret))
    assert.ok(messages.every(message => /^auth_[a-z_]+$/.test(message) || (()=>{const e=JSON.parse(message);return e.event==='security_request_rejected' && Object.keys(e).sort().join(',')==='event,requestId,status' && /^[0-9a-f-]{36}$/.test(e.requestId)})()))
  } finally { console.info = info; console.error = error }
})

test('missing runtime configuration returns 503 instead of simulated login/logout success', async () => {
  const cookie = await validCookie()
  const previous = process.env.ABUSE_HMAC_SECRET
  delete process.env.ABUSE_HMAC_SECRET
  try {
    assert.equal((await signIn()).status, 503)
    assert.equal((await logout(request('/api/auth/logout', {}, cookie, 'http://localhost:3107'))).status, 503)
    assert.equal((await db().query('SELECT * FROM sessions WHERE revoked_at IS NULL')).rowCount, 1)
  } finally { process.env.ABUSE_HMAC_SECRET = previous }
})

test('Pro catalog is unique, monthly BRL 13990 cents with 30-day trial and mandatory card', () => {
  assert.equal(proPlan.id, 'formfisik-pro')
  assert.equal(proPlan.name, 'FormFisik Pro')
  assert.equal(proPlan.monthlyPriceCents, 13990)
  assert.equal(proPlan.currency, 'BRL')
  assert.equal(proPlan.interval, 'month')
  assert.equal(proPlan.trialDays, 30)
  assert.equal(proPlan.requiresCard, true)
  assert.match(proPrice, /139,90/)
})
test('checkout availability requires real confirmed professional session and never grants trial or access', async () => {
  assert.equal((await checkoutAvailability(request('/api/subscriptions/availability'))).status, 401)
  const cookie = await validCookie()
  const response = await checkoutAvailability(request('/api/subscriptions/availability', undefined, cookie))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'unavailable', reason: 'test_configuration_missing' })
  assert.ok(response.headers.get('cache-control')?.includes('no-store'))
  assert.equal((await paidAccess(request('/api/access', undefined, cookie))).status, 403)
  await db().query('UPDATE users SET email_verified_at=NULL WHERE id=$1', [userId])
  assert.equal((await checkoutAvailability(request('/api/subscriptions/availability', undefined, cookie))).status, 401)
  await db().query("UPDATE users SET email_verified_at=now(),role='student' WHERE id=$1", [userId])
  assert.equal((await checkoutAvailability(request('/api/subscriptions/availability', undefined, cookie))).status, 403)
})
