import { createClient } from '@/lib/supabase/server'

export type OrganizationOverview = { units: number; people: number; modalities: number; latestAccesses: Array<{ id: string; name: string; lastAccessAt: string }> }

/** Counts are protected by existing RLS policies; no organization id is trusted from the client. */
export async function getOrganizationOverview(): Promise<OrganizationOverview> {
  const supabase = await createClient()
  const [units, people, modalities, accesses] = await Promise.all([
    supabase.from('units').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('modalities').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('id, name, last_access_at').not('last_access_at', 'is', null).order('last_access_at', { ascending: false }).limit(5),
  ])
  if (units.error || people.error || modalities.error || accesses.error) throw new Error('Não foi possível carregar o resumo da organização.')
  return {
    units: units.count ?? 0,
    people: people.count ?? 0,
    modalities: modalities.count ?? 0,
    latestAccesses: accesses.data.map((access) => ({ id: access.id, name: access.name, lastAccessAt: access.last_access_at! })),
  }
}
