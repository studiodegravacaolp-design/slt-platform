'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createTraining,
  createTrainingExercise,
  deleteTrainingExercise,
  reorderTrainingExercises,
  updateTraining,
  updateTrainingExercise,
  updateTrainingStatus,
} from '@/services/trainings'

type TrainingActionResult = { status: 'success' | 'error'; message: string }

const data = (formData: FormData) => Object.fromEntries([...formData].map(([key, value]) => [key, value === '' ? undefined : value]))
const operationSuccess = (message: string): TrainingActionResult => ({ status: 'success', message })
const operationFailure = (message: string): TrainingActionResult => ({ status: 'error', message })

function trainingActionFailure(error: unknown): TrainingActionResult {
  if (error instanceof Error && [
    'A data de término não pode ser anterior à data de início.',
    'O vínculo esportivo selecionado não está ativo ou não pertence ao aluno.',
    'Contexto esportivo inválido.',
    'Exercício não pertence ao treinamento informado.',
    'A ordem dos exercícios é inválida.',
    'A ordem dos exercícios deve conter cada exercício uma única vez.',
    'A ordem contém exercícios de outro treinamento.',
  ].includes(error.message)) return operationFailure(error.message)

  return operationFailure('Revise os campos informados e tente novamente.')
}

export async function createTrainingAction(studentId: number, formData: FormData): Promise<TrainingActionResult> {
  let training
  try {
    training = await createTraining(studentId, data(formData))
  } catch (error) {
    return trainingActionFailure(error)
  }
  redirect(`/trainings/${training.id}`)
}

export async function saveTrainingAction(id: number, formData: FormData): Promise<TrainingActionResult> {
  try {
    await updateTraining(id, data(formData))
  } catch (error) {
    return trainingActionFailure(error)
  }
  redirect(`/trainings/${id}`)
}

export async function statusTrainingAction(id: number, formData: FormData): Promise<TrainingActionResult> {
  try {
    await updateTrainingStatus(id, formData.get('status'))
  } catch (error) {
    return trainingActionFailure(error)
  }
  revalidatePath(`/trainings/${id}`)
  return operationSuccess('Status atualizado com sucesso.')
}

export async function addExerciseAction(id: number, formData: FormData): Promise<TrainingActionResult> {
  try {
    await createTrainingExercise(id, data(formData))
  } catch (error) {
    return trainingActionFailure(error)
  }
  revalidatePath(`/trainings/${id}`)
  return operationSuccess('Exercício adicionado com sucesso.')
}

export async function updateExerciseAction(trainingId: number, exerciseId: number, formData: FormData): Promise<TrainingActionResult> {
  try {
    await updateTrainingExercise(trainingId, exerciseId, data(formData))
  } catch (error) {
    return trainingActionFailure(error)
  }
  revalidatePath(`/trainings/${trainingId}`)
  return operationSuccess('Exercício atualizado com sucesso.')
}

export async function removeExerciseAction(id: number, formData: FormData): Promise<TrainingActionResult> {
  try {
    await deleteTrainingExercise(id, Number(formData.get('exercise_id')))
  } catch (error) {
    return trainingActionFailure(error)
  }
  revalidatePath(`/trainings/${id}`)
  return operationSuccess('Exercício removido com sucesso.')
}

export async function orderExercisesAction(id: number, formData: FormData): Promise<TrainingActionResult> {
  try {
    await reorderTrainingExercises(id, String(formData.get('ids')).split(',').map(Number))
  } catch (error) {
    return trainingActionFailure(error)
  }
  revalidatePath(`/trainings/${id}`)
  return operationSuccess('Ordem atualizada com sucesso.')
}
