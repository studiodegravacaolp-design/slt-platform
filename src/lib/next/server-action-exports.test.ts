import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const serverActionFiles = [
  '../../app/(auth)/signup/actions.ts',
  '../../app/onboarding/actions.ts',
]

describe('server action module exports', () => {
  it('keeps form state objects outside use server modules', () => {
    for (const file of serverActionFiles) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8')
      expect(source).not.toMatch(/^export\s+(const|let|var)\s+/m)
    }
  })
})
