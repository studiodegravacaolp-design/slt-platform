'use server'
import { revalidatePath } from 'next/cache'; import { updateCurrentOrganization } from '@/services/organizations'; import { createUnit, updateUnit } from '@/services/units'; import { createModality, updateModality } from '@/services/modalities'; import { organizationUpdateSchema, unitSchema, modalitySchema } from '@/validations/settings'
const values = (f: FormData) => Object.fromEntries([...f].map(([k,v]) => [k, v === '' ? undefined : v]))
export async function saveOrganization(f: FormData) { await updateCurrentOrganization(organizationUpdateSchema.parse(values(f))); revalidatePath('/settings/organization') }
export async function saveUnit(f: FormData) { const input = unitSchema.parse({ ...values(f), is_main: f.get('is_main') === 'on' }); const id = Number(f.get('id')); if (id) await updateUnit(id, input); else await createUnit(input); revalidatePath('/settings/units') }
export async function saveModality(f: FormData) { const input = modalitySchema.parse(values(f)); const id = Number(f.get('id')); if (id) await updateModality(id, input); else await createModality(input); revalidatePath('/settings/modalities') }
