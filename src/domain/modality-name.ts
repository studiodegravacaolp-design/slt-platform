// Keep these explicit character sets in sync with the database migration.
// No locale-dependent case folding, compatibility normalization or fuzzy matching.
import caseMap from './modality-case-map.json'
export const modalityWhitespace = '\u0009\u000a\u000b\u000c\u000d\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff'
export const modalityDiacritics = '\u0300\u0301\u0302\u0303\u0304\u0306\u0307\u0308\u030a\u030b\u030c\u0327\u0328'
const whitespace = new RegExp(`[${modalityWhitespace}]+`, 'gu')
const diacritics = new RegExp(`[${modalityDiacritics}]`, 'gu')
const lowercaseCharacters = Array.from(caseMap.lowercase)
const lowercaseMap = new Map(Array.from(caseMap.uppercase, (letter, index) => [letter, lowercaseCharacters[index]]))
const canonicalNames: Readonly<Record<string, string>> = { natacao: 'Natação' }

export function cleanModalityName(name: string): string {
  return name.normalize('NFC').replace(whitespace, ' ').replace(/^ +| +$/g, '')
}

export function normalizeModalityName(name: string): string {
  const decomposed = cleanModalityName(name).normalize('NFD').replace(diacritics, '')
  // Frozen simple-lowercase mapping is identical to PostgreSQL translate().
  // Do not depend on the host's locale or future Unicode casing changes.
  return Array.from(decomposed, (letter) => lowercaseMap.get(letter) ?? letter).join('').normalize('NFC')
}

export function canonicalizeModalityName(name: string): string {
  const key = normalizeModalityName(name)
  return Object.hasOwn(canonicalNames, key) ? canonicalNames[key] : cleanModalityName(name)
}

export const modalityDuplicateMessages = {
  active: 'Esta modalidade já existe nesta unidade.',
  inactive: 'Esta modalidade já existe nesta unidade e está inativa. Reative o cadastro existente.',
} as const

export class ModalityDuplicateError extends Error {
  constructor(public readonly status: 'active' | 'inactive') {
    super(modalityDuplicateMessages[status])
    this.name = 'ModalityDuplicateError'
  }
}

export function isModalityUniqueViolation(error: { code?: string; message?: string }): boolean {
  return error.code === '23505' && Boolean(error.message?.includes('"modalities_unit_name_key_key"'))
}
