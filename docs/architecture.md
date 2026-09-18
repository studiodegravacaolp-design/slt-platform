# Arquitetura

- `src/app`: rotas App Router e autenticação.
- `src/components`: interface reutilizável.
- `src/domain`: conceitos de negócio e navegação.
- `src/services`: acesso a dados por módulo.
- `src/lib/supabase`: clientes SSR/browser e renovação de sessão.
- `src/validations`: schemas Zod.
- `src/types`: contrato Supabase e domínio.

O servidor autoriza com `getClaims()`. O RLS existente determina o escopo de organização; nenhuma organização vem do cliente.
