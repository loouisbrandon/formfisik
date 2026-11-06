import { test } from 'node:test'
import assert from 'node:assert/strict'
import { passwordStrength } from '../src/modules/auth/password-strength-score'

test('password meter starts empty and advances with longer phrases', () => {
  assert.equal(passwordStrength('').level, 0)
  assert.equal(passwordStrength('Curta!').level, 1)
  assert.equal(passwordStrength('Uma frase 12!').level, 2)
  assert.equal(passwordStrength('Minha frase longa!').level, 3)
  assert.equal(passwordStrength('Minha trilha passa pelas montanhas!').level, 4)
})
test('predictable sequences and repetition do not earn the highest level', () => {
  for (const value of ['12345678901234567890123456', 'aaaaaaaaaaaaaaaaaaaaaaaa', 'senha12345678901234567890']) {
    assert.equal(passwordStrength(value).level, 1)
  }
})
test('strength remains an estimate rather than a mandatory complexity rule', () => {
  const phrase = passwordStrength('minha longa caminhada pelas montanhas')
  assert.equal(phrase.level, 4)
  assert.equal(passwordStrength('abc').hint, 'Continue: o mínimo é 12 caracteres.')
  assert.deepEqual(Object.keys(phrase).sort(), ['hint', 'label', 'level'])
})
