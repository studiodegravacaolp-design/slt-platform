import Link from 'next/link'
import { signOut } from '@/app/(protected)/actions'
import { SidebarNavigation } from '@/components/sidebar-navigation'

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="app-shell"><aside><Link className="brand" href="/home">SLT <small>System Level Tech</small></Link><SidebarNavigation /><div className="sidebar-footer"><span>SLT Free</span><form action={signOut}><button type="submit">Sair</button></form></div></aside><main>{children}</main></div>
}
