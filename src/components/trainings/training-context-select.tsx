'use client'

import { useMemo, useState } from 'react'
import { modalitiesForUnit, type ContextModality, type ContextUnit } from '@/components/unit-modality-fields'

type Context = { id: number; unit_id: number; modality_id: number }

export function TrainingContextSelect({ contexts, modalities, units }: Readonly<{ contexts: Context[]; modalities: ContextModality[]; units: ContextUnit[] }>) {
  const availableUnitIds = useMemo(() => new Set(contexts.map((context) => context.unit_id)), [contexts])
  const availableUnits = units.filter((unit) => availableUnitIds.has(unit.id))
  const [unitId, setUnitId] = useState('')
  const [contextId, setContextId] = useState('')
  const contextsForUnit = contexts.filter((context) => String(context.unit_id) === unitId)
  const allowedModalityIds = new Set(contextsForUnit.map((context) => context.modality_id))
  const availableModalities = modalitiesForUnit(modalities, unitId).filter((modality) => allowedModalityIds.has(modality.id))
  return <><label>Unidade *<select value={unitId} required onChange={(event) => { setUnitId(event.target.value); setContextId('') }}><option value="" disabled>Selecione</option>{availableUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label>Modalidade *<select name="student_modality_unit_id" required disabled={!unitId} value={contextId} onChange={(event) => setContextId(event.target.value)}><option value="" disabled>{unitId ? 'Selecione' : 'Selecione uma unidade primeiro'}</option>{availableModalities.map((modality) => { const context = contextsForUnit.find((item) => item.modality_id === modality.id); return context ? <option value={context.id} key={context.id}>{modality.name}</option> : null })}</select></label></>
}
