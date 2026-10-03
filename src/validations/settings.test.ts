import { describe, expect, it } from 'vitest'
import { modalitySchema, operationalStatusSchema, organizationUpdateSchema, unitSchema } from './settings'

describe('settings validation', () => {
  it('requires a unit name', () => expect(() => unitSchema.parse({})).toThrow())
  it('accepts editable unit fields and a primary-unit flag', () => expect(unitSchema.parse({ name: 'Matriz', code: 'MTZ', email: 'matriz@slt.com', phone: '11999999999', cep: '01001-000', state: 'SP', city: 'São Paulo', neighborhood: 'Sé', street: 'Praça da Sé', number: '1', complement: null, is_main: true })).toMatchObject({ name: 'Matriz', is_main: true }))
  it('rejects invalid unit contact values', () => expect(() => unitSchema.parse({ name: 'Matriz', email: 'invalido' })).toThrow())
  it('requires a valid modality unit', () => expect(() => modalitySchema.parse({ name: 'Tênis', unit_id: 0 })).toThrow())
  it('accepts canonical modality fields and rejects a blank name', () => {
    expect(modalitySchema.parse({ name: 'Tênis', description: 'Iniciação', unit_id: '1' })).toMatchObject({ name: 'Tênis', unit_id: 1 })
    expect(() => modalitySchema.parse({ name: ' ', unit_id: 1 })).toThrow()
  })
  it('accepts the organization contact and address fields', () => expect(organizationUpdateSchema.parse({ name: 'SLT', email: 'contato@slt.com', website: 'https://slt.com', cep: '01001-000', state: 'SP', city: 'São Paulo', neighborhood: 'Sé', street: 'Praça da Sé', number: '1', complement: null })).toMatchObject({ name: 'SLT', city: 'São Paulo' }))
  it('rejects invalid organization contact values', () => {
    expect(() => organizationUpdateSchema.parse({ name: 'SLT', email: 'invalido' })).toThrow()
    expect(() => organizationUpdateSchema.parse({ name: 'SLT', website: 'invalido' })).toThrow()
  })
  it('accepts only the canonical operational statuses', () => {
    expect(operationalStatusSchema.parse('active')).toBe('active')
    expect(operationalStatusSchema.parse('inactive')).toBe('inactive')
    expect(() => operationalStatusSchema.parse('archived')).toThrow()
  })
  it('uses canonical statuses for units and modalities', () => {
    expect(unitSchema.parse({ name: 'Matriz', status: 'inactive' }).status).toBe('inactive')
    expect(modalitySchema.parse({ name: 'Tênis', unit_id: 1, status: 'active' }).status).toBe('active')
    expect(() => modalitySchema.parse({ name: 'Tênis', unit_id: 1, status: 'pending' })).toThrow()
  })
})
