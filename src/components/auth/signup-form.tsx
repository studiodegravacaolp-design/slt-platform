'use client'

import { useActionState } from 'react'
import { initialSignupFormState, signUp } from '@/app/(auth)/signup/actions'

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialSignupFormState)
  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0]

  return <form action={formAction} className="student-form onboarding-form">
    <p className="eyebrow">SLT Platform</p>
    <h1>Crie sua conta</h1>
    <p>Depois de confirmar seu e-mail, você poderá configurar sua organização.</p>
    {state.message && <p className={state.status === 'error' ? 'form-error' : 'form-success'} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
    <section className="form-section"><div className="form-grid">
      <label>Nome *<input name="name" required autoComplete="name" aria-invalid={Boolean(fieldError('name'))} />{fieldError('name') && <small>{fieldError('name')}</small>}</label>
      <label>E-mail *<input name="email" type="email" required autoComplete="email" aria-invalid={Boolean(fieldError('email'))} />{fieldError('email') && <small>{fieldError('email')}</small>}</label>
      <label>Senha *<input name="password" type="password" required minLength={8} autoComplete="new-password" aria-invalid={Boolean(fieldError('password'))} />{fieldError('password') && <small>{fieldError('password')}</small>}</label>
      <label>Confirmar senha *<input name="password_confirmation" type="password" required minLength={8} autoComplete="new-password" aria-invalid={Boolean(fieldError('password_confirmation'))} />{fieldError('password_confirmation') && <small>{fieldError('password_confirmation')}</small>}</label>
    </div></section>
    <div className="form-actions"><button type="submit" disabled={pending}>{pending ? 'Criando conta...' : 'Criar conta'}</button></div>
  </form>
}
