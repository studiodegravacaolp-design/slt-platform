import Link from 'next/link'
import { navigationGroups } from '@/domain/navigation'

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="app-shell"><aside><Link className="brand" href="/home">SLT <span>Platform</span></Link>{navigationGroups.map((group) => <section key={group.label}><h2>{group.label}</h2>{group.items.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</section>)}</aside><main>{children}</main></div>
}
