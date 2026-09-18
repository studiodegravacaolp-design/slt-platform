import { describe, expect, it } from 'vitest'
import { buildAttendanceInsert } from '@/services/attendance'
import { attendanceCreateSchema, attendanceUpdateSchema } from './attendance'

const validAttendance = { student_id: 10, unit_id: 20, modality_id: 30, date: '2026-09-18', status: 'presente' }

describe('attendance validation', () => {
  it('accepts canonical fields', () => expect(attendanceCreateSchema.parse(validAttendance)).toMatchObject(validAttendance))
  it('rejects invalid ids, dates, and status', () => {
    expect(() => attendanceCreateSchema.parse({ ...validAttendance, student_id: 0 })).toThrow()
    expect(() => attendanceCreateSchema.parse({ ...validAttendance, date: '18/09/2026' })).toThrow()
    expect(() => attendanceCreateSchema.parse({ ...validAttendance, status: ' ' })).toThrow()
  })
  it('does not permit organization_id in updates', () => expect(attendanceUpdateSchema.parse({ status: 'ausente', organization_id: 999 })).toEqual({ status: 'ausente' }))
})

describe('buildAttendanceInsert', () => {
  it('uses the server organization context', () => {
    const payload = buildAttendanceInsert(42, { ...validAttendance, ...({ organization_id: 999 } as object) })
    expect(payload.organization_id).toBe(42)
  })
})
