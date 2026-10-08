'use client'

import { useActionState, type ReactNode } from 'react'

type TrainingActionResult = { status: 'success' | 'error'; message: string }
type TrainingFormAction = (formData: FormData) => Promise<void | TrainingActionResult>
type FormState = { message?: string; status: 'idle' | 'success' | 'error' }

const initialState: FormState = { status: 'idle' }

/** Keeps training action feedback independent from the financial module. */
export function TrainingOperationalForm({ action, children, className, successMessage }: Readonly<{
  action: TrainingFormAction
  children: ReactNode
  className?: string
  successMessage: string
}>) {
  const [state, formAction] = useActionState(async (_previousState: FormState, formData: FormData): Promise<FormState> => {
    try {
      const result = await action(formData)
      if (result) return result
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
