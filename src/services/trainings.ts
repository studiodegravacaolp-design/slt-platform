import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import {
  assertTrainingDateRange,
  trainingExerciseSchema,
  trainingSchema,
  trainingStatusSchema,
  trainingUpdateSchema,
} from '@/validations/training-plan'
import { getActiveModality } from './modalities'
import { getActiveUnit } from './units'

export type Training = Tables<'trainings'>
export type TrainingExercise = Tables<'training_exercises'>

type TrainingContext = Pick<Tables<'student_modality_units'>, 'id' | 'unit_id' | 'modality_id' | 'status'>

export function assertActiveTrainingContext(context: TrainingContext | null) {
  if (!context || context.status !== 'active') {
    throw new Error('O vínculo esportivo selecionado não está ativo ou não pertence ao aluno.')
  }
  return context
}

export async function getTraining(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('trainings').select('*').eq('id', id).single()
  if (error || !data) throw new Error('Treinamento não encontrado.')
  return data
}

export async function listTrainings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trainings')
    .select('*, student_modality_units!inner(student_id)')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Não foi possível carregar os treinamentos.')
  return data
}

export async function listTrainingsByStudent(studentId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trainings')
    .select('*, student_modality_units!inner(student_id)')
    .eq('student_modality_units.student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw new Error('Não foi possível carregar os treinamentos.')
  return data
}

export async function createTraining(studentId: number, input: unknown) {
  const payload = trainingSchema.parse(input)
  const supabase = await createClient()
  const { data: context, error: contextError } = await supabase
    .from('student_modality_units')
    .select('id, unit_id, modality_id, status')
    .eq('id', payload.student_modality_unit_id)
    .eq('student_id', studentId)
    .single()

  if (contextError) throw new Error('O vínculo esportivo selecionado não está ativo ou não pertence ao aluno.')
  assertActiveTrainingContext(context)

  await getActiveUnit(context.unit_id)
  const modality = await getActiveModality(context.modality_id)
  if (modality.unit_id !== context.unit_id) throw new Error('Contexto esportivo inválido.')

  const { data, error } = await supabase.from('trainings').insert(payload).select().single()
  if (error || !data) throw new Error('Não foi possível criar o treinamento.')
  return data
}

export async function listTrainingExercises(trainingId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('training_exercises').select('*').eq('training_id', trainingId).order('order')
  if (error) throw new Error('Não foi possível carregar exercícios.')
  return data
}

async function getTrainingExercise(trainingId: number, exerciseId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_exercises')
    .select('*')
    .eq('id', exerciseId)
    .eq('training_id', trainingId)
    .single()
  if (error || !data) throw new Error('Exercício não pertence ao treinamento informado.')
  return data
}

export async function createTrainingExercise(trainingId: number, input: unknown) {
  await getTraining(trainingId)
  const payload = trainingExerciseSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase.from('training_exercises').insert({ ...payload, training_id: trainingId }).select().single()
  if (error || !data) throw new Error('Não foi possível criar exercício.')
  return data
}

export async function updateTraining(id: number, input: unknown) {
  const payload = trainingUpdateSchema.parse(input)
  const { student_modality_unit_id, ...update } = payload
  if (student_modality_unit_id !== undefined) throw new Error('O contexto esportivo do treinamento não pode ser alterado.')

  const current = await getTraining(id)
  assertTrainingDateRange(update.start_date ?? current.start_date ?? undefined, update.end_date ?? current.end_date ?? undefined)

  const supabase = await createClient()
  const { data, error } = await supabase.from('trainings').update(update).eq('id', id).select().single()
  if (error || !data) throw new Error('Não foi possível atualizar o treinamento.')
  return data
}

export async function updateTrainingStatus(id: number, status: unknown) {
  return updateTraining(id, { status: trainingStatusSchema.parse(status) })
}

export async function updateTrainingExercise(trainingId: number, exerciseId: number, input: unknown) {
  await getTrainingExercise(trainingId, exerciseId)
  const payload = trainingExerciseSchema.partial().parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_exercises')
    .update(payload)
    .eq('id', exerciseId)
    .eq('training_id', trainingId)
    .select()
    .single()
  if (error || !data) throw new Error('Não foi possível atualizar exercício.')
  return data
}

export async function deleteTrainingExercise(trainingId: number, exerciseId: number) {
  await getTrainingExercise(trainingId, exerciseId)
  const supabase = await createClient()
  const { error } = await supabase.from('training_exercises').delete().eq('id', exerciseId).eq('training_id', trainingId)
  if (error) throw new Error('Não foi possível remover exercício.')
}

export function assertCompleteExerciseOrder(exerciseIds: number[], expectedExerciseIds: number[]) {
  if (!exerciseIds.length || exerciseIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error('A ordem dos exercícios é inválida.')
  }
  if (new Set(exerciseIds).size !== exerciseIds.length || exerciseIds.length !== expectedExerciseIds.length) {
    throw new Error('A ordem dos exercícios deve conter cada exercício uma única vez.')
  }
  const expected = new Set(expectedExerciseIds)
  if (exerciseIds.some((id) => !expected.has(id))) {
    throw new Error('A ordem contém exercícios de outro treinamento.')
  }
}

/**
 * The canonical schema exposes no transactional reorder RPC. Updates are validated
 * before writing, but remain sequential until an authorized RPC is available.
 */
export async function reorderTrainingExercises(trainingId: number, exerciseIds: number[]) {
  const currentExercises = await listTrainingExercises(trainingId)
  assertCompleteExerciseOrder(exerciseIds, currentExercises.map((exercise) => exercise.id))

  const supabase = await createClient()
  for (const [order, id] of exerciseIds.entries()) {
    const { error } = await supabase.from('training_exercises').update({ order }).eq('id', id).eq('training_id', trainingId)
    if (error) throw new Error('Não foi possível reorganizar exercícios.')
  }
}
