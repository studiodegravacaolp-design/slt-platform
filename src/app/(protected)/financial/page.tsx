import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
export default function FinancialPage() { return <><PageHeader title="Financeiro" description="Planos, cobranças e pagamentos." /><section className="settings"><Link className="panel" href="/financial/plans"><h2>Planos</h2><p>Cadastre e gerencie planos da organização.</p></Link><section className="panel"><h2>Cobranças</h2><p>A interface de cobranças e pagamentos será disponibilizada na próxima parte.</p></section></section></> }
