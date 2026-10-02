import { describe, expect, it } from 'vitest'
import { buildRecentAttendance, buildRecentEvaluations, getOperationalDate } from './dashboard'

describe('dashboard helpers', () => {
  it('uses the operational date in São Paulo instead of UTC', () => expect(getOperationalDate(new Date('2026-01-01T01:30:00.000Z'))).toBe('2025-12-31'))
  it('maps recent attendance without depending on record order', () => {
    const records = [{ id: 1, date: '2026-01-01', status: 'registered', student_id: 10, unit_id: 20, modality_id: 30 }]
    expect(buildRecentAttendance(records, [{ id: 10, full_name: 'Ana', social_name: 'Aninha' }], [{ id: 20, name: 'Matriz' }], [{ id: 30, name: 'Natação' }])).toEqual([{ id: 1, date: '2026-01-01', status: 'registered', studentName: 'Aninha', unitName: 'Matriz', modalityName: 'Natação' }])
  })
  it('keeps missing recent evaluation references explicit', () => {
    const records = [{ id: 1, date: '2026-01-01', type: 'Física', student_id: 10, modality_id: 30 }]
    expect(buildRecentEvaluations(records, [], [])).toEqual([{ id: 1, date: '2026-01-01', type: 'Física', studentName: null, modalityName: null }])
  })
})
