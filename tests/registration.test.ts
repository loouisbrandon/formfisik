import { before, after, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { SMTPServer } from 'smtp-server'
import { verify as verifyHash } from 'argon2'
import { migrate } from '../scripts/migrate'

const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('Use TEST_DATABASE_URL apontando para um banco isolado terminado em _test')
process.env.DATABASE_URL = url
process.env.APP_URL = 'http://localhost:3107'
process.env.ABUSE_HMAC_SECRET = randomBytes(32).toString('hex')
process.env.SMTP_HOST = '127.0.0.1'
process.env.SMTP_USER = ''
process.env.SMTP_PASSWORD = ''
process.env.SMTP_PORT = '15259'
process.env.MAIL_FROM = 'FormFisik <test@formfisik.test>'
const messages: string[] = []
let rejectMail = false
const smtp = new SMTPServer({ authOptional: true, disabledCommands: ['STARTTLS'], onData(stream, session, callback) {
  let data = ''
  stream.on('data', chunk => { data += chunk })
  stream.on('end', () => { if (rejectMail) callback(new Error('Controlled SMTP rejection')); else { messages.push(data); callback() } })
} })
import { register, verifyEmail, digest } from '../src/server/registration'
import { db } from '../src/server/db'
const input = { fullName: 'Bruna Profissional', email: 'bruna@example.test', password: 'Uma frase segura 123!', confirmPassword: 'Uma frase segura 123!' }
function request(path: string, data: unknown, origin = process.env.APP_URL) {
  return new Request(`${process.env.APP_URL}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: origin! }, body: JSON.stringify(data) })
}
const registerRequest = (data = input) => register(request('/api/accounts/register', data))
function tokenAt(index = messages.length - 1) {
  // Nodemailer quoted printable may wrap the URL; undo soft line breaks.
  const text = messages[index].replace(/=\r?\n/g, '').replace(/=3D/g, '=')
  const token = text.match(/verificar-email#([\w-]{43})/)?.[1]
  assert.ok(token, 'SMTP message contains a verification link')
  return token
}
before(async () => { await migrate(url); await migrate(url); await new Promise<void>(resolve => smtp.listen(15259, '127.0.0.1', resolve)) })
beforeEach(async () => { rejectMail = false; messages.length = 0; await db().query('TRUNCATE credentials,users,pending_registrations,abuse_limits CASCADE') })
after(async () => { await db().end(); await new Promise<void>(resolve => smtp.close(resolve)) })

test('real PostgreSQL + SMTP registration, Argon2id, verification and one-time token', async () => {
  const response = await registerRequest()
  assert.equal(response.status, 202)
  assert.equal(response.headers.get('set-cookie'), null)
  assert.equal((await db().query('SELECT * FROM users')).rowCount, 0)
  const pending = (await db().query('SELECT * FROM pending_registrations')).rows[0]
  assert.ok(pending.password_hash.startsWith('$argon2id$v=19$'))
  for (const parameter of ['m=19456', 't=2', 'p=1']) assert.ok(pending.password_hash.split('$')[3].split(',').includes(parameter))
  assert.ok(await verifyHash(pending.password_hash, input.password))
  const token = tokenAt()
  assert.equal(pending.token_hash, digest(token))
  assert.ok(!JSON.stringify(pending).includes(token))
  const confirmed = await verifyEmail(request('/api/accounts/verify', { token }))
  assert.equal(confirmed.status, 200)
  const user = (await db().query('SELECT * FROM users')).rows[0]
  assert.equal(user.role, 'professional')
  assert.ok(user.email_verified_at)
  assert.equal((await db().query('SELECT * FROM credentials')).rowCount, 1)
  assert.equal((await db().query('SELECT * FROM pending_registrations')).rowCount, 0)
  assert.equal((await verifyEmail(request('/api/accounts/verify', { token }))).status, 400)
})
test('validation, oversized body, honeypot and cross-origin rejected without persistence', async () => {
  assert.equal((await registerRequest({ ...input, password: 'short' })).status, 400)
  assert.equal((await register(request('/api/accounts/register', { ...input, website: 'spam' }))).status, 400)
  assert.equal((await registerRequest({ ...input, fullName: 'x'.repeat(9000) })).status, 400)
  assert.equal((await register(request('/api/accounts/register', input, 'https://evil.test'))).status, 403)
  assert.equal((await db().query('SELECT * FROM pending_registrations')).rowCount, 0)
})
test('expired and malformed verification rejected', async () => {
  await registerRequest()
  const token = tokenAt()
  await db().query("UPDATE pending_registrations SET created_at=now()-interval '2 hours', expires_at=now()-interval '1 hour'")
  assert.equal((await verifyEmail(request('/api/accounts/verify', { token }))).status, 400)
  assert.equal((await verifyEmail(request('/api/accounts/verify', { token: 'bad' }))).status, 400)
  assert.equal((await db().query('SELECT * FROM users')).rowCount, 0)
})
test('duplicate verified address returns identical public response without changing credentials', async () => {
  const first = await registerRequest()
  await verifyEmail(request('/api/accounts/verify', { token: tokenAt() }))
  const previous = (await db().query('SELECT * FROM credentials')).rows[0].password_hash
  const duplicate = await registerRequest({ ...input, password: 'Different password 123!', confirmPassword: 'Different password 123!' })
  assert.equal(duplicate.status, first.status)
  assert.deepEqual(await duplicate.json(), await first.json())
  assert.equal((await db().query('SELECT * FROM credentials')).rows[0].password_hash, previous)
  assert.equal((await db().query('SELECT * FROM users')).rowCount, 1)
  assert.equal((await db().query('SELECT * FROM pending_registrations')).rowCount, 0)
})
test('pending retries bind the chosen password to its own link; parallel confirmation consumes once', async () => {
  await registerRequest()
  const old = tokenAt()
  const nextPassword = 'New secure phrase 456!'
  await registerRequest({ ...input, password: nextPassword, confirmPassword: nextPassword })
  const chosen = tokenAt()
  const replies = await Promise.all([verifyEmail(request('/api/accounts/verify', { token: chosen })), verifyEmail(request('/api/accounts/verify', { token: chosen }))])
  assert.deepEqual(replies.map(r => r.status).sort(), [200, 400])
  const hash = (await db().query('SELECT password_hash FROM credentials')).rows[0].password_hash
  assert.ok(await verifyHash(hash, nextPassword))
  assert.equal((await verifyEmail(request('/api/accounts/verify', { token: old }))).status, 400)
})
test('persistent email rate limiting works across requests', async () => {
  for (let i = 0; i < 3; i++) assert.equal((await registerRequest()).status, 202)
  const response = await registerRequest()
  assert.equal(response.status, 429)
  assert.ok(response.headers.has('retry-after'))
})
test('SMTP refusal rolls back pending attempt; no simulated success; retry recovers', async () => {
  rejectMail = true
  assert.equal((await registerRequest()).status, 503)
  assert.equal((await db().query('SELECT * FROM pending_registrations')).rowCount, 0)
  rejectMail = false
  assert.equal((await registerRequest()).status, 202)
})
test('email normalization and password spaces preserved', async () => {
  const password = '  Senha com espaços!  '
  assert.equal((await registerRequest({ ...input, email: 'BRUNA@EXAMPLE.TEST', password, confirmPassword: password })).status, 202)
  await verifyEmail(request('/api/accounts/verify', { token: tokenAt() }))
  assert.equal((await db().query('SELECT email FROM users')).rows[0].email, input.email)
  assert.ok(await verifyHash((await db().query('SELECT password_hash FROM credentials')).rows[0].password_hash, password))
})

test('missing mail configuration fails explicitly without persistence', async () => {
  const previous = process.env.SMTP_HOST
  delete process.env.SMTP_HOST
  try {
    assert.equal((await registerRequest()).status, 503)
    assert.equal((await db().query('SELECT * FROM pending_registrations')).rowCount, 0)
  } finally { process.env.SMTP_HOST = previous }
})
