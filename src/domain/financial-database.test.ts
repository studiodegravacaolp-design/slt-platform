import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:net'

const runtimeEntry = resolve('node_modules/.modality-verification/node_modules/embedded-postgres/dist/index.js')
const supportsEmbeddedPostgres = process.platform !== 'win32' && existsSync(runtimeEntry)
const expansion = readFileSync(resolve('supabase/migrations/20261007140000_financial_integrity_expand.sql'), 'utf8')
const hardening = readFileSync(resolve('supabase/migrations/20261007140001_financial_integrity_harden.sql'), 'utf8')
const fixture = readFileSync(resolve('supabase/tests/financial-fixture.sql'), 'utf8')
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

describe.runIf(supportsEmbeddedPostgres)('financial integrity migration — disposable PostgreSQL 17', () => {
  let cluster: Cluster
  let client: Client
  let database: string
  let sequence = 0
  const clients: Client[] = []

  beforeAll(async () => {
    const { default: EmbeddedPostgres } = await import(/* @vite-ignore */ pathToFileURL(runtimeEntry).href)
    cluster = new EmbeddedPostgres({ databaseDir: resolve(`node_modules/.modality-verification/financial-data/${Date.now()}`), user: 'postgres', password: 'local-financial-test', port: await availablePort(), persistent: true, initdbFlags: ['--encoding=UTF8'], postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} }) as Cluster
    await cluster.initialise(); await cluster.start()
  }, 60000)
  beforeEach(async () => {
    database = `financial_test_${++sequence}`
    await cluster.createDatabase(database)
    client = cluster.getPgClient(database, '127.0.0.1')
    await client.connect(); clients.push(client)
    await client.query(fixture); await client.query(expansion)
  })
  afterEach(async () => { await Promise.all(clients.splice(0).map((connection) => connection.end())) })
  afterAll(async () => { if (cluster) await cluster.stop() }, 30000)

  async function authenticated(connection: Client, organization = 15) {
    await connection.query('set role authenticated')
    await connection.query(`select set_config('request.jwt.claim.sub', $1, false)`, [`00000000-0000-0000-0000-0000000000${organization}`])
  }

  function key(sequence: number) {
    return `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`
  }

  async function createCharge(competence: string, value = 100, idempotencyKey = key(++sequence)) {
    const { rows } = await client.query("select (public.create_financial_charge(15, 13, 12, 'recurring', $1::date, 'Mensalidade', '2026-10-01', '2099-10-10', $2::numeric, null, $3::uuid)).*", [competence, value, idempotencyKey])
    return rows[0]
  }

  it('preserves payment 11 and corrects charge 9 to paid without inferring a competence', async () => {
    const charge = await client.query('select id,status,charge_type,competence_month from public.charges where id=9')
    const payment = await client.query('select id,idempotency_key from public.payments where id=11')
    expect(charge.rows[0]).toEqual({ id: '9', status: 'paid', charge_type: 'legacy', competence_month: null })
    expect(payment.rows[0].id).toBe('11')
    expect(payment.rows[0].idempotency_key).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('supports partial payments, settles exactly once and rejects an excess', async () => {
    await authenticated(client)
    const charge = await createCharge('2026-11-01')
    const first = await client.query("select (public.record_financial_payment($1, 40, '2026-10-07', 'pix', null, '11111111-1111-4111-8111-111111111111')).*", [charge.id])
    expect(first.rows[0].amount_paid).toBe('40.00')
    expect((await client.query('select status from public.charges where id=$1', [charge.id])).rows[0].status).toBe('pending')
    await expect(client.query("select public.record_financial_payment($1, 61, '2026-10-07', 'pix', null, '22222222-2222-4222-8222-222222222222')", [charge.id])).rejects.toMatchObject({ code: '23514', message: expect.stringContaining('financial_payment_exceeds_balance') })
    await client.query("select public.record_financial_payment($1, 60, '2026-10-07', 'pix', null, '33333333-3333-4333-8333-333333333333')", [charge.id])
    expect((await client.query('select status from public.charges where id=$1', [charge.id])).rows[0].status).toBe('paid')
    await expect(client.query("select public.record_financial_payment($1, 1, '2026-10-07', 'pix', null, '44444444-4444-4444-8444-444444444444')", [charge.id])).rejects.toMatchObject({ code: '23514', message: expect.stringContaining('financial_charge_paid') })
  })

  it('returns the original payment for an idempotent retry and rejects a conflicting replay', async () => {
    await authenticated(client)
    const charge = await createCharge('2026-12-01')
    const key = '55555555-5555-4555-8555-555555555555'
    const first = await client.query("select (public.record_financial_payment($1, 10, '2026-10-07', 'pix', null, $2::uuid)).*", [charge.id, key])
    const retry = await client.query("select (public.record_financial_payment($1, 10, '2026-10-07', 'pix', null, $2::uuid)).*", [charge.id, key])
    expect(retry.rows[0].id).toBe(first.rows[0].id)
    expect((await client.query('select count(*)::int as total from public.payments where charge_id=$1', [charge.id])).rows[0].total).toBe(1)
    await expect(client.query("select public.record_financial_payment($1, 11, '2026-10-07', 'pix', null, $2::uuid)", [charge.id, key])).rejects.toMatchObject({ code: '23505', message: expect.stringContaining('financial_payment_idempotency_conflict') })
  })

  it('returns the original recurring or one-off charge for an idempotent retry and rejects a conflicting replay', async () => {
    await authenticated(client)
    const recurringKey = key(100)
    const first = await createCharge('2027-04-01', 100, recurringKey)
    const retry = await createCharge('2027-04-01', 100, recurringKey)
    expect(retry.id).toBe(first.id)
    await expect(createCharge('2027-04-01', 101, recurringKey)).rejects.toMatchObject({ code: '23505', message: expect.stringContaining('financial_charge_idempotency_conflict') })

    const oneOffKey = key(101)
    const oneOff = await client.query("select (public.create_financial_charge(15, 13, 12, 'one_off', null, 'Avaliação', '2026-10-01', '2099-10-10', 30, null, $1::uuid)).*", [oneOffKey])
    const oneOffRetry = await client.query("select (public.create_financial_charge(15, 13, 12, 'one_off', null, 'Avaliação', '2026-10-01', '2099-10-10', 30, null, $1::uuid)).*", [oneOffKey])
    expect(oneOffRetry.rows[0].id).toBe(oneOff.rows[0].id)
    expect((await client.query("select count(*)::int as total from public.charges where description = 'Avaliação'" )).rows[0].total).toBe(1)
  })

  it('prevents duplicate recurring charges, permits reissue after cancellation and blocks cancellation with payments', async () => {
    await authenticated(client)
    const charge = await createCharge('2027-01-01')
    await expect(createCharge('2027-01-01')).rejects.toMatchObject({ code: '23505', constraint: 'charges_recurring_competence_unique' })
    await client.query('select public.cancel_financial_charge($1)', [charge.id])
    await expect(createCharge('2027-01-01')).resolves.toBeTruthy()
    const paid = await createCharge('2027-02-01')
    await client.query("select public.record_financial_payment($1, 1, '2026-10-07', 'pix', null, '66666666-6666-4666-8666-666666666666')", [paid.id])
    await expect(client.query('select public.cancel_financial_charge($1)', [paid.id])).rejects.toMatchObject({ code: '23514', message: expect.stringContaining('financial_charge_has_payments') })
  })

  it('serializes concurrent payments and preserves tenant isolation', async () => {
    await authenticated(client)
    const charge = await createCharge('2027-03-01')
    const second = cluster.getPgClient(database, '127.0.0.1'); await second.connect(); clients.push(second); await authenticated(second)
    const left = client.query("select public.record_financial_payment($1, 60, '2026-10-07', 'pix', null, '77777777-7777-4777-8777-777777777777')", [charge.id])
    const right = second.query("select public.record_financial_payment($1, 60, '2026-10-07', 'pix', null, '88888888-8888-4888-8888-888888888888')", [charge.id])
    const results = await Promise.allSettled([left, right])
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    expect((await client.query('select count(*)::int as total from public.payments where charge_id=$1', [charge.id])).rows[0].total).toBe(1)
    const outsider = cluster.getPgClient(database, '127.0.0.1'); await outsider.connect(); clients.push(outsider); await authenticated(outsider, 16)
    await expect(outsider.query("select public.record_financial_payment($1, 1, '2026-10-07', 'pix', null, '99999999-9999-4999-8999-999999999999')", [charge.id])).rejects.toMatchObject({ code: '42501' })
  })

  it('serializes concurrent one-off charge creation through its idempotency key', async () => {
    await authenticated(client)
    const second = cluster.getPgClient(database, '127.0.0.1'); await second.connect(); clients.push(second); await authenticated(second)
    const idempotencyKey = key(120)
    const sql = "select (public.create_financial_charge(15, 13, 12, 'one_off', null, 'Taxa', '2026-10-01', '2099-10-10', 25, null, $1::uuid)).*"
    const results = await Promise.all([client.query(sql, [idempotencyKey]), second.query(sql, [idempotencyKey])])
    expect(results[0].rows[0].id).toBe(results[1].rows[0].id)
    expect((await client.query("select count(*)::int as total from public.charges where description = 'Taxa'" )).rows[0].total).toBe(1)
  })

  it('rejects a new recurring charge for an inactive or ended student plan', async () => {
    await authenticated(client)
    await client.query('reset role')
    await client.query("update public.student_plans set status = 'inactive' where id = 12")
    await authenticated(client)
    await expect(createCharge('2027-05-01')).rejects.toMatchObject({ code: '23514', message: expect.stringContaining('financial_inactive_student_plan') })
    await client.query('reset role')
    await client.query("update public.student_plans set status = 'active', end_date = '2026-10-01' where id = 12")
    await authenticated(client)
    await expect(createCharge('2027-06-01')).rejects.toMatchObject({ code: '23514', message: expect.stringContaining('financial_inactive_student_plan') })
  })

  it('keeps legacy direct writes working in expansion and blocks them only after hardening', async () => {
    await authenticated(client)
    const directCharge = await client.query("insert into public.charges (organization_id, student_id, unit_id, student_plan_id, issue_date, due_date, value, status, description) values (15, 15, 13, 12, '2026-10-01', '2099-10-10', 20, 'pending', 'Fluxo legado') returning id, charge_type, idempotency_key")
    expect(directCharge.rows[0].charge_type).toBe('legacy')
    expect(directCharge.rows[0].idempotency_key).toMatch(/^[0-9a-f-]{36}$/)

    await client.query('reset role')
    await client.query(hardening)
    expect((await client.query("select has_table_privilege('authenticated', 'public.charges', 'insert, update, delete') as writable")).rows[0].writable).toBe(false)
    expect((await client.query("select has_table_privilege('anon', 'public.payments', 'insert, update, delete') as writable")).rows[0].writable).toBe(false)
    await authenticated(client)
    await expect(client.query("insert into public.charges (organization_id, student_id, unit_id, student_plan_id, issue_date, due_date, value, status) values (15, 15, 13, 12, '2026-10-01', '2099-10-10', 20, 'pending')")).rejects.toMatchObject({ code: '42501' })
    await expect(client.query("select public.record_financial_payment($1, 20, '2026-10-07', 'pix', null, '12121212-1212-4121-8121-121212121212')", [directCharge.rows[0].id])).resolves.toBeTruthy()
  })
})
