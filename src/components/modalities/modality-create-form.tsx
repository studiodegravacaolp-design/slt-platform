'use client'

import { useRef, type ReactNode } from 'react'

// The synchronous guard also covers Enter/programmatic submits before React
// has rendered the pending button. The database remains the final authority.
export function ModalityCreateForm({ action, children }: Readonly<{ action: (formData: FormData) => Promise<void>; children: ReactNode }>) {
  const submitting = useRef(false)
  async function submit(formData: FormData) {
    try { await action(formData) } finally { submitting.current = false }
  }
  return <form action={submit} className="student-form" onSubmitCapture={(event) => {
    if (submitting.current) { event.preventDefault(); return }
    submitting.current = true
  }}>{children}</form>
}
