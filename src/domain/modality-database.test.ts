import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:net'
import { cleanModalityName, modalityDiacritics, modalityWhitespace, normalizeModalityName } from './modality-name'
import caseMap from './modality-case-map.json'

// Optional native test runtime, installed OUTSIDE the application's dependencies.
// No external connection string: these tests can only start a disposable local DB.
const runtimeEntry = resolve('node_modules/.modality-verification/node_modules/embedded-postgres/dist/index.js')
const migration = readFileSync(resolve('supabase/migrations/20261005224442_modalities_name_key_uniqueness.sql'), 'utf8')
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

describe.runIf(existsSync(runtimeEntry))('modality migration — disposable PostgreSQL 17', () => {
  let cluster: Cluster
  let client: Client
  let database: string
  let sequence = 0
  const clients: Client[] = []
  beforeAll(async () => {
    const { default: EmbeddedPostgres } = await import(/* @vite-ignore */ pathToFileURL(runtimeEntry).href)
    cluster = new EmbeddedPostgres({
      databaseDir: resolve(`node_modules/.modality-verification/data/${Date.now()}`),
      user: 'postgres', password: 'local-modality-test', port: await availablePort(),
      persistent: true, initdbFlags: ['--encoding=UTF8'],
      postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {},
    }) as Cluster
    await cluster.initialise()
    await cluster.start()
  }, 60000)
  beforeEach(async () => {
    database = `modality_test_${++sequence}`
    await cluster.createDatabase(database)
    client = cluster.getPgClient(database, '127.0.0.1')
    await client.connect()
    clients.push(client)
    await client.query(fixture)
  })
  afterEach(async () => { await Promise.all(clients.splice(0).map((connection) => connection.end())) })
  afterAll(async () => { if (cluster) await cluster.stop() }, 30000)

  async function authenticated(connection: Client, organization = 15) {
    await connection.query('set role authenticated')
    await connection.query(`select set_config('request.jwt.claim.sub', $1, false)`, [`00000000-0000-0000-0000-0000000000${organization}`])
  }
  async function aborted(sql: string, message: RegExp) {
    await client.query(sql)
    await expect(client.query(migration)).rejects.toThrow(message)
    await client.query('rollback')
    expect((await client.query('select count(*)::int as total from public.modalities where id in (11,12)')).rows[0].total).toBe(2)
    expect((await client.query("select count(*)::int as total from information_schema.columns where table_schema='public' and table_name='modalities' and column_name='name_key'")).rows[0].total).toBe(0)
    expect((await client.query("select to_regprocedure('private.modality_name_key_v1(text)') as function")).rows[0].function).toBeNull()
  }
  it('preserves ID 12, removes only 11 and preserves RLS, policies and table grants', async () => {
    const security = `select relrowsecurity,relforcerowsecurity,relacl::text from pg_class where oid='public.modalities'::regclass`
    const before = await client.query(security)
    const policies = await client.query("select * from pg_policies where tablename='modalities' order by policyname")
    await client.query(migration)
    expect((await client.query('select id,name,name_key,status,description from public.modalities')).rows).toEqual([{ id: '12', name: 'Natação', name_key: 'natacao', status: 'active', description: 'Natação' }])
    expect((await client.query(security)).rows).toEqual(before.rows)
    expect((await client.query("select * from pg_policies where tablename='modalities' order by policyname")).rows).toEqual(policies.rows)
    expect((await client.query("select has_function_privilege('authenticated','private.set_modality_name_v1()','execute') as allowed")).rows[0].allowed).toBe(false)
  })
  it('matches application whitespace, diacritics and canonical Unicode rules', async () => {
    await client.query(migration)
    const names = ['natacao','Natacao','NATACAO','natação','Natação','NATAÇÃO',' natacao ','Natac\u0327a\u0303o','Tênis','Te\u0302nis','Nata-ção','Nata  ção','Minha MODALIDADE','Æ','a\u0338', ...[...modalityWhitespace].map((space) => `${space}A${space}${space}B${space}`), ...[...modalityDiacritics].map((mark) => `A${mark}`)]
    for (const name of names) {
      const { rows } = await client.query('select private.clean_modality_name_v1($1) as name, private.modality_name_key_v1($1) as key', [name])
      expect(rows[0], name).toEqual({ name: cleanModalityName(name), key: normalizeModalityName(name) })
    }
    // Also exercise every frozen casing pair against the actual SQL rules.
    const { rows } = await client.query('select private.modality_name_key_v1($1) as key', [caseMap.uppercase])
    expect(rows[0].key).toBe(normalizeModalityName(caseMap.uppercase))
  })
  it('recomputes forged keys, canonicalizes names, includes inactive records and rejects conflicting renames', async () => {
    await client.query(migration)
    await authenticated(client)
    const { rows } = await client.query("insert into public.modalities(unit_id,name,name_key) values(14,' NATACAO ','forged') returning id,name,name_key")
    expect(rows[0]).toMatchObject({ name: 'Natação', name_key: 'natacao' })
    await client.query("update public.modalities set name_key='forged' where id=$1", [rows[0].id])
    expect((await client.query('select name_key from public.modalities where id=$1', [rows[0].id])).rows[0].name_key).toBe('natacao')
    await client.query("update public.modalities set status='inactive' where id=12")
    await expect(client.query("insert into public.modalities(unit_id,name) values(13,'natacao')")).rejects.toMatchObject({ code: '23505', constraint: 'modalities_unit_name_key_key' })
    const other = await client.query("insert into public.modalities(unit_id,name) values(13,'Outra') returning id")
    await expect(client.query("update public.modalities set name='NATACAO' where id=$1", [other.rows[0].id])).rejects.toMatchObject({ code: '23505' })
    await expect(client.query("insert into public.modalities(unit_id,name) values(13,'   ')")).rejects.toMatchObject({ code: '23514' })
  })
  it.each(['natacao', 'Natacao', 'NATACAO', 'natação', 'Natação', 'NATAÇÃO'])('direct INSERT and UPDATE of %s both persist Natação / natacao', async (name) => {
    await client.query(migration)
    await authenticated(client)
    // Exercise the actual trigger as authenticated, in a disposable LOCAL DB.
    const inserted = await client.query('insert into public.modalities(unit_id,name,name_key) values(14,$1,$2) returning id,name,name_key', [name, 'forged'])
    expect(inserted.rows[0]).toMatchObject({ name: 'Natação', name_key: 'natacao' })
    const id = inserted.rows[0].id
    await client.query("update public.modalities set name='Outra' where id=$1", [id])
    const updated = await client.query('update public.modalities set name=$1,name_key=$2 where id=$3 returning name,name_key', [name, 'forged', id])
    expect(updated.rows[0]).toEqual({ name: 'Natação', name_key: 'natacao' })
    const unique = await client.query("select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid='public.modalities'::regclass and conname='modalities_unit_name_key_key'")
    expect(unique.rows[0].definition).toBe('UNIQUE (unit_id, name_key)')
  })
  it('preserves tenant isolation for reads, writes and reassignment with authenticated RLS', async () => {
    await client.query(migration)
    await authenticated(client, 16)
    expect((await client.query('select * from public.modalities')).rows).toEqual([])
    await expect(client.query("insert into public.modalities(unit_id,name) values(13,'natacao')")).rejects.toMatchObject({ code: '42501' })
    await client.query("insert into public.modalities(unit_id,name) values(16,'natacao')")
    await expect(client.query('update public.modalities set unit_id=13 where unit_id=16')).rejects.toMatchObject({ code: '42501' })
    expect((await client.query("update public.modalities set name='changed' where id=12 returning id")).rows).toEqual([])
  })
  it('atomically rejects a second connection while the winning insert is uncommitted', async () => {
    await client.query(migration)
    const second = cluster.getPgClient(database, '127.0.0.1')
    await second.connect(); clients.push(second)
    await authenticated(client); await authenticated(second)
    const pid = (await second.query('select pg_backend_pid() as pid')).rows[0].pid
    const observer = cluster.getPgClient(database, '127.0.0.1')
    await observer.connect(); clients.push(observer)
    await client.query('begin')
    await client.query("insert into public.modalities(unit_id,name) values(14,'Natacao')")
    const result = second.query("insert into public.modalities(unit_id,name) values(14,'NATAÇÃO')").then(() => ({ code: 'unexpected-success' }), (error: { code: string; constraint: string }) => error)
    // Prove actual overlap, rather than merely launching two promises.
    let waiting = false
    try {
      const deadline = Date.now() + 5000
      while (Date.now() < deadline) {
        const activity = await observer.query('select wait_event_type from pg_stat_activity where pid=$1', [pid])
        if (activity.rows[0]?.wait_event_type === 'Lock') { waiting = true; break }
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    } finally { await client.query('commit') }
    expect(await result).toMatchObject({ code: '23505', constraint: 'modalities_unit_name_key_key' })
    expect(waiting).toBe(true)
    expect((await client.query('select count(*)::int as total from public.modalities where unit_id=14')).rows[0].total).toBe(1)
  })
  it.each([
    'update public.modalities set status=\'active\' where id=11',
    'update public.modalities set unit_id=14 where id=11',
    'update public.modalities set name=\'Outra\' where id=12',
    'update public.units set organization_id=16 where id=13',
  ])('aborts and rolls back when audited state changes: %s', async (sql) => { await aborted(sql, /audited 11\/12/) })
  it.each([
    'insert into public.student_modality_units(id,modality_id) values(1,11)',
    'insert into public.attendance(id,modality_id) values(1,11)',
    'insert into public.evaluations(id,modality_id) values(1,12)',
    'insert into public.student_modality_units(id,modality_id) values(1,12); insert into public.trainings values(1,1); insert into public.training_exercises values(1,1)',
  ])('aborts rather than migrating new references: %s', async (sql) => { await aborted(sql, /direct or indirect references/) })
  it('aborts on any other normalized duplicate without deleting the approved pair', async () => {
    await aborted("insert into public.modalities(unit_id,name) values(14,'Tênis'),(14,'TENIS')", /other equivalent modalities/)
  })
})
