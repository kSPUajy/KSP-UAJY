-- Sessions on the tentoring schedule that are not modules — Games, Review
-- Materi — shown on the timeline, with no guided task and nothing to grade.
create table public.sesi (
  id text primary key,
  judul text not null check (length(trim(judul)) > 0),
  -- The day the session starts (usually the Monday of its week).
  rilis date not null,
  -- Who runs it, as printed on the schedule (e.g. "PH").
  pj text not null default '',
  ringkasan text not null default '',
  updated_at timestamptz not null default now()
);

create trigger sesi_touch before update on public.sesi
  for each row execute function public.touch_updated_at();

alter table public.sesi enable row level security;

create policy "sesi: public read" on public.sesi
  for select to anon, authenticated using (true);
create policy "sesi: admin write" on public.sesi
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.sesi to anon, authenticated;
grant insert, update, delete on public.sesi to authenticated;
