import Link from 'next/link'
import { getCurrentOrganization } from '@/services/organizations'
import { getCurrentUserContext } from '@/services/users'
import { saveProfile } from './actions'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const [profile, organization, params] = await Promise.all([getCurrentUserContext(), getCurrentOrganization(), searchParams])
  return <><Link href="/settings">← Configurações</Link><h1>Meu perfil</h1><form action={saveProfile} className="student-form"><section className="form-section"><h2>Dados pessoais</h2><div className="form-grid"><label>Nome *<input name="name" required defaultValue={profile.name}/></label><label>Telefone<input name="phone" type="tel" defaultValue={profile.phone ?? ''}/></label></div>{profile.avatar && <p className="muted-note">Avatar cadastrado. A alteração de avatar não está disponível nesta versão.</p>}</section><section className="form-section"><h2>Conta</h2><dl><div><dt>E-mail</dt><dd>{profile.email}</dd></div><div><dt>Organização</dt><dd>{organization.name}</dd></div><div><dt>Status</dt><dd>{profile.status}</dd></div></dl></section>{params.updated && <p className="form-success" role="status">Perfil atualizado com sucesso.</p>}{params.error && <p className="form-error" role="alert">Não foi possível salvar o perfil. Revise os dados e tente novamente.</p>}<div className="form-actions"><button>Salvar alterações</button></div></form></>
}
