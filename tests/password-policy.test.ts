import test from 'node:test'
import assert from 'node:assert/strict'
import { passwordSchema } from '../src/modules/auth/password-policy'
import { registrationSchema } from '../src/modules/registration/schema'
import { resetPasswordSchema } from '../src/modules/auth/recovery-schema'
import { loginSchema } from '../src/modules/auth/schema'

test('new passwords require 8–128 characters, uppercase, lowercase and a non-whitespace special character', () => {
  for (const value of ['Abcdefg!', 'Ábcdefg!', 'Abcdefg!'.padEnd(128, 'a')]) assert.equal(passwordSchema.safeParse(value).success, true)
  for (const value of ['Abcdef!', 'abcdefg!', 'ABCDEFG!', 'Abcdefg1', 'Abcdefg ', 'Abcdefg!'.padEnd(129, 'a')]) assert.equal(passwordSchema.safeParse(value).success, false)
})
test('registration and recovery share policy and confirmation checks; login preserves existing credentials', () => {
  const password = 'Abcdefg!'
  assert.equal(registrationSchema.safeParse({ fullName: 'Personal Teste', email: 'test@example.com', password, confirmPassword: password }).success, true)
  assert.equal(resetPasswordSchema.safeParse({ token: 'a'.repeat(43), password, confirmPassword: password }).success, true)
  assert.equal(resetPasswordSchema.safeParse({ token: 'a'.repeat(43), password, confirmPassword: 'Different!' }).success, false)
  assert.equal(loginSchema.safeParse({ email: 'test@example.com', password: 'oldpassword' }).success, true)
})
