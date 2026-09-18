import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { auth } = await createClient()
  const { data, error } = await auth.getClaims()
  if (error || !data?.claims) redirect('/login')
  return <AppShell>{children}</AppShell>
}
