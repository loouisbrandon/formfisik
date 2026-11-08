import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { hash, verify, argon2id } from 'argon2'
import { SMTPServer } from 'smtp-server'
import { migrate } from '../scripts/migrate'
import { db } from '../src/server/db'
import { requestRecovery, validateReset, resetPassword, resetDigest } from '../src/server/password-recovery'
import { login, getSession } from '../src/server/auth'
import { createSession, CredentialsChanged } from '../src/server/sessions'
const connection = process.env.TEST_DATABASE_URL
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw new Error('Use banco isolado terminado em _test')
Object.assign(process.env, { DATABASE_URL: connection, APP_URL: 'http://localhost:3107', ABUSE_HMAC_SECRET: randomBytes(32).toString('hex'), SMTP_HOST: '127.0.0.1', SMTP_PORT: '15261', MAIL_FROM: 'FormFisik <test@formfisik.test>' })
const email = 'recovery@example.test'
const password = 'previous secure phrase 123'
const nextPassword = '  New secure phrase 456!  '
let id = ''
let originalHash = ''
const messages: string[] = []
let rejectMail = false
const smtp = new SMTPServer({ authOptional: true, disabledCommands: ['STARTTLS'], onData(stream, session, callback) {
  let data = ''
  stream.on('data', chunk => { data += chunk })
  stream.on('end', () => { if (rejectMail) callback(new Error('Controlled rejection')); else { messages.push(data); callback() } })
} })
function request(path: string, body?: unknown, cookie?: string, origin = process.env.APP_URL!) {
  return new Request(process.env.APP_URL + path, { method: body === undefined ? 'GET' : 'POST', headers: { ...(body === undefined ? {} : { origin, 'content-type': 'application/json' }), ...(cookie ? { cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) })
}
const ask = (value = email) => requestRecovery(request('/api/auth/forgot-password', { email: value }))
const reset = (token: string, newPassword = nextPassword) => resetPassword(request('/api/auth/reset-password', { token, password: newPassword, confirmPassword: newPassword }))
function tokenAt(index = messages.length - 1) {
  const match = messages[index].replace(/=\r?\n/g, '').replace(/=3D/g, '=').match(/redefinir-senha#([\w-]{43})/)
  assert.ok(match)
  return match[1]
}
async function newToken() { assert.equal((await ask()).status, 202); return tokenAt() }
async function cookie() {
  const response = await login(request('/api/auth/login', { email, password }))
  assert.equal(response.status, 200)
  return response.headers.get('set-cookie')!.split(';')[0]
}
before(async () => {
  await migrate(connection); await migrate(connection)
  originalHash = await hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
  await new Promise<void>(resolve => smtp.listen(15261, '127.0.0.1', resolve))
})
beforeEach(async () => {
  messages.length = 0; rejectMail = false; id = randomUUID()
  await db().query('TRUNCATE password_resets,sessions,credentials,users,pending_registrations,abuse_limits CASCADE')
  await db().query("INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,'Recovery Professional',now())", [id, email])
  await db().query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)', [id, originalHash])
})
after(async () => { await db().end(); await new Promise<void>(resolve => smtp.close(resolve)) })

test('existing/unknown/unconfirmed addresses have identical public response; only eligible account gets token', async () => {
  const known = await ask(email.toUpperCase())
  const token = tokenAt()
  assert.match(token, /^[\w-]{43}$/)
  const absent = await ask('unknown@example.test')
  assert.equal(known.status, 202); assert.equal(absent.status, 202)
  assert.deepEqual(await known.json(), await absent.json())
  assert.ok(!messages[1].includes('redefinir-senha#'))
  await db().query('UPDATE users SET email_verified_at=NULL')
  const unconfirmed = await ask()
  assert.equal(unconfirmed.status, 202)
  assert.ok(!messages[2].includes('redefinir-senha#'))
  assert.equal((await db().query('SELECT * FROM password_resets')).rowCount, 1)
})
test('token is digest-only, expires in 30 minutes; validation is read-only and exposes no identity', async () => {
  const token = await newToken()
  const row = (await db().query('SELECT * FROM password_resets')).rows[0]
  assert.equal(row.token_hash, resetDigest(token))
  assert.ok(!JSON.stringify(row).includes(token))
  assert.equal(Math.round((row.expires_at - row.created_at) / 1000), 1800)
  const valid = await validateReset(request('/api/auth/reset-password/validate', { token }))
  assert.deepEqual(await valid.json(), { valid: true })
  assert.equal((await db().query('SELECT * FROM password_resets')).rowCount, 1)
  assert.equal((await db().query('SELECT * FROM credentials')).rows[0].password_hash, originalHash)
})
test('reset changes Argon2id password, revokes ALL sessions, consumes ALL links, does not authenticate', async () => {
  const cookies = [await cookie(), await cookie()]
  const oldLink = await newToken()
  const chosen = await newToken()
  const response = await reset(chosen)
  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.equal(payload.destination, '/login')
  assert.ok(!JSON.stringify(payload).includes(chosen))
  assert.ok(response.headers.get('set-cookie')?.includes('Max-Age=0'))
  assert.equal((await db().query('SELECT * FROM password_resets')).rowCount, 0)
  assert.equal((await db().query('SELECT * FROM sessions WHERE revoked_at IS NULL')).rowCount, 0)
  for (const value of cookies) assert.equal((await getSession(request('/api/auth/session', undefined, value))).status, 401)
  const credential = (await db().query('SELECT * FROM credentials')).rows[0]
  assert.ok(credential.password_hash.startsWith('$argon2id$'))
  assert.ok(await verify(credential.password_hash, nextPassword))
  assert.equal(await verify(credential.password_hash, password), false)
  assert.equal((await login(request('/api/auth/login', { email, password }))).status, 401)
  assert.equal((await login(request('/api/auth/login', { email, password: nextPassword }))).status, 200)
  for (const token of [oldLink, chosen]) assert.equal((await reset(token)).status, 400)
  assert.ok(messages.some(message => message.includes('Sua senha FormFisik foi alterada')))
})
test('invalid, expired and consumed links produce same failure with no credential change', async () => {
  const token = await newToken()
  await db().query("UPDATE password_resets SET created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour'")
  const expired = await reset(token)
  const missing = await reset(randomBytes(32).toString('base64url'))
  const malformed = await reset('invalid')
  assert.equal(expired.status, 400)
  assert.deepEqual(await missing.json(), await expired.json())
  assert.equal(malformed.status, 400)
  assert.equal((await validateReset(request('/api/auth/reset-password/validate', { token }))).status, 400)
  assert.equal((await db().query('SELECT password_hash FROM credentials')).rows[0].password_hash, originalHash)
})
test('concurrent reset attempts succeed exactly once, including different valid links', async () => {
  const tokens = [await newToken(), await newToken()]
  const results = await Promise.all(tokens.map(token => reset(token)))
  assert.deepEqual(results.map(response => response.status).sort(), [200, 400])
  assert.equal((await db().query('SELECT * FROM password_resets')).rowCount, 0)
})
test('login verified against an obsolete hash cannot create session after reset', async () => {
  await reset(await newToken())
  await assert.rejects(() => createSession(id, undefined, originalHash), CredentialsChanged)
  assert.equal((await db().query('SELECT * FROM sessions WHERE revoked_at IS NULL')).rowCount, 0)
})
test('invalid input, weak/mismatched password, cross-origin and oversized payload fail safely', async () => {
  assert.equal((await ask('not-email')).status, 400)
  const token = await newToken()
  assert.equal((await reset(token, 'short')).status, 400)
  assert.equal((await resetPassword(request('/api/auth/reset-password', { token, password: nextPassword, confirmPassword: 'different' }))).status, 400)
  assert.equal((await requestRecovery(request('/api/auth/forgot-password', { email }, undefined, 'https://evil.test'))).status, 403)
  assert.equal((await resetPassword(request('/api/auth/reset-password', { token, password: nextPassword, confirmPassword: nextPassword }, undefined, 'https://evil.test'))).status, 403)
  assert.equal((await reset(token, 'x'.repeat(9000))).status, 400)
  assert.equal((await db().query('SELECT password_hash FROM credentials')).rows[0].password_hash, originalHash)
})
test('persistent recovery limit applies equally to existing and nonexistent email', async () => {
  for (const address of [email, 'unknown@example.test']) {
    for (let i = 0; i < 3; i++) assert.equal((await ask(address)).status, 202)
    assert.equal((await ask(address.toUpperCase())).status, 429)
  }
})
test('reset attempt limit prevents automated token guessing', async () => {
  for (let i = 0; i < 15; i++) assert.equal((await reset(randomBytes(32).toString('base64url'))).status, 400)
  const response = await reset(randomBytes(32).toString('base64url'))
  assert.equal(response.status, 429)
  assert.ok(response.headers.has('retry-after'))
})
test('SMTP refusal rolls back token and produces same failure for known and unknown emails', async () => {
  rejectMail = true
  const known = await ask()
  const unknown = await ask('unknown@example.test')
  assert.equal(known.status, 503); assert.equal(unknown.status, 503)
  assert.deepEqual(await known.json(), await unknown.json())
  assert.equal((await db().query('SELECT * FROM password_resets')).rowCount, 0)
  assert.equal((await db().query('SELECT password_hash FROM credentials')).rows[0].password_hash, originalHash)
})
test('failure of notification cannot roll back committed reset or resurrect token/sessions', async () => {
  await cookie()
  const token = await newToken()
  rejectMail = true
  assert.equal((await reset(token)).status, 200)
  assert.equal((await db().query('SELECT * FROM sessions WHERE revoked_at IS NULL')).rowCount, 0)
  assert.equal((await reset(token)).status, 400)
})
test('security logs and public JSON never disclose email, passwords, digest or reset token', async () => {
  const logs: string[] = []
  const originalInfo = console.info; const originalError = console.error
  console.info = (...args) => { logs.push(args.join(' ')) }
  console.error = (...args) => { logs.push(args.join(' ')) }
  try {
    const token = await newToken()
    const response = await reset(token)
    assert.equal(response.status, 200)
    const output = JSON.stringify(await response.json()) + logs.join(' ')
    for (const secret of [email, password, nextPassword, token, resetDigest(token), originalHash]) assert.ok(!output.includes(secret))
    assert.ok(logs.every(line => /^password_[a-z_]+$/.test(line)))
  } finally { console.info = originalInfo; console.error = originalError }
})
