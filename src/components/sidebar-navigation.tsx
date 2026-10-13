'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isNavigationItemActive, navigationGroups } from '@/domain/navigation'

export function SidebarNavigation() {
  const pathname = usePathname()

  return <nav className="sidebar-navigation" aria-label="Navegação principal">{navigationGroups.map((group) => <section key={group.label}><h2>{group.label}</h2>{group.items.map((item) => {
    const active = isNavigationItemActive(pathname, item.href)
    return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>
  })}</section>)}</nav>
}
