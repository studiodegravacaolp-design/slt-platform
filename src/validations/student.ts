import { z } from 'zod'

const nullableText = z.string().trim().min(1).nullable().optional()

/** Input contract confirmed against the generated public.students Insert type. */
export const studentCreateSchema = z.object({
  full_name: z.string().trim().min(1).max(255),
  birth_date: z.iso.date(),
  cpf: nullableText,
  email: z.email().nullable().optional(),
  phone: nullableText,
  whatsapp: nullableText,
  photo: z.url().nullable().optional(),
  sex: nullableText,
  social_name: nullableText,
  sports_notes: nullableText,
  start_date: z.iso.date().nullable().optional(),
  status: z.string().trim().min(1).optional(),
  cep: nullableText,
  street: nullableText,
  number: nullableText,
  complement: nullableText,
  neighborhood: nullableText,
  city: nullableText,
  state: nullableText,
})

export const studentUpdateSchema = studentCreateSchema.partial()

export type StudentCreateInput = z.infer<typeof studentCreateSchema>
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>
