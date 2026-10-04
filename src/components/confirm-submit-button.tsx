'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

type ConfirmSubmitButtonProps = Readonly<{
  children: ReactNode
  message: string
}>

export function ConfirmSubmitButton({ children, message }: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending} onClick={(event) => { if (!window.confirm(message)) event.preventDefault() }}>{pending ? 'Processando...' : children}</button>
}
