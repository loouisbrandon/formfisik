import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { hash, argon2id } from 'argon2'
import { setTimeout as delay } from 'node:timers/promises'
import { recoverySchema, resetTokenSchema, resetPasswordSchema, recoveryAccepted, invalidResetLink } from '../modules/auth/recovery-schema'
import { db } from './db'
import { sameOrigin, jsonBody, clientAddress, limit, reply, failure } from './http'
import { sendPasswordRecovery, sendPasswordChanged } from './mail'
import { clearSessionCookie } from './sessions'

export const resetDigest = (token: string) => createHash('sha256').update(token).digest('hex')
const invalid = () => reply({ message: invalidResetLink }, 400)

export async function requestRecovery(request: Request) {
  const started = Date.now()
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`recovery:ip:${clientAddress(request)}`, 10, 900)
    await limit('recovery:global', 100, 60)
    const parsed = recoverySchema.safeParse(await jsonBody(request))
    if (!parsed.success) return reply({ message: 'Confira o e-mail informado.', errors: parsed.error.flatten().fieldErrors }, 400)
    const { email } = parsed.data
    await limit(`recovery:email:${email}`, 3, 900)
    const token = randomBytes(32).toString('base64url')
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      const user = await client.query(`SELECT u.id FROM users u JOIN credentials c ON c.user_id=u.id
        WHERE u.email=$1 AND u.email_verified_at IS NOT NULL FOR UPDATE OF u`, [email])
      if (user.rowCount) await client.query('INSERT INTO password_resets(token_hash,user_id) VALUES($1,$2)', [resetDigest(token), user.rows[0].id])
      // Same SMTP path for every valid address: provider failure must not reveal account existence.
      await sendPasswordRecovery(email, user.rowCount ? token : null)
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error }
    finally { client.release() }
    console.info('password_recovery_requested')
    return reply({ message: recoveryAccepted }, 202)
  } catch (error) { return failure(error, 'password_recovery_unavailable') }
  finally { await delay(Math.max(0, 750 - (Date.now() - started))) }
}
export async function validateReset(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`reset-validation:ip:${clientAddress(request)}`, 30, 900)
    const parsed = resetTokenSchema.safeParse(await jsonBody(request))
    if (!parsed.success) return invalid()
    const result = await db().query(`SELECT 1 FROM password_resets r JOIN users u ON u.id=r.user_id
      JOIN credentials c ON c.user_id=u.id WHERE r.token_hash=$1 AND r.expires_at>clock_timestamp() AND u.email_verified_at IS NOT NULL`, [resetDigest(parsed.data.token)])
    return result.rowCount ? reply({ valid: true }, 200) : invalid()
  } catch (error) { return failure(error, 'password_recovery_unavailable') }
}
export async function resetPassword(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`reset:ip:${clientAddress(request)}`, 15, 900)
    await limit('reset:global', 100, 60)
    const parsed = resetPasswordSchema.safeParse(await jsonBody(request))
    if (!parsed.success) {
      if (parsed.error.flatten().fieldErrors.token) return invalid()
      return reply({ message: 'Confira a nova senha.', errors: parsed.error.flatten().fieldErrors }, 400)
    }
    const { token, password } = parsed.data
    const key = resetDigest(token)
    const candidate = await db().query('SELECT user_id FROM password_resets WHERE token_hash=$1 AND expires_at>clock_timestamp()', [key])
    if (!candidate.rowCount) return invalid()
    const passwordHash = await hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
    const client = await db().connect()
    let email: string
    try {
      await client.query('BEGIN')
      // Same user lock as session issuance: a login verified before reset cannot issue after it.
      const user = await client.query('SELECT email FROM users WHERE id=$1 AND email_verified_at IS NOT NULL FOR UPDATE', [candidate.rows[0].user_id])
      const consumed = await client.query('DELETE FROM password_resets WHERE token_hash=$1 AND expires_at>clock_timestamp() RETURNING user_id', [key])
      if (!user.rowCount || !consumed.rowCount) { await client.query('ROLLBACK'); return invalid() }
      const changed = await client.query('UPDATE credentials SET password_hash=$1,updated_at=clock_timestamp() WHERE user_id=$2 RETURNING user_id', [passwordHash, consumed.rows[0].user_id])
      if (!changed.rowCount) { await client.query('ROLLBACK'); return invalid() }
      await client.query('UPDATE sessions SET revoked_at=clock_timestamp() WHERE user_id=$1 AND revoked_at IS NULL', [consumed.rows[0].user_id])
      await client.query('DELETE FROM password_resets WHERE user_id=$1', [consumed.rows[0].user_id])
      await client.query('COMMIT')
      email = user.rows[0].email
    } catch (error) { await client.query('ROLLBACK'); throw error }
    finally { client.release() }
    // Notification failure cannot undo a committed password change or revive sessions.
    try { await sendPasswordChanged(email) } catch { console.error('password_change_notification_unavailable') }
    console.info('password_reset_completed')
    return reply({ message: 'Senha alterada. Todas as sessões anteriores foram encerradas. Entre com sua nova senha.', destination: '/login' }, 200, { 'Set-Cookie': clearSessionCookie() })
  } catch (error) { return failure(error, 'password_recovery_unavailable') }
}
