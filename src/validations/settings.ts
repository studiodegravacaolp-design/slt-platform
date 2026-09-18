import { z } from 'zod'
const text = z.string().trim().min(1).optional()
const nullable = z.string().trim().min(1).nullable().optional()
export const organizationUpdateSchema = z.object({ name: text, trade_name: nullable, cnpj: nullable, email: z.email().nullable().optional(), phone: nullable, website: z.url().nullable().optional(), logo: z.url().nullable().optional(), cep: nullable, street: nullable, number: nullable, complement: nullable, neighborhood: nullable, city: nullable, state: nullable, status: text })
export const unitSchema = z.object({ name: z.string().trim().min(1), code: nullable, email: z.email().nullable().optional(), phone: nullable, logo: z.url().nullable().optional(), cep: nullable, street: nullable, number: nullable, complement: nullable, neighborhood: nullable, city: nullable, state: nullable, status: text, is_main: z.boolean().optional() })
export const modalitySchema = z.object({ name: z.string().trim().min(1), description: nullable, status: text, unit_id: z.coerce.number().int().positive() })
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>; export type UnitInput = z.infer<typeof unitSchema>; export type ModalityInput = z.infer<typeof modalitySchema>
