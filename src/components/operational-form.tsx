'use client'

import { useActionState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

type FormState = { message?: string; status: 'idle' | 'success' | 'error' }
type FormAction = (formData: FormData) => Promise<void>

const initialState: FormState = { status: 'idle' }

export function OperationalForm({ action, children, className, successMessage }: Readonly<{
  action: FormAction
  children: ReactNode
  className?: string
  successMessage: string
}>) {
  const [state, formAction] = useActionState(async (_previousState: FormState, formData: FormData): Promise<FormState> => {
    try {
      await action(formData)
      return { status: 'success', message: successMessage }
    } catch {
      return { status: 'error', message: 'Não foi possível concluir a operação. Tente novamente.' }
    }
  }, initialState)

  return <form action={formAction} className={className}>
    {children}
    {state.message && <p className={state.status === 'error' ? 'form-error' : 'form-success'} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
  </form>
}

export function OperationalSubmitButton({ idleLabel, pendingLabel }: Readonly<{ idleLabel: string; pendingLabel: string }>) {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending}>{pending ? pendingLabel : idleLabel}</button>
}
