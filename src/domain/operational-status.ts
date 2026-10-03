export const operationalStatuses = ['active', 'inactive'] as const

export type OperationalStatus = (typeof operationalStatuses)[number]

export const operationalStatusLabel = (status: string) => status === 'active' ? 'Ativa' : 'Inativa'

export function assertActiveUnit(status: string) {
  if (status !== 'active') throw new Error('A unidade selecionada está inativa.')
}

export function assertActiveModality(status: string) {
  if (status !== 'active') throw new Error('A modalidade selecionada está inativa.')
}
