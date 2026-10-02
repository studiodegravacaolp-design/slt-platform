'use client'

import { useFormStatus } from 'react-dom'

export function TrainingCreateSubmitButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending}>{pending ? 'Criando...' : 'Criar'}</button>
}
