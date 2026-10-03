import { describe, expect, it } from 'vitest'
import { settingsSections } from '../page'
import { currentSltPlan } from './page'

describe('SLT current plan settings', () => {
  it('provides a settings link to the current SLT plan', () => {
    expect(settingsSections).toContainEqual({ label: 'Plano', href: '/settings/plan' })
  })

  it('represents the current SLT plan as Free without using student financial plans', () => {
    expect(currentSltPlan).toBe('Free')
    expect(settingsSections.find((section) => section.label === 'Plano')?.href).not.toBe('/financial/plans')
  })
})
