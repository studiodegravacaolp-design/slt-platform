import { describe, expect, it } from 'vitest'; import { modalitySchema, unitSchema } from './settings'
describe('settings validation', () => { it('requires a unit name', () => expect(() => unitSchema.parse({})).toThrow()); it('requires a valid modality unit', () => expect(() => modalitySchema.parse({ name: 'Tênis', unit_id: 0 })).toThrow()) })
