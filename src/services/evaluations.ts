import { createClient } from '@/lib/supabase/server'
import type { Tables, TablesInsert } from '@/types/supabase'
import { evaluationCreateSchema, evaluationResultCreateSchema, evaluationResultUpdateSchema, evaluationUpdateSchema, type EvaluationCreateInput, type EvaluationResultCreateInput, type EvaluationResultUpdateInput, type EvaluationUpdateInput } from '@/validations/evaluation'
import { getCurrentOrganizationId } from './organizations'

export type Evaluation = Tables<'evaluations'>
export type EvaluationResult = Tables<'evaluation_results'>
export type ListEvaluationsOptions = { studentId?: number; unitId?: number; modalityId?: number; date?: string }

async function currentResponsibleUserId(organizationId: number) {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authUserId = claimsData?.claims.sub
  if (claimsError || typeof authUserId !== 'string') throw new Error('Usuário autenticado não encontrado.')
  const { data: user, error } = await supabase.from('users').select('id').eq('id', authUserId).eq('organization_id', organizationId).single()
  if (error || !user) throw new Error('Usuário responsável não encontrado na organização.')
  return user.id
}

async function assertStudentSportContext(organizationId: number, input: Pick<EvaluationCreateInput, 'student_id' | 'unit_id' | 'modality_id'>) {
  const supabase = await createClient()
  const [{ data: student, error: studentError }, { data: unit, error: unitError }, { data: modality, error: modalityError }] = await Promise.all([
    supabase.from('students').select('id').eq('id', input.student_id).eq('organization_id', organizationId).single(),
    supabase.from('units').select('id').eq('id', input.unit_id).eq('organization_id', organizationId).single(),
    supabase.from('modalities').select('unit_id').eq('id', input.modality_id).single(),
  ])
  if (studentError || !student || unitError || !unit || modalityError || !modality || modality.unit_id !== input.unit_id) throw new Error('O contexto de aluno, unidade e modalidade é inválido.')
  const { data: link, error: linkError } = await supabase.from('student_modality_units').select('id').eq('student_id', input.student_id).eq('unit_id', input.unit_id).eq('modality_id', input.modality_id).single()
  if (linkError || !link) throw new Error('O aluno não possui o vínculo esportivo selecionado.')
}

export async function listEvaluations(options: ListEvaluationsOptions = {}): Promise<Evaluation[]> {
  const supabase = await createClient(); const organizationId = await getCurrentOrganizationId()
  let query = supabase.from('evaluations').select('*').eq('organization_id', organizationId).order('date', { ascending: false })
  if (options.studentId) query = query.eq('student_id', options.studentId)
  if (options.unitId) query = query.eq('unit_id', options.unitId)
  if (options.modalityId) query = query.eq('modality_id', options.modalityId)
  if (options.date) query = query.eq('date', options.date)
  const { data, error } = await query; if (error) throw new Error('Não foi possível carregar as avaliações.'); return data
}

export async function listEvaluationsByStudent(studentId: number) { return listEvaluations({ studentId }) }
export async function getEvaluation(id: number): Promise<Evaluation> { const s = await createClient(); const { data, error } = await s.from('evaluations').select('*').eq('id', id).single(); if (error) throw new Error('Avaliação não encontrada.'); return data }
export async function createEvaluation(input: EvaluationCreateInput): Promise<Evaluation> {
  const payload = evaluationCreateSchema.parse(input); const organizationId = await getCurrentOrganizationId(); await assertStudentSportContext(organizationId, payload); const responsible_user_id = await currentResponsibleUserId(organizationId); const s = await createClient()
  const insert: TablesInsert<'evaluations'> = { ...payload, organization_id: organizationId, responsible_user_id }
  const { data, error } = await s.from('evaluations').insert(insert).select().single(); if (error) throw new Error('Não foi possível criar a avaliação.'); return data
}
export async function updateEvaluation(id: number, input: EvaluationUpdateInput): Promise<Evaluation> { const s = await createClient(); const organizationId = await getCurrentOrganizationId(); const { data, error } = await s.from('evaluations').update(evaluationUpdateSchema.parse(input)).eq('id', id).eq('organization_id', organizationId).select().single(); if (error) throw new Error('Não foi possível atualizar a avaliação.'); return data }
export async function listEvaluationResults(evaluationId: number): Promise<EvaluationResult[]> { const s = await createClient(); const { data, error } = await s.from('evaluation_results').select('*').eq('evaluation_id', evaluationId).order('created_at'); if (error) throw new Error('Não foi possível carregar os resultados.'); return data }
export async function createEvaluationResult(evaluationId: number, input: EvaluationResultCreateInput): Promise<EvaluationResult> { const s = await createClient(); const { data, error } = await s.from('evaluation_results').insert({ ...evaluationResultCreateSchema.parse(input), evaluation_id: evaluationId }).select().single(); if (error) throw new Error('Não foi possível adicionar o resultado.'); return data }
export async function updateEvaluationResult(id: number, input: EvaluationResultUpdateInput): Promise<EvaluationResult> { const s = await createClient(); const { data, error } = await s.from('evaluation_results').update(evaluationResultUpdateSchema.parse(input)).eq('id', id).select().single(); if (error) throw new Error('Não foi possível atualizar o resultado.'); return data }
export async function deleteEvaluationResult(id: number) { const s = await createClient(); const { error } = await s.from('evaluation_results').delete().eq('id', id); if (error) throw new Error('Não foi possível remover o resultado.') }
