'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createModality, getModality, updateModality } from '@/services/modalities'
import { updateCurrentOrganization } from '@/services/organizations'
import { createUnit, getUnit, setUnitAsMain, updateUnit } from '@/services/units'
import { modalitySchema, organizationUpdateSchema, type ModalityInput, type OrganizationUpdateInput, type UnitInput, unitSchema } from '@/validations/settings'

const organizationValues = (formData: FormData) => Object.fromEntries([...formData].map(([key, value]) => [key, value === '' ? null : value]))
const unitValues = (formData: FormData) => Object.fromEntries(['name', 'code', 'email', 'phone', 'cep', 'state', 'city', 'neighborhood', 'street', 'number', 'complement'].map((key) => [key, formData.get(key) === '' ? null : formData.get(key)]))
const modalityValues = (formData: FormData) => Object.fromEntries(['name', 'description', 'unit_id'].map((key) => [key, formData.get(key) === '' ? null : formData.get(key)]))

export async function saveOrganization(formData: FormData) {
  let input: OrganizationUpdateInput
  try { input = organizationUpdateSchema.parse(organizationValues(formData)) } catch { redirect('/settings/organization?error=validation') }
  try { await updateCurrentOrganization(input) } catch { redirect('/settings/organization?error=update') }
  revalidatePath('/settings/organization')
  redirect('/settings/organization?updated=1')
}

export async function saveUnit(id: number | undefined, formData: FormData) {
  let input: UnitInput
  try { input = unitSchema.parse(unitValues(formData)) } catch { redirect(id ? `/settings/units/${id}?error=validation` : '/settings/units?error=validation') }
  try { if (id) await updateUnit(id, input); else await createUnit(input) } catch { redirect(id ? `/settings/units/${id}?error=update` : '/settings/units?error=update') }
  revalidatePath('/settings/units')
  if (id) { revalidatePath(`/settings/units/${id}`); redirect(`/settings/units/${id}?updated=1`) }
  redirect('/settings/units?created=1')
}

export async function makeUnitMain(id: number) {
  try { await setUnitAsMain(id) } catch { redirect(`/settings/units/${id}?error=main`) }
  revalidatePath('/settings/units')
  revalidatePath(`/settings/units/${id}`)
  redirect(`/settings/units/${id}?main=1`)
}

export async function saveModality(id: number | undefined, formData: FormData) {
  const destination = id ? `/settings/modalities/${id}` : '/settings/modalities'
  let input: ModalityInput
  try { input = modalitySchema.parse(modalityValues(formData)) } catch { redirect(`${destination}?error=validation`) }
  try {
    if (id) {
      const current = await getModality(id)
      await updateModality(id, { name: input.name, description: input.description, status: current.status })
    } else {
      await getUnit(input.unit_id)
      await createModality(input)
    }
  } catch (error) {
    if (!id && error instanceof Error && error.message === 'Unidade não encontrada.') redirect(`${destination}?error=unit`)
    redirect(`${destination}?error=update`)
  }
  revalidatePath('/settings/modalities')
  if (id) { revalidatePath(`/settings/modalities/${id}`); redirect(`/settings/modalities/${id}?updated=1`) }
  redirect('/settings/modalities?created=1')
}
