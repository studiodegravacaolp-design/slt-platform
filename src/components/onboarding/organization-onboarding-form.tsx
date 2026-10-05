'use client'

import { useActionState } from 'react'
import { createOrganizationOnboardingAction } from '@/app/onboarding/actions'
import { initialOnboardingFormState } from '@/lib/onboarding/form-state'

function fieldError(state: typeof initialOnboardingFormState, field: string) {
  return state.fieldErrors?.[field]?.[0]
}

export function OrganizationOnboardingForm({ email }: Readonly<{ email: string | null }>) {
  const [state, formAction, pending] = useActionState(createOrganizationOnboardingAction, initialOnboardingFormState)

  return <form action={formAction} className="student-form onboarding-form">
    {state.status === 'error' && state.message && <p className="form-error" role="alert">{state.message}</p>}
    <section className="form-section">
      <div className="form-grid">
        <label className="span-2">Nome da organização *
          <input name="name" required autoComplete="organization" aria-invalid={Boolean(fieldError(state, 'name'))} />
          {fieldError(state, 'name') && <small>{fieldError(state, 'name')}</small>}
        </label>
        <label>Nome fantasia
          <input name="trade_name" autoComplete="organization-title" />
        </label>
        <label>E-mail
          <input name="email" type="email" autoComplete="email" defaultValue={email ?? ''} aria-invalid={Boolean(fieldError(state, 'email'))} />
          {fieldError(state, 'email') && <small>{fieldError(state, 'email')}</small>}
        </label>
        <label>Telefone
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
    </section>
    <div className="form-actions"><button type="submit" disabled={pending}>{pending ? 'Criando organização...' : 'Criar organização'}</button></div>
  </form>
}
