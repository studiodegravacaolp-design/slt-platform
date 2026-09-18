'use server'

import { revalidatePath } from 'next/cache'
import { createAttendance, updateAttendance } from '@/services/attendance'
import { attendanceCreateSchema, attendanceUpdateSchema } from '@/validations/attendance'

export type AttendanceFormState = { status: 'idle' | 'error' | 'success'; message?: string; fieldErrors?: Record<string, string[]> }

function values(formData: FormData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === 'string' && value.trim() === '' ? undefined : value]))
}

function invalidState(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }): AttendanceFormState {
  return { status: 'error', message: 'Revise os campos destacados.', fieldErrors: Object.fromEntries(Object.entries(error.flatten().fieldErrors).filter(([, value]) => value !== undefined)) as Record<string, string[]> }
}

export async function createAttendanceAction(_: AttendanceFormState, formData: FormData): Promise<AttendanceFormState> {
  const parsed = attendanceCreateSchema.safeParse(values(formData))
  if (!parsed.success) return invalidState(parsed.error)
  try { await createAttendance(parsed.data) } catch { return { status: 'error', message: 'Não foi possível registrar a presença. Verifique o contexto esportivo.' } }
  revalidatePath('/attendance')
  return { status: 'success', message: 'Presença registrada com sucesso.' }
}

export async function updateAttendanceAction(id: number, _: AttendanceFormState, formData: FormData): Promise<AttendanceFormState> {
  const parsed = attendanceUpdateSchema.safeParse(values(formData))
  if (!parsed.success) return invalidState(parsed.error)
  try { await updateAttendance(id, parsed.data) } catch { return { status: 'error', message: 'Não foi possível atualizar a presença.' } }
  revalidatePath('/attendance')
  return { status: 'success', message: 'Presença atualizada com sucesso.' }
}

export async function checkInAttendanceAction(id: number, _: AttendanceFormState, _formData: FormData): Promise<AttendanceFormState> {
  void _
  void _formData
  try { await updateAttendance(id, { check_in_time: new Date().toISOString() }) } catch { return { status: 'error', message: 'Não foi possível registrar a entrada.' } }
  revalidatePath('/attendance')
  return { status: 'success', message: 'Entrada registrada com sucesso.' }
}

export async function checkOutAttendanceAction(id: number, _: AttendanceFormState, _formData: FormData): Promise<AttendanceFormState> {
  void _
  void _formData
  try { await updateAttendance(id, { check_out_time: new Date().toISOString() }) } catch { return { status: 'error', message: 'Não foi possível registrar a saída.' } }
  revalidatePath('/attendance')
  return { status: 'success', message: 'Saída registrada com sucesso.' }
}
