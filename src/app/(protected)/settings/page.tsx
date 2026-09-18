import { PageHeader } from '@/components/page-header'
const sections = ['Organização', 'Unidade', 'Modalidades', 'Meu perfil', 'Segurança', 'Plano']
export default function SettingsPage() { return <><PageHeader title="Configurações" description="Gerencie o ambiente da organização." /><section className="settings">{sections.map((section) => <article className="panel" key={section}><h2>{section}</h2></article>)}</section></> }
