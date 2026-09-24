-- =====================================================================
-- Grading: which tentor grades which module, and who may read what.
-- =====================================================================

-- A tentor account assigned to a module. `modules.tentor_pj` stays as the
-- display text on the public site; this is the permission.
create table public.module_tentors (
  module_id text not null references public.modules (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (module_id, profile_id)
);

create index module_tentors_profile_idx on public.module_tentors (profile_id);

alter table public.module_tentors enable row level security;

create policy "module_tentors: read own, admin read all"
  on public.module_tentors for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "module_tentors: admin write"
  on public.module_tentors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.module_tentors to authenticated;

-- Admins grade everything; a tentor grades the modules assigned to them.
create function public.can_grade(target_module text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
    or exists (
      select 1 from public.module_tentors
      where module_id = target_module and profile_id = auth.uid()
    )
$$;

grant execute on function public.can_grade(text) to authenticated;

-- Narrow submission reads: a member sees their own; a tentor only sees the
-- modules they grade (was: every staff member saw everything).
drop policy "submissions: read own, staff read all" on public.submissions;

create policy "submissions: read own, graders read theirs"
  on public.submissions for select
  to authenticated
  using (user_id = auth.uid() or public.can_grade(module_id));

-- The grader's name, stamped when grading. Members cannot read other
-- profiles, so the name is copied here for their dashboard.
alter table public.submissions add column penilai text;
