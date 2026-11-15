import { passwordSchema } from '@/modules/auth/password-policy'
import { z } from '@/lib/validation'

export const registrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'Use até 120 caracteres.').refine(v => !/[\u0000-\u001f\u007f]/.test(v), 'Nome inválido.'),
  email: z.email('Informe um e-mail válido.').max(254).transform(v => v.toLowerCase()),
  password: passwordSchema,
  confirmPassword: z.string(),
  website: z.string().max(0).optional(),
}).strict().refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'As senhas precisam ser iguais.' })

export const acceptedMessage = 'Se este endereço puder ser utilizado, você receberá as orientações por e-mail. Confira também o spam. O envio pode levar alguns minutos.'
