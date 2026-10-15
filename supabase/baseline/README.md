# Baseline estrutural canônico — SLT Free V1.8.1

Fonte: projeto Supabase `SLT Enterprise Clean` (`klsyqysdkwsuwmmglmfa`),
consultado em modo somente leitura em 15 de outubro de 2026.

Este diretório não contém linhas de tabelas, credenciais, chaves, sessões ou
objetos internos do schema `auth`. Ele documenta a estrutura de aplicação que
deve ser reconstruída em um novo projeto Supabase e preserva a referência a
`auth.users` provida pela plataforma.

## Corte do baseline

O catálogo canônico confirmou as migrations abaixo. O baseline local foi
normalizado para o ponto imediatamente anterior às três últimas migrations de
bootstrap/Modalidades, para que seus scripts versionados possam ser aplicados
uma única vez e sem duplicar `name_key` ou triggers.

- `20260917170059_create_slt_free_v1_schema`
- `20260917170257_add_slt_rls_and_integrity`
- `20260917170323_harden_slt_rls_helper`
- `20260917200631_optimize_rls_and_indexes_v1`
- `20260917200646_cleanup_duplicate_training_index`
- `20260917213511_add_bootstrap_organization_owner`
- `20260917213526_harden_bootstrap_owner_function`
- `20260917213538_move_bootstrap_owner_function_private`
- `20260917221227_harden_data_api_grants_v1`
- `20261002164707_add_public_organization_bootstrap_rpc`
- `20261002173949_fix_authenticated_rls_organization_context`
- `20261002175334_grant_authenticated_public_organization_context_rpc`
- `20261002220012_harden_authenticated_table_grants`

As seguintes migrations são posteriores ao baseline local e obrigatórias para
reconstituir o corte canônico atual:

- `20261003194135_bootstrap_owner_profile_name.sql`
- `20261005224442_modalities_name_key_uniqueness.sql`
- `20261006122715_modality_visual_name_presentation.sql`

As migrations locais abaixo **não** estavam presentes no catálogo no momento
da auditoria e devem continuar posteriores ao baseline:

- `20261007140000_financial_integrity_expand.sql`
- `20261007140001_financial_integrity_harden.sql`

## Inventário confirmado

| Objeto | Quantidade |
| --- | ---: |
| Tabelas `public` / `private` | 15 / 0 |
| Funções | 14 |
| Triggers não internos | 21 |
| Policies RLS | 56 |
| Índices | 54 |
| Views materializadas | 0 |
| Views | 0 |
| Sequences | 14 |

As 15 tabelas são: `organizations`, `units`, `modalities`, `students`,
`student_modality_units`, `users`, `trainings`, `training_exercises`,
`attendance`, `evaluations`, `evaluation_results`, `plans`, `student_plans`,
`charges` e `payments`.

Todas têm RLS habilitada. O owner observado para elas foi `postgres`.
`public.users.id` referencia `auth.users(id)`; nenhum objeto interno de Auth
deve ser incluído em um dump de aplicação.

## Dependências de plataforma

- PostgreSQL 17 (`17.6.1.166` no projeto de origem);
- schemas gerenciados `auth`, `extensions` e seus papéis Supabase;
- extensões instaladas necessárias ao contrato: `pgcrypto`, `uuid-ossp` e
  `pg_stat_statements`; as funções de modalidade também dependem de
  `normalize`, disponível no PostgreSQL do Supabase de origem;
- configuração externa de Auth, URLs de redirecionamento e chaves públicas,
  que não pertencem ao SQL do baseline.

## Reconstituição segura

1. Provisionar um projeto Supabase novo, sem importar dados de produção.
2. Aplicar a estrutura base extraída do catálogo em ambiente descartável.
3. Aplicar, uma única vez e nesta ordem, a migration de bootstrap,
   `003_public_bootstrap_rpc.sql` e então as migrations de Modalidades listadas
   acima. O suplemento representa a migration histórica
   `20261002164707_add_public_organization_bootstrap_rpc`, confirmada no
   catálogo canônico mas ausente deste repositório. Não alterar o baseline para
   incluir parcialmente objetos dessas migrations.
4. Validar RLS, grants e funções usando usuários sintéticos.
5. Somente depois aplicar `financial_integrity_expand`; publicar uma aplicação
   compatível; validar; e então considerar `financial_integrity_harden`.

## Limitação de reprodução local

Este repositório não possui Supabase CLI, Docker, `psql` ou uma pilha local
Supabase configurada. Portanto, esta auditoria valida metadados do catálogo,
mas não declara equivalência integral de Auth/PostgREST em PostgreSQL isolado.
