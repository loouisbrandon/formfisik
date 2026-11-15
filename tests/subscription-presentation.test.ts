import { test } from 'node:test'
import assert from 'node:assert/strict'
import { billingDate, billingMoney, stateCopy, trialDaysRemaining } from '../src/modules/subscriptions/presentation'
import { subscriptionFixture } from './helpers/subscription-views'
const now = Date.parse('2026-10-31T12:00:00Z')
test('remaining trial days count partial days, clamp expiry, and do not invent absent dates', () => {
  assert.equal(trialDaysRemaining('2026-11-01T12:01:00Z', now), 2)
  assert.equal(trialDaysRemaining('2026-11-01T12:00:00Z', now), 1)
  assert.equal(trialDaysRemaining('2026-10-30T12:00:00Z', now), 0)
  assert.equal(trialDaysRemaining(null, now), null)
  assert.equal(trialDaysRemaining('invalid', now), null)
})
test('unknown financial amounts stay unavailable while genuine zero and BRL price are preserved', () => {
  assert.equal(billingMoney(null), 'Valor ainda não disponível')
  assert.match(billingMoney(0), /R\$\s0,00/)
  assert.match(billingMoney(13990), /R\$\s139,90/)
  assert.equal(billingDate(null), 'Data não disponível')
  assert.equal(billingDate('invalid'), 'Data não disponível')
})
test('presentation distinguishes expired trial, paid expiry and required payment confirmation without granting access', () => {
  const expired = subscriptionFixture('expired', now)
  assert.equal(stateCopy(expired)?.title, 'Seu teste gratuito terminou')
  expired.financialStatus = 'active'
  assert.equal(stateCopy(expired)?.title, 'Seu período de acesso terminou')
  const failed = subscriptionFixture('payment_failed', now)
  failed.paymentIssue = 'action_required'
  assert.match(stateCopy(failed)!.title, /confirmação/)
  stateCopy(failed)
  assert.equal(failed.paidAccess, false)
})
