import { PageHeader } from '@/components/page-header'
import { getOrganizationOverview } from '@/services/dashboard'
export default async function HomePage() {
  const overview = await getOrganizationOverview()
  return <><PageHeader title="Home" description="Visão geral da sua organização." /><div className="metrics"><article><span>Unidades</span><strong>{overview.totalUnits}</strong></article><article><span>Alunos</span><strong>{overview.totalStudents}</strong></article><article><span>Modalidades</span><strong>{overview.totalModalities}</strong></article></div></>
}
