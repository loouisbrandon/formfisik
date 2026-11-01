import { z } from 'zod'
export const recoverySchema = z.object({
  email: z.email('Informe um e-mail válido.').max(254).transform(value => value.toLowerCase()),
})
export const resetTokenSchema = z.object({ token: z.string().regex(/^[\w-]{43}$/) })
export const resetPasswordSchema = resetTokenSchema.extend({
  password: z.string().min(12, 'Use pelo menos 12 caracteres.').max(128, 'Use até 128 caracteres.'),
  confirmPassword: z.string(),
}).refine(value => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'As senhas precisam ser iguais.' })
export const recoveryAccepted = 'Se este endereço estiver apto para recuperação, você receberá as orientações por e-mail. Confira também o spam.'
export const invalidResetLink = 'Link inválido, expirado ou já utilizado. Solicite um novo link de recuperação.'
