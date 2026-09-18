import { createClient } from '@/lib/supabase/server'
import { getCurrentOrganizationId } from '@/services/organizations'
import type { Tables, TablesInsert } from '@/types/supabase'
import { studentCreateSchema, studentUpdateSchema, type StudentCreateInput, type StudentUpdateInput } from '@/validations/student'

export type Student = Tables<'students'>

export type ListStudentsOptions = { search?: string }

/** Builds the only creation payload accepted by the service; organization_id never comes from the form. */
export function buildStudentInsert(organizationId: number, input: StudentCreateInput): TablesInsert<'students'> {
  return { ...studentCreateSchema.parse(input), organization_id: organizationId }
}

export async function listStudents(options: ListStudentsOptions = {}): Promise<Student[]> {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  let query = supabase.from('students').select('*').eq('organization_id', organizationId).order('full_name')
  const search = options.search?.trim()
  if (search) query = query.ilike('full_name', `%${search}%`)
  const { data, error } = await query
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
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()
  const { data, error } = await supabase.from('students').insert(buildStudentInsert(organizationId, input)).select().single()
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
