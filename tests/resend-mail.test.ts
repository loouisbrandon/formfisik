import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sendVerification, sendPasswordRecovery, sendEmailChange } from '../src/server/mail'
import { mailConfig } from '../src/server/config'

test('Resend HTTPS preserves account links and only accepts confirmed provider responses', async () => {
  const before = { ...process.env }, originalFetch = globalThis.fetch
  Object.assign(process.env, { MAIL_TRANSPORT: 'resend', RESEND_API_KEY: 're_synthetic_private', MAIL_FROM: 'FormFisik <test@example.test>', APP_URL: 'https://staging.example.test', DATABASE_URL: 'postgresql://synthetic', ABUSE_HMAC_SECRET: 'x'.repeat(32) })
  try {
    for (const [send, route] of [[sendVerification, 'verificar-email'], [sendPasswordRecovery, 'redefinir-senha'], [sendEmailChange, 'confirmar-alteracao-email']] as const) {
      let calls = 0
      globalThis.fetch = async (url, options) => {
        calls++
        assert.equal(url, 'https://api.resend.com/emails')
        assert.equal(options?.redirect, 'error')
        assert.equal(options?.cache, 'no-store')
        assert.ok(options?.signal)
        assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer re_synthetic_private')
        const body = JSON.parse(options!.body as string)
        assert.deepEqual(body.to, ['recipient@example.test'])
        if(route==='verificar-email'){assert.ok(body.text.includes('synthetic_token'));assert.ok(!body.text.includes('/verificar-email#'))}else assert.ok(body.text.includes(`https://staging.example.test/${route}#synthetic_token`))
        assert.ok(!body.text.includes('re_synthetic_private'))
        if (route === 'verificar-email') {
          assert.ok(body.html.includes('Digite este código'))
          assert.ok(body.html.includes('synthetic_token'))
          assert.ok(!body.html.includes('?token='))
          assert.ok(!body.html.includes('re_synthetic_private'))
        }
        return Response.json({ id: 'accepted-synthetic' })
      }
      await send('recipient@example.test', 'synthetic_token')
      assert.equal(calls, 1)
    }
    for (const response of [Response.json({ message: 'sensitive provider details' }, { status: 403 }), Response.json({}), new Response('invalid json')]) {
      globalThis.fetch = async () => response
      await assert.rejects(sendVerification('recipient@example.test', null), { message: 'EMAIL_NOT_ACCEPTED' })
    }
    globalThis.fetch = async () => { throw new Error('sensitive transport details') }
    await assert.rejects(sendVerification('recipient@example.test', null), { message: 'EMAIL_NOT_ACCEPTED' })
    delete process.env.RESEND_API_KEY
    assert.throws(mailConfig, { message: 'EMAIL_CONFIGURATION_UNAVAILABLE' })
    process.env.MAIL_TRANSPORT = 'unknown'
    assert.throws(mailConfig, { message: 'INVALID_MAIL_TRANSPORT' })
  } finally {
    globalThis.fetch = originalFetch
    for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key]
    Object.assign(process.env, before)
  }
})
