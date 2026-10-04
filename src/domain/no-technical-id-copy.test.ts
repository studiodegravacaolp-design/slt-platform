import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pages = [
  '../app/(protected)/attendance/page.tsx',
  '../app/(protected)/evolution/page.tsx',
  '../app/(protected)/evolution/[id]/page.tsx',
  '../app/(protected)/financial/charges/page.tsx',
  '../app/(protected)/financial/charges/[id]/page.tsx',
  '../app/(protected)/students/[id]/page.tsx',
  '../app/(protected)/students/[id]/financial/page.tsx',
  '../app/(protected)/students/[id]/trainings/new/page.tsx',
]

describe('human-facing fallback copy', () => {
  it('does not render technical identifiers in the audited screens', () => {
    for (const page of pages) {
      const source = readFileSync(new URL(page, import.meta.url), 'utf8')
      for (const pattern of ['Aluno #', 'Unidade #', 'Modalidade #', 'Plano #']) expect(source).not.toContain(pattern)
    }
  })
})
