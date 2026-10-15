-- Read-only catalog queries used to re-audit the canonical structural cut.
-- They intentionally return no rows from application tables.

-- Application relations and RLS state.
select n.nspname as schema_name, c.relname as relation_name, c.relkind,
       c.relrowsecurity as rls_enabled, pg_catalog.pg_get_userbyid(c.relowner) as owner
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'private') and c.relkind in ('r', 'v', 'm', 'S')
order by n.nspname, c.relkind, c.relname;

-- Columns, defaults, identities and constraints.
select n.nspname as schema_name, c.relname as table_name, a.attnum,
       a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
       a.attnotnull, a.attidentity,
       pg_catalog.pg_get_expr(d.adbin, d.adrelid) as default_expression
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
join pg_catalog.pg_attribute a on a.attrelid = c.oid
left join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
where n.nspname in ('public', 'private') and c.relkind = 'r'
  and a.attnum > 0 and not a.attisdropped
order by n.nspname, c.relname, a.attnum;

select n.nspname as schema_name, c.relname as table_name, con.conname,
       con.contype, pg_catalog.pg_get_constraintdef(con.oid, true) as definition
from pg_catalog.pg_constraint con
join pg_catalog.pg_class c on c.oid = con.conrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'private')
order by n.nspname, c.relname, con.conname;

-- Indexes, functions, triggers, policies and grants.
select schemaname, tablename, indexname, indexdef
from pg_catalog.pg_indexes
where schemaname in ('public', 'private')
order by schemaname, tablename, indexname;

select n.nspname as schema_name, p.proname,
       pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments,
       pg_catalog.pg_get_functiondef(p.oid) as definition
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
order by n.nspname, p.proname, arguments;

select n.nspname as schema_name, c.relname as table_name, t.tgname,
       pg_catalog.pg_get_triggerdef(t.oid, true) as definition
from pg_catalog.pg_trigger t
join pg_catalog.pg_class c on c.oid = t.tgrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'private') and not t.tgisinternal
order by n.nspname, c.relname, t.tgname;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where schemaname in ('public', 'private')
order by schemaname, tablename, policyname;

select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema in ('public', 'private')
order by table_schema, table_name, grantee, privilege_type;
