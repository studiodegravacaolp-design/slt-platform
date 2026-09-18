# Contrato do banco canônico

O projeto Supabase **SLT Enterprise Clean** (`klsyqysdkwsuwmmglmfa`) é a única fonte do domínio. Não há migrations neste repositório.

Tabelas confirmadas: `organizations`, `units`, `modalities`, `students`, `student_modality_units`, `trainings`, `training_exercises`, `attendance`, `evaluations`, `evaluation_results`, `users`, `plans`, `student_plans`, `charges`, `payments`.

## Tipos gerados

`src/types/supabase.ts` foi gerado diretamente do schema `public` pela Supabase CLI em 18/09/2026. Ele contém colunas, nullability, relações e a função `current_user_organization_id()` exatamente como retornados pelo projeto.

Para atualizar o contrato após uma mudança de schema autorizada, execute localmente:

```powershell
npx supabase@latest gen types typescript --project-id klsyqysdkwsuwmmglmfa --schema public
```

IDs `bigint` são representados pela geração oficial como `number`; o ID de `users` é UUID.
