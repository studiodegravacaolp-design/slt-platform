import { describe, expect, it } from 'vitest'
import { userProfileUpdateSchema } from './user-profile'

describe('userProfileUpdateSchema', () => {
  it('accepts only editable profile fields', () => expect(userProfileUpdateSchema.parse({ name: ' Ana Silva ', phone: null, email: 'ignored@example.com' })).toEqual({ name: 'Ana Silva', phone: null }))
  it('rejects an empty name and invalid phone', () => {
    expect(() => userProfileUpdateSchema.parse({ name: ' ' })).toThrow()
    expect(() => userProfileUpdateSchema.parse({ name: 'Ana', phone: ' ' })).toThrow()
  })
})
