'use client'

import { useState } from 'react'

export type ContextUnit = { id: number; name: string }
export type ContextModality = { id: number; name: string; unit_id: number }

export function modalitiesForUnit<T extends ContextModality>(modalities: T[], unitId: string) {
  return modalities.filter((modality) => String(modality.unit_id) === unitId)
}

export function UnitModalityFields({ modalities, units, unitError, modalityError }: Readonly<{
  modalities: ContextModality[]
  units: ContextUnit[]
  unitError?: string
  modalityError?: string
}>) {
  const [unitId, setUnitId] = useState('')
  const [modalityId, setModalityId] = useState('')
  const availableModalities = modalitiesForUnit(modalities, unitId)

  return <>
    <label>Unidade *<select name="unit_id" required value={unitId} onChange={(event) => { setUnitId(event.target.value); setModalityId('') }}><option value="" disabled>Selecione</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>{unitError && <small>{unitError}</small>}</label>
    <label>Modalidade *<select name="modality_id" required value={modalityId} disabled={!unitId} onChange={(event) => setModalityId(event.target.value)}><option value="" disabled>{unitId ? 'Selecione' : 'Selecione uma unidade primeiro'}</option>{availableModalities.map((modality) => <option key={modality.id} value={modality.id}>{modality.name}</option>)}</select>{modalityError && <small>{modalityError}</small>}</label>
  </>
}
