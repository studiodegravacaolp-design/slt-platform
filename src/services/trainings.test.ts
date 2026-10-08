import { beforeEach, describe, expect, it, vi } from 'vitest'

const { orderMock, selectMock, fromMock, createClientMock } = vi.hoisted(() => {
  const order = vi.fn()
  const select = vi.fn(() => ({ order }))
  const from = vi.fn(() => ({ select }))
  const createClient = vi.fn(async () => ({ from }))
  return { orderMock: order, selectMock: select, fromMock: from, createClientMock: createClient }
})

vi.mock('@/lib/supabase/server', () => ({ createClient: createClientMock }))

import { assertActiveTrainingContext, assertCompleteExerciseOrder, listTrainings, updateTrainingExercise } from './trainings'

describe('listTrainings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads trainings with the student association required by the navigation', async () => {
    orderMock.mockResolvedValue({ data: [], error: null })

    await expect(listTrainings()).resolves.toEqual([])

    expect(fromMock).toHaveBeenCalledWith('trainings')
    expect(selectMock).toHaveBeenCalledWith('*, student_modality_units!inner(student_id)')
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns a controlled error when the training list cannot be loaded', async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: 'database error' } })

    await expect(listTrainings()).rejects.toThrow('Não foi possível carregar os treinamentos.')
  })
})

describe('training integrity guards', () => {
  it('rejects an inactive student modality unit before a prescription is created', () => {
    expect(() => assertActiveTrainingContext({ id: 1, unit_id: 2, modality_id: 3, status: 'inactive' })).toThrow('O vínculo esportivo selecionado não está ativo')
    expect(assertActiveTrainingContext({ id: 1, unit_id: 2, modality_id: 3, status: 'active' }).id).toBe(1)
  })

  it('requires a complete, unique exercise list for a training reorder', () => {
    expect(() => assertCompleteExerciseOrder([10, 10], [10, 11])).toThrow('cada exercício uma única vez')
    expect(() => assertCompleteExerciseOrder([10], [10, 11])).toThrow('cada exercício uma única vez')
    expect(() => assertCompleteExerciseOrder([10, 12], [10, 11])).toThrow('outro treinamento')
    expect(() => assertCompleteExerciseOrder([11, 10], [10, 11])).not.toThrow()
  })

  it('scopes exercise updates to the training id before writing', async () => {
    const lookup = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
    }
    lookup.select.mockReturnValue(lookup)
    lookup.eq.mockReturnValue(lookup)
    lookup.single.mockResolvedValue({ data: { id: 15, training_id: 8 }, error: null })

    const update = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    }
    update.update.mockReturnValue(update)
    update.eq.mockReturnValue(update)
    update.select.mockReturnValue(update)
    update.single.mockResolvedValue({ data: { id: 15, training_id: 8, exercise_name: 'Agachamento', order: 0 }, error: null })
    fromMock.mockImplementationOnce(() => lookup).mockImplementationOnce(() => update)

    await updateTrainingExercise(8, 15, { exercise_name: 'Agachamento', order: 0 })

    expect(lookup.eq).toHaveBeenNthCalledWith(1, 'id', 15)
    expect(lookup.eq).toHaveBeenNthCalledWith(2, 'training_id', 8)
    expect(update.eq).toHaveBeenNthCalledWith(1, 'id', 15)
    expect(update.eq).toHaveBeenNthCalledWith(2, 'training_id', 8)
  })
})
