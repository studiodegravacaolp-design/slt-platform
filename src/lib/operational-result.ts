export type OperationalActionResult = { status: 'success' | 'error'; message: string }

export const operationSuccess = (message: string): OperationalActionResult => ({ status: 'success', message })
export const operationFailure = (message: string): OperationalActionResult => ({ status: 'error', message })
