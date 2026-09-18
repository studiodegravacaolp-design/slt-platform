import { createClient } from '@/lib/supabase/server'

export type OrganizationOverview = { units: number; people: number; modalities: number; latestAccesses: [] }

/** Counts are protected by existing RLS policies; no organization id is trusted from the client. */
export async function getOrganizationOverview(): Promise<OrganizationOverview> {
  const supabase = await createClient()
  const [units, people, modalities] = await Promise.all([
    supabase.from('units').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('modalities').select('*', { count: 'exact', head: true }),
  ])
  if (units.error || people.error || modalities.error) throw new Error('Não foi possível carregar o resumo da organização.')
  return { units: units.count ?? 0, people: people.count ?? 0, modalities: modalities.count ?? 0, latestAccesses: [] }
}
