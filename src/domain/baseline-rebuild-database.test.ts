import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:net'

// This test intentionally uses a disposable PostgreSQL 17 cluster. The auth
// schema below is a structural mock, not a substitute for Supabase Auth.
const runtimeEntry = resolve('node_modules/.modality-verification/node_modules/embedded-postgres/dist/index.js')
const supportsEmbeddedPostgres = existsSync(runtimeEntry)
const baselineSchema = readFileSync(resolve('supabase/baseline/001_public_schema.sql'), 'utf8')
const baselineSecurity = readFileSync(resolve('supabase/baseline/002_security_and_integrity.sql'), 'utf8')
const bootstrap = readFileSync(resolve('supabase/migrations/20261003194135_bootstrap_owner_profile_name.sql'), 'utf8')
const publicBootstrap = readFileSync(resolve('supabase/baseline/003_public_bootstrap_rpc.sql'), 'utf8')
const modalityKey = readFileSync(resolve('supabase/migrations/20261005224442_modalities_name_key_uniqueness.sql'), 'utf8')
const modalityPresentation = readFileSync(resolve('supabase/migrations/20261006122715_modality_visual_name_presentation.sql'), 'utf8')
const financialExpand = readFileSync(resolve('supabase/migrations/20261007140000_financial_integrity_expand.sql'), 'utf8')
const financialHarden = readFileSync(resolve('supabase/migrations/20261007140001_financial_integrity_harden.sql'), 'utf8')

type Client = { connect(): Promise<void>; end(): Promise<void>; query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }> }
type Cluster = { initialise(): Promise<void>; start(): Promise<void>; stop(): Promise<void>; createDatabase(name: string): Promise<void>; getPgClient(database: string, host: string): Client }

async function availablePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing local test port')
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return address.port
}

const platformMock = `
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
  end $$;
  create schema extensions;
  create extension if not exists pgcrypto with schema extensions;
`

const migrationPrerequisites = `
  insert into public.organizations (id, name) values (15, 'Synthetic Org A'), (16, 'Synthetic Org B');
  insert into auth.users (id, email, raw_user_meta_data) values
    ('00000000-0000-0000-0000-000000000015', 'a@example.test', '{"name":"A"}'),
    ('00000000-0000-0000-0000-000000000016', 'b@example.test', '{"name":"B"}');
  insert into public.users (id, organization_id, name, email) values
    ('00000000-0000-0000-0000-000000000015', 15, 'A', 'a@example.test'),
    ('00000000-0000-0000-0000-000000000016', 16, 'B', 'b@example.test');
  insert into public.units (id, organization_id, name, status) values
    (13, 15, 'Synthetic Unit A', 'active'), (14, 15, 'Synthetic Unit B', 'active'), (16, 16, 'Synthetic Unit C', 'active');
  -- Synthetic values reproduce only the audited precondition embedded in the
  -- modality migration; no production row is exported or used.
  insert into public.modalities (id, unit_id, name, description, status, created_at, updated_at) values
    (11, 13, 'Natação', 'Natação', 'inactive', '2026-10-05 18:34:03.343181+00', '2026-10-05 18:34:31.010877+00'),
    (12, 13, 'Natação', 'Natação', 'active', '2026-10-05 18:34:07.695546+00', '2026-10-05 18:34:07.695546+00'),
    (13, 13, 'futebol', 'Futebol', 'active', now(), now());
  insert into public.students (id, organization_id, full_name, birth_date) values
    (15, 15, 'Synthetic Student A', '2000-01-01'), (16, 16, 'Synthetic Student B', '2000-01-01');
  insert into public.plans (id, organization_id, name, value, periodicity) values
    (10, 15, 'Synthetic Plan A', 100, 'monthly'), (16, 16, 'Synthetic Plan B', 100, 'monthly');
  insert into public.student_plans (id, student_id, plan_id, unit_id, start_date) values
    (12, 15, 10, 13, '2026-01-01'), (16, 16, 16, 16, '2026-01-01');
  insert into public.charges (id, organization_id, student_id, unit_id, student_plan_id, description, value, issue_date, due_date, status) values
    (9, 15, 15, 13, 12, 'Synthetic historical charge', 100, '2026-10-01', '2026-10-10', 'pending');
  insert into public.payments (id, charge_id, amount_paid, payment_date, payment_method, observation) values
    (11, 9, 100, '2026-10-07', 'pix', 'Synthetic validation payment');
`

describe.runIf(supportsEmbeddedPostgres)('sanitized canonical baseline — disposable PostgreSQL 17', () => {
  let cluster: Cluster
  let client: Client
  let database: string
  let sequence = 0
  const clients: Client[] = []

  beforeAll(async () => {
    const { default: EmbeddedPostgres } = await import(/* @vite-ignore */ pathToFileURL(runtimeEntry).href)
    cluster = new EmbeddedPostgres({ databaseDir: resolve(`node_modules/.modality-verification/baseline-data/${Date.now()}`), user: 'postgres', password: 'local-baseline-test', port: await availablePort(), persistent: true, initdbFlags: ['--encoding=UTF8'], postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} }) as Cluster
    await cluster.initialise(); await cluster.start()
  }, 60000)

  beforeEach(async () => {
    database = `baseline_test_${++sequence}`
    await cluster.createDatabase(database)
    client = cluster.getPgClient(database, '127.0.0.1')
    await client.connect(); clients.push(client)
    await client.query(platformMock)
    await client.query(baselineSchema)
    await client.query(baselineSecurity)
    await client.query(migrationPrerequisites)
    await client.query(bootstrap)
    await client.query(publicBootstrap)
    await client.query(modalityKey)
    await client.query(modalityPresentation)
  })

  afterEach(async () => { await Promise.all(clients.splice(0).map((connection) => connection.end())) })
  afterAll(async () => { if (cluster) await cluster.stop() }, 30000)

  it('rebuilds the canonical structural cut and applies the incremental bootstrap and modality migrations', async () => {
    expect((await client.query("select count(*)::int as total from pg_tables where schemaname = 'public'")).rows[0].total).toBe(15)
    expect((await client.query("select count(*)::int as total from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity")).rows[0].total).toBe(15)
    expect((await client.query("select count(*)::int as total from pg_policies where schemaname = 'public'")).rows[0].total).toBe(56)
    expect((await client.query("select count(*)::int as total from pg_indexes where schemaname = 'public'")).rows[0].total).toBe(54)
    expect((await client.query("select count(*)::int as total from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal")).rows[0].total).toBe(21)
    expect((await client.query("select count(*)::int as total from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private')")).rows[0].total).toBe(14)
    const bootstrapRpc = await client.query("select prosecdef, proconfig from pg_proc where oid = 'public.bootstrap_organization_owner(text,text,text,text)'::regprocedure")
    expect(bootstrapRpc.rows[0]).toEqual({ prosecdef: true, proconfig: ['search_path=""'] })
    expect((await client.query("select has_function_privilege('authenticated', 'public.bootstrap_organization_owner(text,text,text,text)', 'execute') as allowed")).rows[0].allowed).toBe(true)
  })

  it('preserves the expansion compatibility window, then hardens financial writes through the RPC boundary', async () => {
    await client.query(financialExpand)
    expect((await client.query("select count(*)::int as total from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('create_financial_charge','record_financial_payment','cancel_financial_charge')")).rows[0].total).toBe(3)
    expect((await client.query("select status, charge_type, competence_month from public.charges where id=9")).rows[0]).toEqual({ status: 'paid', charge_type: 'legacy', competence_month: null })
    expect((await client.query("select has_table_privilege('authenticated', 'public.charges', 'insert,update,delete') as allowed")).rows[0].allowed).toBe(true)
    await client.query(financialHarden)
    expect((await client.query("select has_table_privilege('authenticated', 'public.charges', 'insert,update,delete') as allowed")).rows[0].allowed).toBe(false)
    expect((await client.query("select has_function_privilege('anon', 'public.record_financial_payment(bigint,numeric,date,text,text,uuid)', 'execute') as allowed")).rows[0].allowed).toBe(false)
  })
})
