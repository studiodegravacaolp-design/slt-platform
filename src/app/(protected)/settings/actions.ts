'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createModality, updateModality, updateModalityStatus } from '@/services/modalities'
import { updateCurrentOrganization } from '@/services/organizations'
import { createUnit, getUnit, setUnitAsMain, updateUnit, updateUnitStatus } from '@/services/units'
import { modalitySchema, operationalStatusSchema, organizationUpdateSchema, type ModalityInput, type OrganizationUpdateInput, type UnitInput, unitSchema } from '@/validations/settings'

const organizationValues = (formData: FormData) => Object.fromEntries([...formData].map(([key, value]) => [key, value === '' ? null : value]))
const unitValues = (formData: FormData) => Object.fromEntries(['name', 'code', 'email', 'phone', 'cep', 'state', 'city', 'neighborhood', 'street', 'number', 'complement'].map((key) => [key, formData.get(key) === '' ? null : formData.get(key)]))
const modalityValues = (formData: FormData) => Object.fromEntries(['name', 'description', 'unit_id'].map((key) => [key, formData.get(key) === '' ? null : formData.get(key)]))
const modalityUpdateSchema = modalitySchema.pick({ name: true, description: true })

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

export async function changeUnitStatus(id: number, formData: FormData) {
  let status: 'active' | 'inactive'
  try { status = operationalStatusSchema.parse(formData.get('status')) } catch { redirect(`/settings/units/${id}?error=status`) }
  try { await updateUnitStatus(id, status) } catch (error) {
    if (error instanceof Error && error.message === 'A unidade principal não pode ser inativada.') redirect(`/settings/units/${id}?error=main-status`)
    redirect(`/settings/units/${id}?error=status`)
  }
  revalidatePath('/settings/units')
  revalidatePath(`/settings/units/${id}`)
  redirect(`/settings/units/${id}?status=updated`)
}

export async function saveModality(id: number | undefined, formData: FormData) {
  const destination = id ? `/settings/modalities/${id}` : '/settings/modalities'
  if (id) {
    let input: Pick<ModalityInput, 'name' | 'description'>
    try { input = modalityUpdateSchema.parse(modalityValues(formData)) } catch { redirect(`${destination}?error=validation`) }
    try { await updateModality(id, input) } catch { redirect(`${destination}?error=update`) }
    revalidatePath('/settings/modalities')
    revalidatePath(`/settings/modalities/${id}`)
    redirect(`/settings/modalities/${id}?updated=1`)
  }

  let input: ModalityInput
  try { input = modalitySchema.parse(modalityValues(formData)) } catch { redirect(`${destination}?error=validation`) }
  try { await getUnit(input.unit_id); await createModality(input) } catch (error) {
    if (error instanceof Error && error.message === 'Unidade não encontrada.') redirect(`${destination}?error=unit`)
    redirect(`${destination}?error=update`)
  }
  revalidatePath('/settings/modalities')
  redirect('/settings/modalities?created=1')
}

export async function changeModalityStatus(id: number, formData: FormData) {
  let status: 'active' | 'inactive'
  try { status = operationalStatusSchema.parse(formData.get('status')) } catch { redirect(`/settings/modalities/${id}?error=status`) }
  try { await updateModalityStatus(id, status) } catch { redirect(`/settings/modalities/${id}?error=status`) }
  revalidatePath('/settings/modalities')
  revalidatePath(`/settings/modalities/${id}`)
  redirect(`/settings/modalities/${id}?status=updated`)
}
