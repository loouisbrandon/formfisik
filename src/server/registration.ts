import 'server-only'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { hash, argon2id } from 'argon2'
import { setTimeout as delay } from 'node:timers/promises'
import { registrationSchema, acceptedMessage } from '../modules/registration/schema'
import { db } from './db'
import { sendVerification } from './mail'

import { reply, jsonBody as body, sameOrigin, clientAddress, limit, failure } from './http'
export const digest = (token: string) => createHash('sha256').update(token).digest('hex')

export async function register(request: Request) {
  const start = Date.now()
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`register:ip:${clientAddress(request)}`, 10, 900)
    await limit('register:global', 100, 60)
    const parsed = registrationSchema.safeParse(await body(request))
    if (!parsed.success) return reply({ message: 'Confira os campos informados.', errors: parsed.error.flatten().fieldErrors }, 400)
    const { email, fullName, password } = parsed.data
    await limit(`register:email:${email}`, 3, 900)
    const passwordHash = await hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
    const token = randomBytes(32).toString('base64url')
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      // Serialize registration and verification for the same email across replicas.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [email])
      const existing = await client.query('SELECT id FROM users WHERE email=$1', [email])
      if (!existing.rowCount) {
        await client.query(`INSERT INTO pending_registrations(token_hash,email,full_name,password_hash,expires_at)
          VALUES($1,$2,$3,$4,now()+interval '30 minutes')`, [digest(token), email, fullName, passwordHash])
      }
      await sendVerification(email, existing.rowCount ? null : token)
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error }
    finally { client.release() }
    return reply({ message: acceptedMessage }, 202)
  } catch (error) { return failure(error) }
  finally { await delay(Math.max(0, 750 - (Date.now() - start))) }
}
export async function verifyEmail(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`verify:ip:${clientAddress(request)}`, 30, 900)
    const input = await body(request) as { token?: unknown }
    if (!input || typeof input.token !== 'string' || !/^[\w-]{43}$/.test(input.token)) return reply({ message: 'Link inválido, expirado ou já utilizado. Solicite um novo cadastro.' }, 400)
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      const key = digest(input.token)
      const pending = await client.query('SELECT email FROM pending_registrations WHERE token_hash=$1', [key])
      if (!pending.rowCount) { await client.query('ROLLBACK'); return reply({ message: 'Link inválido, expirado ou já utilizado. Solicite um novo cadastro.' }, 400) }
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [pending.rows[0].email])
      const attempt = await client.query('DELETE FROM pending_registrations WHERE token_hash=$1 AND expires_at>now() RETURNING *', [key])
      if (!attempt.rowCount) { await client.query('ROLLBACK'); return reply({ message: 'Link inválido, expirado ou já utilizado. Solicite um novo cadastro.' }, 400) }
      const row = attempt.rows[0]
      const user = await client.query(`INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,$3,now()) ON CONFLICT(email) DO NOTHING RETURNING id`, [randomUUID(), row.email, row.full_name])
      if (user.rowCount) await client.query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)', [user.rows[0].id, row.password_hash])
      await client.query('DELETE FROM pending_registrations WHERE email=$1', [row.email])
      await client.query('COMMIT')
      return reply({ message: 'E-mail confirmado. Sua conta profissional foi criada. Nenhuma assinatura ou trial foi ativado.' }, 200)
    } catch (error) { await client.query('ROLLBACK'); throw error }
    finally { client.release() }
  } catch (error) { return failure(error) }
}
