import Link from 'next/link'
import { PageHeader } from '@/components/page-header'

export const settingsSections = [
  { label: 'Organização', href: '/settings/organization' },
  { label: 'Unidade', href: '/settings/units' },
  { label: 'Modalidades', href: '/settings/modalities' },
  { label: 'Meu perfil', href: '/settings/profile' },
  { label: 'Segurança', href: '/settings/security' },
  { label: 'Plano', href: '/settings/plan' },
]

export default function SettingsPage() {
  return <><PageHeader title="Configurações" description="Gerencie o ambiente da organização." /><section className="settings">{settingsSections.map((section) => <article className="panel" key={section.label}><Link href={section.href}><h2>{section.label}</h2></Link></article>)}</section></>
}
