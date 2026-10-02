import { z } from 'zod'

export const passwordRecoveryRequestSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
})

export type PasswordRecoveryRequestInput = z.infer<typeof passwordRecoveryRequestSchema>
