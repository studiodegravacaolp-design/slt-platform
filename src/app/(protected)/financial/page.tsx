import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
export default function FinancialPage() { return <><PageHeader title="Financeiro" description="Planos, cobranças e pagamentos." /><section className="settings"><Link className="panel" href="/financial/plans"><h2>Planos</h2><p>Cadastre e gerencie planos oferecidos aos alunos.</p></Link><Link className="panel" href="/financial/charges"><h2>Cobranças</h2><p>Consulte cobranças e registre pagamentos.</p></Link></section></> }
