import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verificationEmailHtml } from '../src/server/verification-email'

test('verification email escapes values and remains actionable without images', () => {
  const html = verificationEmailHtml('https://formfisik.test', '"<unsafe>&')
  assert.ok(html.includes('&quot;&lt;unsafe&gt;&amp;'))
  assert.ok(!html.includes('"<unsafe>'))
  assert.ok(html.includes('Digite este código'))
  assert.ok(html.includes('10 minutos'))
  assert.ok(html.includes('não ativa assinatura'))
  assert.ok(html.includes('role="presentation"'))
  assert.ok(!/<script|<form|onclick=|\?token=/i.test(html))
})
