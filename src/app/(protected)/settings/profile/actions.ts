'use server'

import { redirect } from 'next/navigation'
import { updateCurrentUserProfile } from '@/services/users'
import { userProfileUpdateSchema } from '@/validations/user-profile'

export async function saveProfile(formData: FormData) {
  const phone = String(formData.get('phone') ?? '').trim()
  try {
    await updateCurrentUserProfile(userProfileUpdateSchema.parse({ name: formData.get('name'), phone: phone || null }))
  } catch {
    redirect('/settings/profile?error=1')
  }
  redirect('/settings/profile?updated=1')
}
