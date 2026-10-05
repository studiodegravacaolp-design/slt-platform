export type OnboardingFormState = {
  status: 'idle' | 'error'
  message?: string
  fieldErrors?: Record<string, string[]>
}

export const initialOnboardingFormState: OnboardingFormState = { status: 'idle' }
