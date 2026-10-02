import { describe, expect, it } from 'vitest'
import { modalitySchema, organizationUpdateSchema, unitSchema } from './settings'

describe('settings validation', () => {
  it('requires a unit name', () => expect(() => unitSchema.parse({})).toThrow())
  it('accepts editable unit fields and a primary-unit flag', () => expect(unitSchema.parse({ name: 'Matriz', code: 'MTZ', email: 'matriz@slt.com', phone: '11999999999', cep: '01001-000', state: 'SP', city: 'São Paulo', neighborhood: 'Sé', street: 'Praça da Sé', number: '1', complement: null, is_main: true })).toMatchObject({ name: 'Matriz', is_main: true }))
  it('rejects invalid unit contact values', () => expect(() => unitSchema.parse({ name: 'Matriz', email: 'invalido' })).toThrow())
  it('requires a valid modality unit', () => expect(() => modalitySchema.parse({ name: 'Tênis', unit_id: 0 })).toThrow())
  it('accepts the organization contact and address fields', () => expect(organizationUpdateSchema.parse({ name: 'SLT', email: 'contato@slt.com', website: 'https://slt.com', cep: '01001-000', state: 'SP', city: 'São Paulo', neighborhood: 'Sé', street: 'Praça da Sé', number: '1', complement: null })).toMatchObject({ name: 'SLT', city: 'São Paulo' }))
  it('rejects invalid organization contact values', () => {
    expect(() => organizationUpdateSchema.parse({ name: 'SLT', email: 'invalido' })).toThrow()
    expect(() => organizationUpdateSchema.parse({ name: 'SLT', website: 'invalido' })).toThrow()
  })
})
