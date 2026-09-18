import { z } from 'zod'

const optionalText = z.string().trim().min(1).optional()

/** Matches editable public.attendance fields; organization_id is server-derived. */
export const attendanceCreateSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  unit_id: z.coerce.number().int().positive(),
  modality_id: z.coerce.number().int().positive(),
  date: z.iso.date(),
  status: z.string().trim().min(1),
  check_in_time: optionalText,
  check_out_time: optionalText,
  observation: optionalText,
})

export const attendanceUpdateSchema = z.object({
  status: z.string().trim().min(1).optional(),
  check_in_time: optionalText,
  check_out_time: optionalText,
  observation: optionalText,
})

export type AttendanceCreateInput = z.infer<typeof attendanceCreateSchema>
export type AttendanceUpdateInput = z.infer<typeof attendanceUpdateSchema>
