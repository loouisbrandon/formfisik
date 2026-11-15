import { z } from '@/lib/validation'

export const passwordHint = 'Use de 8 a 128 caracteres, com uma letra maiúscula, uma minúscula e um caractere especial.'
export const passwordSchema = z.string().min(8, 'Use pelo menos 8 caracteres.').max(128, 'Use até 128 caracteres.')
  .regex(/\p{Lu}/u, 'Inclua uma letra maiúscula.')
  .regex(/\p{Ll}/u, 'Inclua uma letra minúscula.')
  .regex(/[^\p{L}\p{N}\s]/u, 'Inclua um caractere especial.')
