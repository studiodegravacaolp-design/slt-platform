import { z } from 'zod'

export const userProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  phone: z.string().trim().min(1).nullable().optional(),
})

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>
