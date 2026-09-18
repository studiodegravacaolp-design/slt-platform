import { createClient } from '@/lib/supabase/server'
import type { Tables, TablesInsert } from '@/types/supabase'
import { attendanceCreateSchema, attendanceUpdateSchema, type AttendanceCreateInput, type AttendanceUpdateInput } from '@/validations/attendance'
import { getCurrentOrganizationId } from './organizations'

export type Attendance = Tables<'attendance'>
export type ListAttendanceOptions = { date?: string; studentId?: number; unitId?: number; modalityId?: number }

/** organization_id is always resolved on the server, never accepted from a form. */
export function buildAttendanceInsert(organizationId: number, input: AttendanceCreateInput): TablesInsert<'attendance'> {
  return { ...attendanceCreateSchema.parse(input), organization_id: organizationId }
}

async function assertStudentSportContext(organizationId: number, input: Pick<AttendanceCreateInput, 'student_id' | 'unit_id' | 'modality_id'>) {
  const supabase = await createClient()
  const [{ data: student, error: studentError }, { data: unit, error: unitError }, { data: modality, error: modalityError }] = await Promise.all([
    supabase.from('students').select('id').eq('id', input.student_id).eq('organization_id', organizationId).single(),
    supabase.from('units').select('id').eq('id', input.unit_id).eq('organization_id', organizationId).single(),
    supabase.from('modalities').select('unit_id').eq('id', input.modality_id).single(),
  ])
  if (studentError || !student || unitError || !unit || modalityError || !modality || modality.unit_id !== input.unit_id) {
    throw new Error('O contexto de aluno, unidade e modalidade é inválido.')
  }
  const { data: link, error: linkError } = await supabase.from('student_modality_units').select('id').eq('student_id', input.student_id).eq('unit_id', input.unit_id).eq('modality_id', input.modality_id).single()
  if (linkError || !link) throw new Error('O aluno não possui o vínculo esportivo selecionado.')
}

export async function listAttendance(options: ListAttendanceOptions = {}): Promise<Attendance[]> {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  let query = supabase.from('attendance').select('*').eq('organization_id', organizationId).order('date', { ascending: false }).order('created_at', { ascending: false })
  if (options.date) query = query.eq('date', options.date)
  if (options.studentId) query = query.eq('student_id', options.studentId)
  if (options.unitId) query = query.eq('unit_id', options.unitId)
  if (options.modalityId) query = query.eq('modality_id', options.modalityId)
  const { data, error } = await query
  if (error) throw new Error('Não foi possível carregar os registros de presença.')
  return data
}

export async function createAttendance(input: AttendanceCreateInput): Promise<Attendance> {
  const payload = attendanceCreateSchema.parse(input)
  const organizationId = await getCurrentOrganizationId()
  await assertStudentSportContext(organizationId, payload)
  const supabase = await createClient()
  const { data, error } = await supabase.from('attendance').insert(buildAttendanceInsert(organizationId, payload)).select().single()
  if (error) throw new Error('Não foi possível registrar a presença.')
  return data
}

export async function updateAttendance(id: number, input: AttendanceUpdateInput): Promise<Attendance> {
  const payload = attendanceUpdateSchema.parse(input)
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase.from('attendance').update(payload).eq('id', id).eq('organization_id', organizationId).select().single()
  if (error) throw new Error('Não foi possível atualizar a presença.')
  return data
}
