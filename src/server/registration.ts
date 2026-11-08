import 'server-only'
import {z} from '@/lib/validation'
import { createHash, createHmac, timingSafeEqual, randomBytes, randomInt, randomUUID } from 'node:crypto'
import { hash, argon2id } from 'argon2'
import { setTimeout as delay } from 'node:timers/promises'
import { registrationSchema, acceptedMessage } from '../modules/registration/schema'
import { config } from './config'
import { db } from './db'
import { sendVerification } from './mail'

import { reply, jsonBody as body, sameOrigin, clientAddress, limit, failure, RateLimit } from './http'
export const digest = (token: string) => createHash('sha256').update(token).digest('hex')

export const codeDigest = (challenge:string,code:string) => createHmac('sha256',config().abuseSecret).update('registration-code-v1:'+challenge+':'+code).digest('hex')
async function cooldown(email:string){try{await limit(`register:cooldown:${email}`,1,60);return null}catch(e){if(e instanceof RateLimit)return reply({message:'Aguarde 60 segundos antes de solicitar outro código.'},429,{'Retry-After':'60'});throw e}}
const newCode = () => String(randomInt(0,1000000)).padStart(6,'0')
const invalidCode = () => reply({message:'Código inválido, expirado ou já utilizado. Confira o código ou solicite um novo cadastro.'},400)

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
    const wait=await cooldown(email);if(wait)return wait
    const passwordHash = await hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
    const token = randomBytes(32).toString('base64url'), code=newCode()
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      // Serialize registration and verification for the same email across replicas.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [email])
      const existing = await client.query('SELECT id FROM users WHERE email=$1', [email])
      if (!existing.rowCount) {
        await client.query('DELETE FROM pending_registrations WHERE email=$1',[email])
        await client.query(`INSERT INTO pending_registrations(token_hash,email,full_name,password_hash,expires_at,code_hash)
          VALUES($1,$2,$3,$4,clock_timestamp()+interval '10 minutes',$5)`, [digest(token), email, fullName, passwordHash,codeDigest(digest(token),code)])
      }
      await sendVerification(email, existing.rowCount ? null : code)
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error }
    finally { client.release() }
    return reply({ message: acceptedMessage,verificationId:token,resendAfter:60 }, 202)
  } catch (error) { return failure(error) }
  finally { await delay(Math.max(0, 750 - (Date.now() - start))) }
}
export async function verifyEmail(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ message: 'Origem não permitida.' }, 403)
    await limit(`verify:ip:${clientAddress(request)}`, 30, 900)
    const raw=await body(request,4096)
    if(raw && typeof raw==='object' && 'verificationId' in raw)return await verifyCode(raw)
    const parsed = z.object({token:z.string().regex(/^[\w-]{43}$/)}).strict().safeParse(raw)
    if (!parsed.success) return reply({ message: 'Link inválido, expirado ou já utilizado. Solicite um novo cadastro.' }, 400)
    const input = parsed.data
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      const key = digest(input.token)
      const pending = await client.query('SELECT email FROM pending_registrations WHERE token_hash=$1', [key])
      if (!pending.rowCount) { await client.query('ROLLBACK'); return reply({ message: 'Link inválido, expirado ou já utilizado. Solicite um novo cadastro.' }, 400) }
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [pending.rows[0].email])
      const attempt = await client.query('DELETE FROM pending_registrations WHERE token_hash=$1 AND code_hash IS NULL AND expires_at>clock_timestamp() RETURNING *', [key])
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

async function verifyCode(raw:unknown){
 const parsed=z.object({verificationId:z.string().regex(/^[\w-]{43}$/),code:z.string().regex(/^\d{6}$/)}).strict().safeParse(raw)
 if(!parsed.success)return invalidCode()
 const key=digest(parsed.data.verificationId)
 const found=(await db().query('SELECT email FROM pending_registrations WHERE token_hash=$1 AND code_hash IS NOT NULL',[key])).rows[0]
 if(!found)return invalidCode()
 await limit('verify:email:'+found.email,10,900)
 const client=await db().connect()
 try{await client.query('BEGIN')
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[found.email])
  const row=(await client.query('SELECT *,expires_at>clock_timestamp() AS valid FROM pending_registrations WHERE token_hash=$1 FOR UPDATE',[key])).rows[0]
  if(!row||!row.valid||row.code_attempts>=5){await client.query('ROLLBACK');return invalidCode()}
  if(!row.code_hash||!timingSafeEqual(Buffer.from(row.code_hash),Buffer.from(codeDigest(key,parsed.data.code)))){await client.query('UPDATE pending_registrations SET code_attempts=code_attempts+1 WHERE token_hash=$1',[key]);await client.query('COMMIT');return invalidCode()}
  const user=await client.query('INSERT INTO users(id,email,full_name,email_verified_at) VALUES($1,$2,$3,clock_timestamp()) ON CONFLICT(email) DO NOTHING RETURNING id',[randomUUID(),row.email,row.full_name])
  if(user.rowCount)await client.query('INSERT INTO credentials(user_id,password_hash) VALUES($1,$2)',[user.rows[0].id,row.password_hash])
  await client.query('DELETE FROM pending_registrations WHERE email=$1',[row.email]);await client.query('COMMIT')
  return reply({message:'E-mail confirmado. Sua conta profissional foi criada. Nenhuma assinatura ou trial foi ativado.'},200)
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
export async function resendCode(request:Request){try{
 if(!sameOrigin(request))return reply({message:'Origem não permitida.'},403)
 await limit('resend:ip:'+clientAddress(request),10,900);await limit('register:global',100,60)
 const data=z.object({verificationId:z.string().regex(/^[\w-]{43}$/)}).strict().safeParse(await body(request,4096))
 if(!data.success)return invalidCode()
 const key=digest(data.data.verificationId)
 const found=(await db().query('SELECT email FROM pending_registrations WHERE token_hash=$1 AND code_hash IS NOT NULL',[key])).rows[0]
 if(found){await limit('register:email:'+found.email,3,900);const wait=await cooldown(found.email);if(wait)return wait}
 const client=await db().connect()
 try{await client.query('BEGIN');if(found){
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[found.email])
  const row=(await client.query("SELECT *,expires_at>clock_timestamp() AND created_at>clock_timestamp()-interval '30 minutes' AS valid FROM pending_registrations WHERE token_hash=$1 FOR UPDATE",[key])).rows[0]
  if(!row||!row.valid||row.code_attempts>=5){await client.query('ROLLBACK');return invalidCode()}
  let code=newCode();while(codeDigest(key,code)===row.code_hash)code=newCode()
  await client.query("UPDATE pending_registrations SET code_hash=$2,last_sent_at=clock_timestamp(),expires_at=LEAST(created_at+interval '30 minutes',clock_timestamp()+interval '10 minutes') WHERE token_hash=$1",[key,codeDigest(key,code)])
  await sendVerification(found.email,code)
 }
 await client.query('COMMIT');return reply({message:acceptedMessage,resendAfter:60},202)
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }catch(e){return failure(e)}}
