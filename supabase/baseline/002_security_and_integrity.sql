-- Security and integrity layer for 001_public_schema.sql.
-- This contains no production data. auth.users is supplied by Supabase.

create or replace function private.current_user_organization_id()
returns bigint language sql stable security definer set search_path = public as $$
  select u.organization_id from public.users u
  where u.id = auth.uid() and u.status = 'active' limit 1;
$$;

create or replace function public.current_user_organization_id()
returns bigint language sql stable security definer set search_path = public as $$
  select u.organization_id from public.users u
  where u.id = auth.uid() and u.status = 'active' limit 1;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.validate_student_modality_unit()
returns trigger language plpgsql set search_path = public as $$
declare student_org bigint; modality_unit bigint; unit_org bigint;
begin
  select organization_id into student_org from public.students where id = new.student_id;
  select unit_id into modality_unit from public.modalities where id = new.modality_id;
  select organization_id into unit_org from public.units where id = new.unit_id;
  if student_org is null or modality_unit is null or unit_org is null then raise exception 'Invalid student, modality or unit reference'; end if;
  if modality_unit <> new.unit_id then raise exception 'Modality % does not belong to unit %', new.modality_id, new.unit_id; end if;
  if student_org <> unit_org then raise exception 'Student and unit belong to different organizations'; end if;
  if new.end_date is not null and new.end_date < new.start_date then raise exception 'end_date cannot be earlier than start_date'; end if;
  return new;
end;
$$;

create or replace function public.validate_student_plan()
returns trigger language plpgsql set search_path = public as $$
declare student_org bigint; unit_org bigint; plan_org bigint;
begin
  select organization_id into student_org from public.students where id = new.student_id;
  select organization_id into unit_org from public.units where id = new.unit_id;
  select organization_id into plan_org from public.plans where id = new.plan_id;
  if student_org is null or unit_org is null or plan_org is null then raise exception 'Invalid student, unit or plan reference'; end if;
  if student_org <> unit_org or student_org <> plan_org then raise exception 'Student, unit and plan must belong to the same organization'; end if;
  if new.end_date is not null and new.end_date < new.start_date then raise exception 'end_date cannot be earlier than start_date'; end if;
  return new;
end;
$$;

create or replace function public.validate_charge_context()
returns trigger language plpgsql set search_path = public as $$
declare unit_org bigint; student_org bigint; plan_student bigint; plan_unit bigint;
begin
  select organization_id into unit_org from public.units where id = new.unit_id;
  select organization_id into student_org from public.students where id = new.student_id;
  select student_id, unit_id into plan_student, plan_unit from public.student_plans where id = new.student_plan_id;
  if unit_org is null or student_org is null or plan_student is null or plan_unit is null then raise exception 'Invalid charge references'; end if;
  if new.organization_id <> unit_org or new.organization_id <> student_org then raise exception 'Charge organization does not match related records'; end if;
  if plan_student <> new.student_id or plan_unit <> new.unit_id then raise exception 'Charge student plan does not match student and unit'; end if;
  return new;
end;
$$;

create or replace function public.validate_attendance_context()
returns trigger language plpgsql set search_path = public as $$
declare unit_org bigint; student_org bigint; modality_unit bigint;
begin
  select organization_id into unit_org from public.units where id = new.unit_id;
  select organization_id into student_org from public.students where id = new.student_id;
  select unit_id into modality_unit from public.modalities where id = new.modality_id;
  if unit_org is null or student_org is null or modality_unit is null then raise exception 'Invalid attendance references'; end if;
  if new.organization_id <> unit_org or new.organization_id <> student_org then raise exception 'Attendance organization does not match student and unit'; end if;
  if modality_unit <> new.unit_id then raise exception 'Attendance modality does not belong to unit'; end if;
  if new.status = 'absent' and (new.check_in_time is not null or new.check_out_time is not null) then raise exception 'Absent attendance cannot contain check-in or check-out times'; end if;
  return new;
end;
$$;

create or replace function public.validate_evaluation_context()
returns trigger language plpgsql set search_path = public as $$
declare unit_org bigint; student_org bigint; modality_unit bigint; responsible_org bigint;
begin
  select organization_id into unit_org from public.units where id = new.unit_id;
  select organization_id into student_org from public.students where id = new.student_id;
  select unit_id into modality_unit from public.modalities where id = new.modality_id;
  select organization_id into responsible_org from public.users where id = new.responsible_user_id;
  if unit_org is null or student_org is null or modality_unit is null or responsible_org is null then raise exception 'Invalid evaluation references'; end if;
  if new.organization_id <> unit_org or new.organization_id <> student_org or new.organization_id <> responsible_org then raise exception 'Evaluation organization does not match related records'; end if;
  if modality_unit <> new.unit_id then raise exception 'Evaluation modality does not belong to unit'; end if;
  return new;
end;
$$;

create trigger student_modality_units_validate_context before insert or update on public.student_modality_units for each row execute function public.validate_student_modality_unit();
create trigger student_plans_validate_context before insert or update on public.student_plans for each row execute function public.validate_student_plan();
create trigger charges_validate_context before insert or update on public.charges for each row execute function public.validate_charge_context();
create trigger attendance_validate_context before insert or update on public.attendance for each row execute function public.validate_attendance_context();
create trigger evaluations_validate_context before insert or update on public.evaluations for each row execute function public.validate_evaluation_context();

do $$
declare item text;
begin
  foreach item in array array['organizations','units','modalities','students','users','student_modality_units','trainings','training_exercises','attendance','evaluations','evaluation_results','plans','student_plans','charges','payments']
  loop
    execute format('alter table public.%I enable row level security', item);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', item || '_set_updated_at', item);
  end loop;
end;
$$;

-- Modalities' canonical name trigger is created by the already-versioned
-- 20261005224442 and 20261006122715 migrations after this base layer.

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on function private.current_user_organization_id() from public;
revoke all on function public.current_user_organization_id() from public;
grant execute on function public.current_user_organization_id() to authenticated;

-- Policy definitions are intentionally generated from the same organization
-- predicates confirmed in the canonical catalog. The function is removed once
-- the 56 policies have been installed.
do $$
begin
  execute 'create policy organizations_select_own on public.organizations for select to authenticated using (id = (select private.current_user_organization_id()))';
  execute 'create policy organizations_update_own on public.organizations for update to authenticated using (id = (select private.current_user_organization_id())) with check (id = (select private.current_user_organization_id()))';
  execute 'create policy users_select_own on public.users for select to authenticated using (id = (select auth.uid()))';
  execute 'create policy users_update_own on public.users for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()))';

  execute 'create policy units_select_org on public.units for select to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy units_insert_org on public.units for insert to authenticated with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy units_update_org on public.units for update to authenticated using (organization_id = (select private.current_user_organization_id())) with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy units_delete_org on public.units for delete to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy students_select_org on public.students for select to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy students_insert_org on public.students for insert to authenticated with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy students_update_org on public.students for update to authenticated using (organization_id = (select private.current_user_organization_id())) with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy students_delete_org on public.students for delete to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy plans_select_org on public.plans for select to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy plans_insert_org on public.plans for insert to authenticated with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy plans_update_org on public.plans for update to authenticated using (organization_id = (select private.current_user_organization_id())) with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy plans_delete_org on public.plans for delete to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy charges_select_org on public.charges for select to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy charges_insert_org on public.charges for insert to authenticated with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy charges_update_org on public.charges for update to authenticated using (organization_id = (select private.current_user_organization_id())) with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy charges_delete_org on public.charges for delete to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy attendance_select_org on public.attendance for select to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy attendance_insert_org on public.attendance for insert to authenticated with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy attendance_update_org on public.attendance for update to authenticated using (organization_id = (select private.current_user_organization_id())) with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy attendance_delete_org on public.attendance for delete to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy evaluations_select_org on public.evaluations for select to authenticated using (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy evaluations_insert_org on public.evaluations for insert to authenticated with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy evaluations_update_org on public.evaluations for update to authenticated using (organization_id = (select private.current_user_organization_id())) with check (organization_id = (select private.current_user_organization_id()))';
  execute 'create policy evaluations_delete_org on public.evaluations for delete to authenticated using (organization_id = (select private.current_user_organization_id()))';

  execute 'create policy modalities_select_org on public.modalities for select to authenticated using (exists (select 1 from public.units u where u.id = modalities.unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy modalities_insert_org on public.modalities for insert to authenticated with check (exists (select 1 from public.units u where u.id = modalities.unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy modalities_update_org on public.modalities for update to authenticated using (exists (select 1 from public.units u where u.id = modalities.unit_id and u.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.units u where u.id = modalities.unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy modalities_delete_org on public.modalities for delete to authenticated using (exists (select 1 from public.units u where u.id = modalities.unit_id and u.organization_id = (select private.current_user_organization_id())))';

  execute 'create policy student_modality_units_select_org on public.student_modality_units for select to authenticated using (exists (select 1 from public.students s where s.id = student_modality_units.student_id and s.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.units u where u.id = student_modality_units.unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy student_modality_units_insert_org on public.student_modality_units for insert to authenticated with check (exists (select 1 from public.students s where s.id = student_modality_units.student_id and s.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.units u where u.id = student_modality_units.unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy student_modality_units_update_org on public.student_modality_units for update to authenticated using (exists (select 1 from public.students s where s.id = student_modality_units.student_id and s.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.students s where s.id = student_modality_units.student_id and s.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.units u where u.id = student_modality_units.unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy student_modality_units_delete_org on public.student_modality_units for delete to authenticated using (exists (select 1 from public.students s where s.id = student_modality_units.student_id and s.organization_id = (select private.current_user_organization_id())))';

  execute 'create policy student_plans_select_org on public.student_plans for select to authenticated using (exists (select 1 from public.students s where s.id = student_plans.student_id and s.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy student_plans_insert_org on public.student_plans for insert to authenticated with check (exists (select 1 from public.students s where s.id = student_plans.student_id and s.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.units u where u.id = student_plans.unit_id and u.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.plans p where p.id = student_plans.plan_id and p.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy student_plans_update_org on public.student_plans for update to authenticated using (exists (select 1 from public.students s where s.id = student_plans.student_id and s.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.students s where s.id = student_plans.student_id and s.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.units u where u.id = student_plans.unit_id and u.organization_id = (select private.current_user_organization_id())) and exists (select 1 from public.plans p where p.id = student_plans.plan_id and p.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy student_plans_delete_org on public.student_plans for delete to authenticated using (exists (select 1 from public.students s where s.id = student_plans.student_id and s.organization_id = (select private.current_user_organization_id())))';

  execute 'create policy trainings_select_org on public.trainings for select to authenticated using (exists (select 1 from public.student_modality_units smu join public.units u on u.id = smu.unit_id where smu.id = trainings.student_modality_unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy trainings_insert_org on public.trainings for insert to authenticated with check (exists (select 1 from public.student_modality_units smu join public.units u on u.id = smu.unit_id where smu.id = trainings.student_modality_unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy trainings_update_org on public.trainings for update to authenticated using (exists (select 1 from public.student_modality_units smu join public.units u on u.id = smu.unit_id where smu.id = trainings.student_modality_unit_id and u.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.student_modality_units smu join public.units u on u.id = smu.unit_id where smu.id = trainings.student_modality_unit_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy trainings_delete_org on public.trainings for delete to authenticated using (exists (select 1 from public.student_modality_units smu join public.units u on u.id = smu.unit_id where smu.id = trainings.student_modality_unit_id and u.organization_id = (select private.current_user_organization_id())))';

  execute 'create policy training_exercises_select_org on public.training_exercises for select to authenticated using (exists (select 1 from public.trainings t join public.student_modality_units smu on smu.id = t.student_modality_unit_id join public.units u on u.id = smu.unit_id where t.id = training_exercises.training_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy training_exercises_insert_org on public.training_exercises for insert to authenticated with check (exists (select 1 from public.trainings t join public.student_modality_units smu on smu.id = t.student_modality_unit_id join public.units u on u.id = smu.unit_id where t.id = training_exercises.training_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy training_exercises_update_org on public.training_exercises for update to authenticated using (exists (select 1 from public.trainings t join public.student_modality_units smu on smu.id = t.student_modality_unit_id join public.units u on u.id = smu.unit_id where t.id = training_exercises.training_id and u.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.trainings t join public.student_modality_units smu on smu.id = t.student_modality_unit_id join public.units u on u.id = smu.unit_id where t.id = training_exercises.training_id and u.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy training_exercises_delete_org on public.training_exercises for delete to authenticated using (exists (select 1 from public.trainings t join public.student_modality_units smu on smu.id = t.student_modality_unit_id join public.units u on u.id = smu.unit_id where t.id = training_exercises.training_id and u.organization_id = (select private.current_user_organization_id())))';

  execute 'create policy evaluation_results_select_org on public.evaluation_results for select to authenticated using (exists (select 1 from public.evaluations e where e.id = evaluation_results.evaluation_id and e.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy evaluation_results_insert_org on public.evaluation_results for insert to authenticated with check (exists (select 1 from public.evaluations e where e.id = evaluation_results.evaluation_id and e.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy evaluation_results_update_org on public.evaluation_results for update to authenticated using (exists (select 1 from public.evaluations e where e.id = evaluation_results.evaluation_id and e.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.evaluations e where e.id = evaluation_results.evaluation_id and e.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy evaluation_results_delete_org on public.evaluation_results for delete to authenticated using (exists (select 1 from public.evaluations e where e.id = evaluation_results.evaluation_id and e.organization_id = (select private.current_user_organization_id())))';

  execute 'create policy payments_select_org on public.payments for select to authenticated using (exists (select 1 from public.charges c where c.id = payments.charge_id and c.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy payments_insert_org on public.payments for insert to authenticated with check (exists (select 1 from public.charges c where c.id = payments.charge_id and c.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy payments_update_org on public.payments for update to authenticated using (exists (select 1 from public.charges c where c.id = payments.charge_id and c.organization_id = (select private.current_user_organization_id()))) with check (exists (select 1 from public.charges c where c.id = payments.charge_id and c.organization_id = (select private.current_user_organization_id())))';
  execute 'create policy payments_delete_org on public.payments for delete to authenticated using (exists (select 1 from public.charges c where c.id = payments.charge_id and c.organization_id = (select private.current_user_organization_id())))';
end;
$$;
