-- Compatibility supplement for the canonical migration
-- 20261002164707_add_public_organization_bootstrap_rpc.
--
-- The historical migration is recorded in the remote Supabase catalog but is
-- not present in this repository. It must run after
-- 20261003194135_bootstrap_owner_profile_name.sql, which creates the private
-- implementation. This file contains no data and no platform credentials.

create or replace function public.bootstrap_organization_owner(
  p_name text,
  p_trade_name text default null::text,
  p_email text default null::text,
  p_phone text default null::text
)
returns public.organizations
language sql
security definer
set search_path = ''
as $function$
  select private.bootstrap_organization_owner(p_name, p_trade_name, p_email, p_phone);
$function$;

revoke all on function public.bootstrap_organization_owner(text, text, text, text) from public, anon;
grant execute on function public.bootstrap_organization_owner(text, text, text, text) to authenticated;
