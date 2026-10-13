-- Correction 04 / phase 2: run only after every financial write uses the RPCs
-- from the expansion phase. This migration deliberately keeps service_role and
-- database-owner access untouched, while removing Data API writes for clients.
begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';

lock table public.charges, public.payments in share row exclusive mode;

create temp table financial_security_snapshot on commit drop as
select c.relname, c.relrowsecurity, c.relforcerowsecurity,
  coalesce((select jsonb_agg(to_jsonb(p) order by p.policyname)
    from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname), '[]'::jsonb) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('charges', 'payments');

do $preconditions$
begin
  if to_regprocedure('public.create_financial_charge(bigint,bigint,bigint,text,date,text,date,date,numeric,text,uuid)') is null
    or to_regprocedure('public.record_financial_payment(bigint,numeric,date,text,text,uuid)') is null
    or to_regprocedure('public.cancel_financial_charge(bigint)') is null then
    raise exception 'Financial hardening aborted: expansion RPCs are missing.';
  end if;
end;
$preconditions$;

revoke insert, update, delete on table public.charges from public, anon, authenticated;
revoke insert, update, delete on table public.payments from public, anon, authenticated;

do $postconditions$
begin
  -- Checking the effective privileges of both client roles also detects grants
  -- inherited from PUBLIC.
  if has_table_privilege('anon', 'public.charges', 'insert,update,delete')
    or has_table_privilege('anon', 'public.payments', 'insert,update,delete')
    or has_table_privilege('authenticated', 'public.charges', 'insert,update,delete')
    or has_table_privilege('authenticated', 'public.payments', 'insert,update,delete') then
    raise exception 'Financial hardening aborted: a client role still has direct financial writes.';
  end if;
  if exists (
    select 1
    from financial_security_snapshot s
    join pg_class c on c.relname = s.relname
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    where (s.relrowsecurity, s.relforcerowsecurity) is distinct from (c.relrowsecurity, c.relforcerowsecurity)
      or s.policies is distinct from coalesce((select jsonb_agg(to_jsonb(p) order by p.policyname) from pg_policies p where p.schemaname = 'public' and p.tablename = s.relname), '[]'::jsonb)
  ) then
    raise exception 'Financial hardening aborted: charges or payments RLS/policies changed unexpectedly.';
  end if;
end;
$postconditions$;

commit;
