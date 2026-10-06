import { beforeEach, describe, expect, it, vi } from 'vitest'

const { status, guard } = vi.hoisted(() => ({ status: { pending: false }, guard: { current: false } }))
vi.mock('react-dom', () => ({ useFormStatus: () => status }))
vi.mock('react', async (importOriginal) => ({ ...await importOriginal<typeof import('react')>(), useRef: () => guard }))

import { ModalityCreateSubmitButton } from './modality-create-submit-button'
import { ModalityCreateForm } from './modality-create-form'

describe('modality submission', () => {
  beforeEach(() => { status.pending = false; guard.current = false })
  it('disables the submit button while pending and restores it afterwards', () => {
    expect(ModalityCreateSubmitButton().props).toMatchObject({ disabled: false, children: 'Criar modalidade', type: 'submit' })
    status.pending = true
    expect(ModalityCreateSubmitButton().props).toMatchObject({ disabled: true, children: 'Criando...', 'aria-busy': true })
    status.pending = false
    expect(ModalityCreateSubmitButton().props.disabled).toBe(false)
  })
  it.each([false, true])('blocks repeated submissions and releases the guard after completion (error=%s)', async (fail) => {
    let finish!: () => void
    const action = vi.fn(async () => { await new Promise<void>((resolve) => { finish = resolve }); if (fail) throw new Error('failure') })
    const form = ModalityCreateForm({ action, children: null })
    const first = { preventDefault: vi.fn() }
    const second = { preventDefault: vi.fn() }
    form.props.onSubmitCapture(first)
    const result = form.props.action(new FormData())
    // Simulate another submit event in the same tick, before a pending render.
    form.props.onSubmitCapture(second)
    expect(first.preventDefault).not.toHaveBeenCalled()
    expect(second.preventDefault).toHaveBeenCalledOnce()
    expect(action).toHaveBeenCalledOnce()
    expect(guard.current).toBe(true)
    finish()
    if (fail) await expect(result).rejects.toThrow('failure'); else await result
    const retry = { preventDefault: vi.fn() }
    form.props.onSubmitCapture(retry)
    expect(retry.preventDefault).not.toHaveBeenCalled()
  })
})
