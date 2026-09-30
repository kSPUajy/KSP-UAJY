-- Registration per class. KSP runs four classes, the cartridges on the home
-- page. Each has one switch that an admin flips, and optionally the link to
-- its own sign-up form. The site only announces which classes are taking
-- sign-ups. There are no dates, so a class stays open until it is switched
-- off.
--
-- This replaces the dated rounds in registration_rounds. The site no longer
-- reads that table; it is kept only as history.

create table public.registration_tracks (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nama text not null,
  -- Shelf order, the same as the cartridges on the home page.
  urutan integer not null unique,
  buka boolean not null default false,
  link text check (link is null or link ~ '^https://'),
  updated_at timestamptz not null default now()
);

create trigger registration_tracks_touch before update on public.registration_tracks
  for each row execute function public.touch_updated_at();

alter table public.registration_tracks enable row level security;

create policy "registration_tracks: public read" on public.registration_tracks
  for select to anon, authenticated using (true);
-- Admins flip the switches and set the links. The four classes themselves
-- are fixed, so there are no inserts or deletes.
create policy "registration_tracks: admin update" on public.registration_tracks
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.registration_tracks to anon, authenticated;
grant update (buka, link) on public.registration_tracks to authenticated;

-- C closed on 11 September. Blockchain Dev Class takes sign-ups from
-- 30 September to 9 October, through the form behind the poster's QR code.
insert into public.registration_tracks (id, nama, urutan, buka, link) values
  ('c', 'Bahasa C', 1, false, null),
  ('blockchain', 'Blockchain', 2, true, 'https://tr.ee/UxnM5qKKQ6qL'),
  ('ml', 'Machine Learning', 3, false, null),
  ('java', 'Java', 4, false, null);
