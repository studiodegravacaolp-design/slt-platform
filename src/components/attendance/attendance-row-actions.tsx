'use client'

import { useActionState } from 'react'
import type { AttendanceFormState } from '@/app/(protected)/attendance/actions'

const initialState: AttendanceFormState = { status: 'idle' }
type AttendanceAction = (state: AttendanceFormState, formData: FormData) => Promise<AttendanceFormState>

function MutationButton({ action, label, pendingLabel }: Readonly<{ action: AttendanceAction; label: string; pendingLabel: string }>) {
  const [state, formAction, pending] = useActionState(action, initialState)
  return <form action={formAction}><button type="submit" disabled={pending}>{pending ? pendingLabel : label}</button>{state.message && <small className={state.status === 'error' ? 'form-error' : 'form-success'} role="status">{state.message}</small>}</form>
}

export function AttendanceRowActions({ status, updateAction, checkInAction, checkOutAction }: Readonly<{ status: string; updateAction: AttendanceAction; checkInAction: AttendanceAction; checkOutAction: AttendanceAction }>) {
  const [state, formAction, pending] = useActionState(updateAction, initialState)
  return <div className="attendance-actions">
    <form action={formAction}><label>Status<input name="status" defaultValue={status} aria-label="Status da presença" /></label><button type="submit" disabled={pending}>{pending ? 'Salvando...' : 'Salvar status'}</button>{state.message && <small className={state.status === 'error' ? 'form-error' : 'form-success'} role="status">{state.message}</small>}</form>
    <MutationButton action={checkInAction} label="Registrar entrada" pendingLabel="Registrando..." />
    <MutationButton action={checkOutAction} label="Registrar saída" pendingLabel="Registrando..." />
  </div>
}
