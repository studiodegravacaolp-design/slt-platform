import { describe, expect, it } from 'vitest'
import { buildStudentInsert } from './students'

describe('buildStudentInsert', () => {
  it('uses organization context instead of a client-provided organization id', () => {
    const payload = buildStudentInsert(42, { full_name: 'Ana Silva', birth_date: '2011-03-18', ...({ organization_id: 999 } as object) })
    expect(payload.organization_id).toBe(42)
  })
})
