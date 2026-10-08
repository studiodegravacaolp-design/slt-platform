-- Correction 04 / phase 1: additive and backward-compatible expansion.
-- Do not apply remotely until PostgreSQL validation and deployment planning are complete.
begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';

lock table public.charges, public.payments, public.student_plans, public.students,
  public.units, public.plans in share row exclusive mode;

create temp table financial_security_snapshot on commit drop as
select c.relname, c.relrowsecurity, c.relforcerowsecurity,
  coalesce((select jsonb_agg(to_jsonb(p) order by p.policyname)
    from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname), '[]'::jsonb) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('charges', 'payments');

do $preconditions$
begin
  if to_regprocedure('gen_random_uuid()') is null then
    raise exception 'Financial correction aborted: gen_random_uuid() is unavailable.';
  end if;

  if exists (
    select 1
    from public.charges c
    left join public.payments p on p.charge_id = c.id
    group by c.id, c.value
    having coalesce(sum(p.amount_paid), 0::numeric) > c.value
  ) then
    raise exception 'Financial correction aborted: an existing charge is overpaid.';
  end if;

  if exists (
    select 1 from public.charges c
    where c.status = 'cancelled'
      and exists (select 1 from public.payments p where p.charge_id = c.id)
  ) then
    raise exception 'Financial correction aborted: a cancelled charge already has payments.';
  end if;
end;
$preconditions$;

-- Defaults intentionally remain during the expansion phase. They keep the
-- already-published direct-write frontend working until hardening is deployed.
alter table public.charges
  add column charge_type text not null default 'legacy',
  add column competence_month date,
  add column idempotency_key uuid not null default gen_random_uuid(),
  add constraint charges_type_competence_check
    check (
      (charge_type = 'recurring' and competence_month is not null)
      or (charge_type in ('one_off', 'legacy') and competence_month is null)
    ),
  add constraint charges_competence_month_check
    check (competence_month is null or date_trunc('month', competence_month)::date = competence_month);

alter table public.payments
  add column idempotency_key uuid not null default gen_random_uuid(),
  add constraint payments_charge_idempotency_key_key unique (charge_id, idempotency_key);

alter table public.charges
  add constraint charges_organization_idempotency_key_key unique (organization_id, idempotency_key);

create unique index charges_recurring_competence_unique
  on public.charges (student_plan_id, competence_month)
  where charge_type = 'recurring' and status <> 'cancelled';

create or replace function public.create_financial_charge(
  p_student_id bigint,
  p_unit_id bigint,
  p_student_plan_id bigint,
  p_charge_type text,
  p_competence_month date,
  p_description text,
  p_issue_date date,
  p_due_date date,
  p_value numeric,
  p_observation text,
  p_idempotency_key uuid
)
returns public.charges
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_organization_id bigint;
  v_charge public.charges;
  v_existing public.charges;
  v_description text;
  v_observation text;
begin
  select u.organization_id into v_organization_id
  from public.users u
  where u.id = auth.uid() and u.status = 'active';

  if v_organization_id is null then
    raise exception 'financial_authentication_required' using errcode = '42501';
  end if;
  if p_charge_type not in ('recurring', 'one_off') then
    raise exception 'financial_invalid_charge_type' using errcode = '23514';
  end if;
  if (p_charge_type = 'recurring' and p_competence_month is null)
    or (p_charge_type = 'one_off' and p_competence_month is not null)
    or (p_competence_month is not null and date_trunc('month', p_competence_month)::date <> p_competence_month) then
    raise exception 'financial_invalid_charge_competence' using errcode = '23514';
  end if;
  if p_value is null or p_value <= 0 or p_issue_date is null or p_due_date is null
    or p_issue_date > p_due_date or p_idempotency_key is null then
    raise exception 'financial_invalid_charge_data' using errcode = '23514';
  end if;

  v_description := nullif(pg_catalog.btrim(p_description), '');
  v_observation := nullif(pg_catalog.btrim(p_observation), '');

  select * into v_existing
  from public.charges c
  where c.organization_id = v_organization_id and c.idempotency_key = p_idempotency_key;
  if found then
    if v_existing.student_id = p_student_id
      and v_existing.unit_id = p_unit_id
      and v_existing.student_plan_id = p_student_plan_id
      and v_existing.charge_type = p_charge_type
      and v_existing.competence_month is not distinct from p_competence_month
      and v_existing.description is not distinct from v_description
      and v_existing.issue_date = p_issue_date
      and v_existing.due_date = p_due_date
      and v_existing.value = p_value
      and v_existing.observation is not distinct from v_observation then
      return v_existing;
    end if;
    raise exception 'financial_charge_idempotency_conflict' using errcode = '23505';
  end if;

  if not exists (
    select 1
    from public.student_plans sp
    join public.students s on s.id = sp.student_id and s.organization_id = v_organization_id
    join public.units un on un.id = sp.unit_id and un.organization_id = v_organization_id and un.status = 'active'
    join public.plans pl on pl.id = sp.plan_id and pl.organization_id = v_organization_id
    where sp.id = p_student_plan_id and sp.student_id = p_student_id and sp.unit_id = p_unit_id
  ) then
    raise exception 'financial_invalid_charge_context' using errcode = '23514';
  end if;

  if p_charge_type = 'recurring' and not exists (
    select 1 from public.student_plans sp
    where sp.id = p_student_plan_id and sp.status = 'active' and sp.end_date is null
  ) then
    raise exception 'financial_inactive_student_plan' using errcode = '23514';
  end if;

  begin
    insert into public.charges (
      organization_id, student_id, unit_id, student_plan_id, charge_type, competence_month,
      idempotency_key, description, issue_date, due_date, value, status, observation
    ) values (
      v_organization_id, p_student_id, p_unit_id, p_student_plan_id, p_charge_type, p_competence_month,
      p_idempotency_key, v_description, p_issue_date, p_due_date, p_value,
      case when p_due_date < current_date then 'overdue' else 'pending' end, v_observation
    ) returning * into v_charge;
  exception when unique_violation then
    select * into v_existing
    from public.charges c
    where c.organization_id = v_organization_id and c.idempotency_key = p_idempotency_key;
    if found then
      if v_existing.student_id = p_student_id
        and v_existing.unit_id = p_unit_id
        and v_existing.student_plan_id = p_student_plan_id
        and v_existing.charge_type = p_charge_type
        and v_existing.competence_month is not distinct from p_competence_month
        and v_existing.description is not distinct from v_description
        and v_existing.issue_date = p_issue_date
        and v_existing.due_date = p_due_date
        and v_existing.value = p_value
        and v_existing.observation is not distinct from v_observation then
        return v_existing;
      end if;
      raise exception 'financial_charge_idempotency_conflict' using errcode = '23505';
    end if;
    raise;
  end;

  return v_charge;
end;
$function$;

create or replace function public.record_financial_payment(
  p_charge_id bigint,
  p_amount_paid numeric,
  p_payment_date date,
  p_payment_method text,
  p_observation text,
  p_idempotency_key uuid
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_organization_id bigint;
  v_charge public.charges;
  v_existing public.payments;
  v_payment public.payments;
  v_total_paid numeric;
  v_remaining numeric;
  v_payment_method text;
  v_observation text;
begin
  select u.organization_id into v_organization_id
  from public.users u
  where u.id = auth.uid() and u.status = 'active';

  if v_organization_id is null then
    raise exception 'financial_authentication_required' using errcode = '42501';
  end if;
  v_payment_method := nullif(pg_catalog.btrim(p_payment_method), '');
  v_observation := nullif(pg_catalog.btrim(p_observation), '');
  if p_charge_id is null or p_amount_paid is null or p_amount_paid <= 0
    or p_payment_date is null or p_idempotency_key is null
    or v_payment_method not in ('cash', 'pix', 'card', 'transfer') then
    raise exception 'financial_invalid_payment_data' using errcode = '23514';
  end if;

  select * into v_charge
  from public.charges c
  where c.id = p_charge_id and c.organization_id = v_organization_id
  for update;
  if not found then
    raise exception 'financial_charge_not_found' using errcode = '42501';
  end if;

  select * into v_existing
  from public.payments p
  where p.charge_id = p_charge_id and p.idempotency_key = p_idempotency_key;
  if found then
    if v_existing.amount_paid = p_amount_paid
      and v_existing.payment_date = p_payment_date
      and v_existing.payment_method = v_payment_method
      and v_existing.observation is not distinct from v_observation then
      return v_existing;
    end if;
    raise exception 'financial_payment_idempotency_conflict' using errcode = '23505';
  end if;

  if v_charge.status = 'cancelled' then
    raise exception 'financial_charge_cancelled' using errcode = '23514';
  end if;
  if v_charge.status = 'paid' then
    raise exception 'financial_charge_paid' using errcode = '23514';
  end if;

  select coalesce(sum(p.amount_paid), 0::numeric) into v_total_paid
  from public.payments p where p.charge_id = p_charge_id;
  v_remaining := v_charge.value - v_total_paid;
  if p_amount_paid > v_remaining then
    raise exception 'financial_payment_exceeds_balance' using errcode = '23514';
  end if;

  insert into public.payments (
    charge_id, amount_paid, payment_date, payment_method, observation, idempotency_key
  ) values (
    p_charge_id, p_amount_paid, p_payment_date, v_payment_method, v_observation, p_idempotency_key
  ) returning * into v_payment;

  update public.charges
  set status = case
    when v_total_paid + p_amount_paid = v_charge.value then 'paid'
    when v_charge.due_date < current_date then 'overdue'
    else 'pending'
  end
  where id = v_charge.id;

  return v_payment;
end;
$function$;

create or replace function public.cancel_financial_charge(p_charge_id bigint)
returns public.charges
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_organization_id bigint;
  v_charge public.charges;
begin
  select u.organization_id into v_organization_id
  from public.users u
  where u.id = auth.uid() and u.status = 'active';
  if v_organization_id is null then
    raise exception 'financial_authentication_required' using errcode = '42501';
  end if;

  select * into v_charge from public.charges c
  where c.id = p_charge_id and c.organization_id = v_organization_id
  for update;
  if not found then
    raise exception 'financial_charge_not_found' using errcode = '42501';
  end if;
  if v_charge.status = 'cancelled' then
    return v_charge;
  end if;
  if exists (select 1 from public.payments p where p.charge_id = v_charge.id) then
    raise exception 'financial_charge_has_payments' using errcode = '23514';
  end if;

  update public.charges set status = 'cancelled' where id = v_charge.id returning * into v_charge;
  return v_charge;
end;
$function$;

revoke all on function public.create_financial_charge(bigint, bigint, bigint, text, date, text, date, date, numeric, text, uuid) from public, anon;
revoke all on function public.record_financial_payment(bigint, numeric, date, text, text, uuid) from public, anon;
revoke all on function public.cancel_financial_charge(bigint) from public, anon;
grant execute on function public.create_financial_charge(bigint, bigint, bigint, text, date, text, date, date, numeric, text, uuid) to authenticated;
grant execute on function public.record_financial_payment(bigint, numeric, date, text, text, uuid) to authenticated;
grant execute on function public.cancel_financial_charge(bigint) to authenticated;

-- Preserve IDs and all rows; only repair charges that are already fully paid.
update public.charges c
set status = 'paid'
where c.status in ('pending', 'overdue')
  and coalesce((select sum(p.amount_paid) from public.payments p where p.charge_id = c.id), 0::numeric) = c.value;

do $postconditions$
begin
  if exists (
    select 1 from public.charges c
    left join public.payments p on p.charge_id = c.id
    group by c.id, c.value
    having coalesce(sum(p.amount_paid), 0::numeric) > c.value
  ) then
    raise exception 'Financial correction aborted: overpaid charge after expansion.';
  end if;
  if exists (select 1 from public.charges where idempotency_key is null)
    or exists (select 1 from public.payments where idempotency_key is null) then
    raise exception 'Financial correction aborted: idempotency key is missing.';
  end if;
  if exists (
    select 1
    from financial_security_snapshot s
    join pg_class c on c.relname = s.relname
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    where (s.relrowsecurity, s.relforcerowsecurity) is distinct from (c.relrowsecurity, c.relforcerowsecurity)
      or s.policies is distinct from coalesce((select jsonb_agg(to_jsonb(p) order by p.policyname) from pg_policies p where p.schemaname = 'public' and p.tablename = s.relname), '[]'::jsonb)
  ) then
    raise exception 'Financial correction aborted: charges or payments RLS/policies changed unexpectedly.';
  end if;
end;
$postconditions$;

commit;
