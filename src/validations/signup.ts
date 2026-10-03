import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.').max(255),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  password_confirmation: z.string(),
}).refine((value) => value.password === value.password_confirmation, {
  message: 'A confirmação de senha não confere.',
  path: ['password_confirmation'],
})

export type SignupInput = z.infer<typeof signupSchema>
