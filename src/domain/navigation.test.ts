import { describe, expect, it } from 'vitest'
import { isNavigationItemActive } from './navigation'

describe('sidebar navigation state', () => {
  it('keeps Configurações active for its hub and configuration subpages', () => {
    for (const pathname of ['/settings', '/settings/organization', '/settings/profile', '/settings/security', '/settings/plan', '/settings/modalities', '/settings/modalities/12']) {
      expect(isNavigationItemActive(pathname, '/settings')).toBe(true)
    }
  })

  it('marks only Unidades active for unit routes', () => {
    for (const pathname of ['/settings/units', '/settings/units/4']) {
      expect(isNavigationItemActive(pathname, '/settings/units')).toBe(true)
      expect(isNavigationItemActive(pathname, '/settings')).toBe(false)
    }
  })
})
