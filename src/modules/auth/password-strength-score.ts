export function passwordStrength(password: string) {
  if (!password) return { level: 0, label: 'Crie sua senha', hint: 'Use uma frase longa e exclusiva, com pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um caractere especial.' }
  const distinct = new Set(password.toLowerCase()).size
  const repeated = distinct < 5 || /(.)\1{4}/u.test(password)
  const common = /^(123456|password|senha|qwerty|abcdef|012345)/i.test(password)
  let level = password.length < 8 ? 1 : password.length < 16 ? 2 : password.length < 22 ? 3 : 4
  if (repeated || common) level = Math.min(level, 1)
  return {
    level,
    label: ['', 'Inicial', 'Em evolução', 'Forte', 'Muito forte'][level],
    hint: password.length < 8 ? 'Continue: o mínimo é 8 caracteres.' : repeated || common ? 'Evite sequências previsíveis e caracteres repetidos.' : level < 4 ? 'Uma frase mais longa e exclusiva ajuda a fortalecer sua senha.' : 'Bom comprimento. Use esta senha apenas na FormFisik.',
  }
}

