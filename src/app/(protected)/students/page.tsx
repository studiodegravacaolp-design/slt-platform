import { PageHeader } from '@/components/page-header'
export default function StudentsPage() { return <><PageHeader title="Alunos" description="Registros esportivos e vínculos com modalidades." action={<button>+ Novo aluno</button>} /><section className="panel"><p>O formulário será conectado à tabela canônica <code>students</code> após a geração dos tipos do banco.</p></section></> }
