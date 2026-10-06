# Contrato do banco canônico

O projeto Supabase **SLT Enterprise Clean** (`klsyqysdkwsuwmmglmfa`) é a fonte canônica do domínio. O histórico inicial está no projeto Supabase; migrations de correções posteriores são versionadas em `supabase/migrations`. A presença de um arquivo local não significa que ele foi aplicado no banco.

Tabelas confirmadas: `organizations`, `units`, `modalities`, `students`, `student_modality_units`, `trainings`, `training_exercises`, `attendance`, `evaluations`, `evaluation_results`, `users`, `plans`, `student_plans`, `charges`, `payments`.

## Tipos gerados

`src/types/supabase.ts` foi gerado do schema `public` pela Supabase CLI em 18/09/2026. A Correção 02 acrescenta manualmente o contrato planejado de `modalities.name_key`: obrigatório na leitura, opcional em Insert/Update porque o banco sempre o recalcula. A migration correspondente ainda depende de revisão e aplicação; depois disso os tipos devem ser regenerados e comparados.

Para atualizar o contrato após uma mudança de schema autorizada, execute localmente:

```powershell
npx supabase@latest gen types typescript --project-id klsyqysdkwsuwmmglmfa --schema public
```

IDs `bigint` são representados pela geração oficial como `number`; o ID de `users` é UUID.

## Modalidades — Correção 02

A chave proposta é única por `(unit_id, name_key)` para todos os status. A organização permanece derivada da unidade, com RLS e grants existentes preservados. Aplicar a migration antes de disponibilizar o código que consulta `name_key`.

As regras v1 usam NFC para apresentação; colapsam uma lista explícita de espaços; usam NFD, removem somente os diacríticos U+0300/0301/0302/0303/0304/0306/0307/0308/030A/030B/030C/0327/0328, aplicam uma tabela congelada de lowercase simples Unicode 17.0 (incluindo equivalência de sigma final) e recompõem NFC para comparação. A tabela explícita está em `src/domain/modality-case-map.json` e na migration; não depende do locale do banco nem da versão futura de casing do runtime. Não há transliteração ou expansão de ligaturas. Pontuação, outros sinais e caracteres de compatibilidade são preservados. A lista exata de espaços está em `src/domain/modality-name.ts` e na migration; manter ambas sincronizadas.

O único mapeamento de apresentação é `natacao → Natação`. Nomes desconhecidos preservam a grafia após NFC e limpeza de espaços.

## Modalidades — Correção 03

Além da chave técnica v1, a apresentação é determinística e independente de locale: NFC, limpeza dos espaços v1, lowercase pela mesma tabela Unicode congelada e maiúscula apenas no primeiro caractere quando o mapeamento for seguro, de um caractere para um caractere, e mantiver a mesma `name_key`. Assim, `FUTEBOL DE CAMPO` é apresentado como `Futebol de campo`, sem Title Case. O mapeamento explícito `natacao → Natação` tem precedência.

Caracteres cuja capitalização pode expandir não são expandidos. Por exemplo, `ﬀitness` é preservado; `ßport` usa o mapeamento simples e seguro `ẞport`, pois sua `name_key` continua `ßport`. A trigger de modalidades recalcula tanto `name` quanto `name_key` em INSERT e UPDATE diretos. A migration 03 exige que a infraestrutura da Correção 02 esteja instalada, revalida os IDs auditados 12 e 13, mantém a UNIQUE `(unit_id, name_key)`, e aborta se RLS, policies, grants ou a invariância da chave não puderem ser preservados.

A migration é transacional, bloqueia gravações durante a verificação/consolidação e aborta se os IDs 11/12, organização 15/unidade 13, nomes, descrições, status, timestamps ou referências tiverem mudado. Somente o ID 11 pode ser removido; o ID 12 é preservado. Os snapshots são emitidos via NOTICE: preservar o log da execução aprovada. O backfill aciona o trigger existente de `updated_at`, registrando o momento da normalização. Qualquer outra duplicidade exige revisão, sem deduplicação automática.

Os testes nativos usam um cluster PostgreSQL 17 exclusivamente local e a fixture `supabase/tests/modalities-fixture.sql`, que nunca deve ser aplicada no Supabase. O runtime de teste não integra as dependências do app. `embedded-postgres` requer um ambiente Unix compatível, portanto a suíte nativa é marcada como skipped no Windows e deve ser executada em CI/Linux. Para preparar esse ambiente, instalar somente no diretório ignorado e executar a suíte:

```powershell
npm.cmd install --prefix node_modules/.modality-verification --no-save --package-lock=false embedded-postgres@17.10.0-beta.17
npm.cmd test
```

Sem esse runtime, a suíte de PostgreSQL é explicitamente marcada como skipped; os testes de domínio, serviço, Action e submissão continuam executando. O cluster é encerrado ao terminar os testes e os dados descartáveis permanecem em `node_modules/.modality-verification/data`.
