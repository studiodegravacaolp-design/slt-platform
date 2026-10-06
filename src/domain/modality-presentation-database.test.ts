import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:net'
import { canonicalizeModalityName, normalizeModalityName } from './modality-name'

const runtimeEntry = resolve('node_modules/.modality-verification/node_modules/embedded-postgres/dist/index.js')
const supportsEmbeddedPostgres = process.platform !== 'win32' && existsSync(runtimeEntry)
const correction02 = readFileSync(resolve('supabase/migrations/20261005224442_modalities_name_key_uniqueness.sql'), 'utf8')
const correction03 = readFileSync(resolve('supabase/migrations/20261006122715_modality_visual_name_presentation.sql'), 'utf8')
const fixture = readFileSync(resolve('supabase/tests/modalities-fixture.sql'), 'utf8')
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

describe.runIf(supportsEmbeddedPostgres)('modality presentation migration — disposable PostgreSQL 17', () => {
  let cluster: Cluster
  let client: Client
  let database: string
  let sequence = 0
  const clients: Client[] = []

  beforeAll(async () => {
    const { default: EmbeddedPostgres } = await import(/* @vite-ignore */ pathToFileURL(runtimeEntry).href)
    cluster = new EmbeddedPostgres({
      databaseDir: resolve(`node_modules/.modality-verification/presentation-data/${Date.now()}`),
      user: 'postgres', password: 'local-modality-test', port: await availablePort(),
      persistent: true, initdbFlags: ['--encoding=UTF8'], postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {},
    }) as Cluster
    await cluster.initialise()
    await cluster.start()
  }, 60000)
  beforeEach(async () => {
    database = `modality_presentation_${++sequence}`
    await cluster.createDatabase(database)
    client = cluster.getPgClient(database, '127.0.0.1')
    await client.connect()
    clients.push(client)
    await client.query(fixture)
    await client.query(correction02)
  })
  afterEach(async () => { await Promise.all(clients.splice(0).map((connection) => connection.end())) })
  afterAll(async () => { if (cluster) await cluster.stop() }, 30000)

  async function authenticated(connection: Client, organization = 15) {
    await connection.query('set role authenticated')
    await connection.query(`select set_config('request.jwt.claim.sub', $1, false)`, [`00000000-0000-0000-0000-0000000000${organization}`])
  }

  it('canonicalizes audited ID 13 without changing its identity and preserves ID 12', async () => {
    const security = await client.query("select relrowsecurity,relforcerowsecurity,relacl::text from pg_class where oid='public.modalities'::regclass")
    const policies = await client.query("select jsonb_agg(to_jsonb(p) order by policyname) as policies from pg_policies p where schemaname='public' and tablename='modalities'")
    await client.query(correction03)
    expect((await client.query('select id,unit_id,name,name_key,status,description from public.modalities where id in (12,13) order by id')).rows).toEqual([
      { id: '12', unit_id: '13', name: 'Natação', name_key: 'natacao', status: 'active', description: 'Natação' },
      { id: '13', unit_id: '13', name: 'Futebol', name_key: 'futebol', status: 'active', description: 'Futebol' },
    ])
    expect((await client.query("select relrowsecurity,relforcerowsecurity,relacl::text from pg_class where oid='public.modalities'::regclass")).rows).toEqual(security.rows)
    expect((await client.query("select jsonb_agg(to_jsonb(p) order by policyname) as policies from pg_policies p where schemaname='public' and tablename='modalities'")).rows).toEqual(policies.rows)
  })

  it.each([
    ['futebol', 'Futebol', 'futebol'], ['FUTEBOL DE CAMPO', 'Futebol de campo', 'futebol de campo'],
    ['BASQUETE', 'Basquete', 'basquete'], ['VOLEIBOL', 'Voleibol', 'voleibol'],
    ['NATACAO', 'Natação', 'natacao'], ['NATAÇÃO', 'Natação', 'natacao'],
    ['A\u0301GUA', 'Água', 'agua'], ['ßport', 'ẞport', 'ßport'], ['ﬀitness', 'ﬀitness', 'ﬀitness'],
    ['123 esporte', '123 esporte', '123 esporte'], ['!futebol', '!futebol', '!futebol'], ['𐐀SPORT', '𐐀sport', '𐐨sport'],
  ])('matches the application for %s and keeps name_key invariant', async (value, name, key) => {
    await client.query(correction03)
    const result = await client.query('select private.modality_display_name_v2($1) as name, private.modality_name_key_v1($1) as key, private.modality_name_key_v1(private.modality_display_name_v2($1)) as canonical_key', [value])
    expect(result.rows[0]).toEqual({ name, key, canonical_key: key })
    expect(canonicalizeModalityName(value)).toBe(name)
    expect(normalizeModalityName(canonicalizeModalityName(value))).toBe(normalizeModalityName(value))
  })

  it('uses the updated trigger for direct INSERT and UPDATE and ignores forged keys', async () => {
    await client.query(correction03)
    await authenticated(client)
    const inserted = await client.query("insert into public.modalities(unit_id,name,name_key) values(14,'FUTEBOL DE CAMPO','forged') returning id,name,name_key")
    expect(inserted.rows[0]).toMatchObject({ name: 'Futebol de campo', name_key: 'futebol de campo' })
    const updated = await client.query("update public.modalities set name='NATACAO',name_key='forged' where id=$1 returning name,name_key", [inserted.rows[0].id])
    expect(updated.rows[0]).toEqual({ name: 'Natação', name_key: 'natacao' })
    await client.query("insert into public.modalities(unit_id,name) values(16,'FUTEBOL')")
    await expect(client.query("insert into public.modalities(unit_id,name) values(13,'futebol')")).rejects.toMatchObject({ code: '23505', constraint: 'modalities_unit_name_key_key' })
  })

  it('rolls back when the approved modality 13 precondition is no longer safe', async () => {
    await client.query("update public.modalities set name='Outro' where id=13")
    await expect(client.query(correction03)).rejects.toThrow(/audited modality 13/)
    await client.query('rollback')
    expect((await client.query("select to_regprocedure('private.modality_display_name_v2(text)') as function")).rows[0].function).toBeNull()
    expect((await client.query('select name,name_key from public.modalities where id=13')).rows[0]).toEqual({ name: 'Outro', name_key: 'outro' })
  })
})
