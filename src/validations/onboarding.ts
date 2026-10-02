import { z } from 'zod'

const optionalText = z.string().trim().transform((value) => value || undefined).optional()

export const organizationOnboardingSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da organização.').max(255),
  trade_name: optionalText,
  email: z.string().trim().email('Informe um e-mail válido.').optional().or(z.literal('')).transform((value) => value || undefined),
  phone: optionalText,
})

export type OrganizationOnboardingInput = {
  name: string
  trade_name?: string | undefined
  email?: string | undefined
  phone?: string | undefined
}
