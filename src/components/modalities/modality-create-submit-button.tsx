'use client'

import { useFormStatus } from 'react-dom'

export function ModalityCreateSubmitButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending} aria-busy={pending}>{pending ? 'Criando...' : 'Criar modalidade'}</button>
}
