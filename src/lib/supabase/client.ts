'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/supabase'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  if (!client) {
    const env = getSupabaseEnv()
    client = createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  }
  return client
}
