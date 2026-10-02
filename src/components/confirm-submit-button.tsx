'use client'

import type { ReactNode } from 'react'

type ConfirmSubmitButtonProps = Readonly<{
  children: ReactNode
  message: string
}>

export function ConfirmSubmitButton({ children, message }: ConfirmSubmitButtonProps) {
  return <button type="submit" onClick={(event) => { if (!window.confirm(message)) event.preventDefault() }}>{children}</button>
}
