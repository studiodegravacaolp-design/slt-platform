# Contrato do banco canônico

O projeto Supabase **SLT Enterprise Clean** (`klsyqysdkwsuwmmglmfa`) é a única fonte do domínio. Não há migrations neste repositório.

Tabelas confirmadas: `organizations`, `units`, `modalities`, `students`, `student_modality_units`, `trainings`, `training_exercises`, `attendance`, `evaluations`, `evaluation_results`, `users`, `plans`, `student_plans`, `charges`, `payments`.

## Pendência antes de CRUD

Gerar tipos do schema conectado e substituir `src/types/supabase.ts`. Não foram confirmados nomes de colunas, restrições, enums ou campo de histórico de acesso; o código não os infere. IDs bigint são strings na borda TypeScript/PostgREST; `users` usa UUID.
