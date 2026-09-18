import { createClient } from '@/lib/supabase/server'
import { getCurrentOrganizationId } from '@/services/organizations'
import type { Tables } from '@/types/supabase'
import { studentCreateSchema, studentUpdateSchema, type StudentCreateInput, type StudentUpdateInput } from '@/validations/student'

export type Student = Tables<'students'>

export async function listStudents(): Promise<Student[]> {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase.from('students').select('*').eq('organization_id', organizationId).order('full_name')
  if (error) throw new Error('Não foi possível carregar os alunos.')
  return data
}

export async function getStudent(studentId: number): Promise<Student> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('students').select('*').eq('id', studentId).single()
  if (error) throw new Error('Aluno não encontrado.')
  return data
}

export async function createStudent(input: StudentCreateInput): Promise<Student> {
  const payload = studentCreateSchema.parse(input)
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase.from('students').insert({ ...payload, organization_id: organizationId }).select().single()
  if (error) throw new Error('Não foi possível criar o aluno.')
  return data
}

export async function updateStudent(studentId: number, input: StudentUpdateInput): Promise<Student> {
  const payload = studentUpdateSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase.from('students').update(payload).eq('id', studentId).select().single()
  if (error) throw new Error('Não foi possível atualizar o aluno.')
  return data
}
