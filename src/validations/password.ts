import { z } from 'zod'

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  password_confirmation: z.string(),
}).refine((value) => value.password === value.password_confirmation, {
  message: 'A confirmação de senha não confere.',
  path: ['password_confirmation'],
})

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>
