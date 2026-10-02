import { beforeEach, describe, expect, it, vi } from 'vitest'

const { orderMock, selectMock, fromMock, createClientMock } = vi.hoisted(() => {
  const order = vi.fn()
  const select = vi.fn(() => ({ order }))
  const from = vi.fn(() => ({ select }))
  const createClient = vi.fn(async () => ({ from }))
  return { orderMock: order, selectMock: select, fromMock: from, createClientMock: createClient }
})

vi.mock('@/lib/supabase/server', () => ({ createClient: createClientMock }))

import { listTrainings } from './trainings'

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
