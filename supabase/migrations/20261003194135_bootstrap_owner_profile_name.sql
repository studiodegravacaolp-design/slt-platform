create or replace function private.bootstrap_organization_owner(
  p_name text,
  p_trade_name text default null::text,
  p_email text default null::text,
  p_phone text default null::text
)
returns organizations
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_auth_email text;
  v_person_name text;
  v_name text := trim(coalesce(p_name, ''));
  v_trade_name text := nullif(trim(coalesce(p_trade_name, '')), '');
  v_email text;
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_org public.organizations;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select
    email,
    nullif(trim(raw_user_meta_data ->> 'name'), '')
  into v_auth_email, v_person_name
  from auth.users
  where id = v_user_id;

  if nullif(trim(coalesce(v_auth_email, '')), '') is null then
    raise exception 'authenticated user email is required' using errcode = '22023';
  end if;

  if v_person_name is null then
    raise exception 'authenticated user name is required' using errcode = '22023';
  end if;

  if v_name is null or v_name = '' then
    raise exception 'organization name is required' using errcode = '22023';
  end if;

  if exists (select 1 from public.users where id = v_user_id) then
    raise exception 'user already belongs to an organization' using errcode = '23505';
  end if;

  v_email := lower(coalesce(nullif(trim(coalesce(p_email, '')), ''), v_auth_email));

  insert into public.organizations (name, trade_name, email, phone)
  values (v_name, v_trade_name, v_email, v_phone)
  returning * into v_org;

  insert into public.users (id, organization_id, name, email)
  values (v_user_id, v_org.id, v_person_name, v_email);

  return v_org;
end;
$function$;
