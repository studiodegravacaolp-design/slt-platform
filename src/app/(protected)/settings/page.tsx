import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import styles from './settings.module.css'

export const settingsSections = [
  { label: 'Organização', href: '/settings/organization', description: 'Dados institucionais, contato e endereço.', icon: '▣' },
  { label: 'Unidades', href: '/settings/units', description: 'Gerencie as unidades da organização.', icon: '▦' },
  { label: 'Modalidades', href: '/settings/modalities', description: 'Modalidades vinculadas às unidades.', icon: '◈' },
  { label: 'Meu perfil', href: '/settings/profile', description: 'Nome, telefone e informações da conta.', icon: '♙' },
  { label: 'Segurança', href: '/settings/security', description: 'Altere a senha da conta autenticada.', icon: '⚿' },
  { label: 'Plano', href: '/settings/plan', description: 'Consulte o plano comercial SLT.', icon: '▤' },
] as const

export default function SettingsPage() {
  return <div className={styles.page}>
    <PageHeader title="Configurações" description="Gerencie o ambiente da organização." eyebrow="SLT Free · Organização" badge="SLT Free" />
    <section className={styles.hubIntro}><h2>Gerenciar configurações</h2><p>Dados da organização, conta e estrutura organizacional.</p></section>
    <section className={styles.hubGrid} aria-label="Áreas de configurações">{settingsSections.map((section) => <Link className={styles.hubCard} href={section.href} key={section.href}><span className={styles.hubIcon} aria-hidden="true">{section.icon}</span><h2>{section.label}</h2><p>{section.description}</p><span className={styles.hubArrow}>Abrir →</span></Link>)}</section>
  </div>
}
