import { z } from 'zod'
export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.').max(254).transform(value => value.toLowerCase()),
  // Preserve password bytes. A login should not enforce a new registration policy.
  password: z.string().min(1, 'Informe sua senha.').max(128, 'Use até 128 caracteres.'),
})
export const invalidCredentials = 'Não foi possível entrar. Confira e-mail e senha e confirme seu endereço pelo link recebido no cadastro.'
