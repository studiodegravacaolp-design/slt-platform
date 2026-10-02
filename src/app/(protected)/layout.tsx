import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { getAuthenticatedAccessState } from '@/services/users'
export const dynamic = 'force-dynamic'
export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const state = await getAuthenticatedAccessState()
  if (state.kind === 'unauthenticated') redirect('/login')
  if (state.kind === 'onboarding-required') redirect('/onboarding')
  return <AppShell>{children}</AppShell>
}
