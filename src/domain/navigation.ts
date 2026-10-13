export const navigationGroups = [
  { label: 'Organização', items: [{ label: 'Home', href: '/home', icon: '⌂' }, { label: 'Unidades', href: '/settings/units', icon: '▦' }] },
  { label: 'Esporte', items: [
    { label: 'Alunos', href: '/students', icon: '♙' }, { label: 'Treinamentos', href: '/trainings', icon: '▣' },
    { label: 'Presença', href: '/attendance', icon: '✓' }, { label: 'Evolução', href: '/evolution', icon: '↗' },
  ] },
  { label: 'Gestão', items: [{ label: 'Financeiro', href: '/financial', icon: '▤' }] },
  { label: 'Sistema', items: [{ label: 'Configurações', href: '/settings', icon: '⚙' }] },
] as const

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === '/settings') {
    const isUnitsRoute = pathname === '/settings/units' || pathname.startsWith('/settings/units/')
    return !isUnitsRoute && (pathname === href || pathname.startsWith(`${href}/`))
  }

  return pathname === href || (href !== '/home' && pathname.startsWith(`${href}/`))
}
