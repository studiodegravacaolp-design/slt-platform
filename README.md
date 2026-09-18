# SLT Platform

Plataforma de gestão esportiva multiempresa. Hierarquia canônica: **Organização → Unidade → Modalidade**.

## Requisitos

- Node.js 24.x
- Variáveis de `.env.example` preenchidas com a chave publicável do Supabase

## Desenvolvimento

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Verificação

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Somente a chave publicável é usada. Sessões SSR usam cookies, `proxy.ts` renova tokens e as páginas privadas validam com `getClaims()`. Consulte `docs/` para a arquitetura e o contrato do banco.
