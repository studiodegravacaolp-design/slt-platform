import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createTraining: vi.fn(),
  updateTraining: vi.fn(),
  updateTrainingStatus: vi.fn(),
  createTrainingExercise: vi.fn(),
  updateTrainingExercise: vi.fn(),
  deleteTrainingExercise: vi.fn(),
  reorderTrainingExercises: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('@/services/trainings', () => ({
  createTraining: mocks.createTraining,
  updateTraining: mocks.updateTraining,
  updateTrainingStatus: mocks.updateTrainingStatus,
  createTrainingExercise: mocks.createTrainingExercise,
  updateTrainingExercise: mocks.updateTrainingExercise,
  deleteTrainingExercise: mocks.deleteTrainingExercise,
  reorderTrainingExercises: mocks.reorderTrainingExercises,
}))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { removeExerciseAction, updateExerciseAction } from './actions'

describe('training exercise actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes the route training id when updating an exercise', async () => {
    const formData = new FormData()
    formData.set('exercise_name', 'Agachamento')
    formData.set('order', '0')

    await updateExerciseAction(8, 15, formData)

    expect(mocks.updateTrainingExercise).toHaveBeenCalledWith(8, 15, { exercise_name: 'Agachamento', order: '0' })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/trainings/8')
  })

  it('passes the route training id when removing an exercise', async () => {
    const formData = new FormData()
    formData.set('exercise_id', '15')

    await removeExerciseAction(8, formData)

    expect(mocks.deleteTrainingExercise).toHaveBeenCalledWith(8, 15)
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/trainings/8')
  })
})
