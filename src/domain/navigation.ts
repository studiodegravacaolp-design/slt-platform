export const navigationGroups = [
  { label: 'Organização', items: [{ label: 'Home', href: '/home' }] },
  { label: 'Esporte', items: [
    { label: 'Alunos', href: '/students' }, { label: 'Treinamentos', href: '/trainings' },
    { label: 'Presença', href: '/attendance' }, { label: 'Evolução', href: '/evolution' },
  ] },
  { label: 'Gestão', items: [{ label: 'Financeiro', href: '/financial' }] },
  { label: 'Sistema', items: [{ label: 'Configurações', href: '/settings' }] },
] as const
