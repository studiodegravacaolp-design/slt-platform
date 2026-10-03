import { describe, expect, it } from 'vitest'
import { loginLinks } from './page'

describe('login navigation', () => {
  it('keeps password recovery and exposes public signup', () => {
    expect(loginLinks.forgotPassword).toBe('/forgot-password')
    expect(loginLinks.signup).toBe('/signup')
  })
})
