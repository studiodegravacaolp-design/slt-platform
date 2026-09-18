import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()
  const env = getSupabaseEnv()

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(items) {
        try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {
          // Server Components cannot write cookies; proxy.ts performs refreshes.
        }
      },
    },
  })
}
