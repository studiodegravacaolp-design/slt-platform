import { PageHeader } from '@/components/page-header'
import { getOrganizationOverview } from '@/services/dashboard'
export default async function HomePage() {
  const overview = await getOrganizationOverview()
  return <><PageHeader title="Home" description="Visão geral da sua organização." /><div className="metrics"><article><span>Unidades</span><strong>{overview.units}</strong></article><article><span>Pessoas</span><strong>{overview.people}</strong></article><article><span>Modalidades</span><strong>{overview.modalities}</strong></article></div><section className="panel"><h2>Últimos acessos</h2><p>O histórico de acessos será habilitado quando o campo canônico correspondente for documentado.</p></section></>
}
