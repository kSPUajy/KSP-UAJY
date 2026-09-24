-- =====================================================================
-- Public tentor profiles.
--
-- Who is a tentor is not stored here: it is every account with the
-- `tentor` role or assigned to at least one module (`module_tentors`), so a
-- new tentor appears on the site the moment their account or assignment
-- exists. This table only holds the optional public extras an admin fills
-- in — photo, skills, bio — and whether the profile is shown at all.
-- =====================================================================

create table public.tentor_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  -- Public URL in the `media` bucket; null shows generated initials.
  foto text check (foto is null or foto ~ '^https://'),
  keahlian text[] not null default '{}',
  bio text not null default '',
  quote text not null default '',
  -- [{ "tahun": "2025", "judul": "…", "deskripsi": "…" }]
  pengalaman jsonb not null default '[]' check (jsonb_typeof(pengalaman) = 'array'),
  snippet_judul text,
  snippet_code text,
  -- { "github": "https://…", "instagram": "…", "linkedin": "…" }
  socials jsonb not null default '{}' check (jsonb_typeof(socials) = 'object'),
  tampil boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.tentor_profiles enable row level security;

create policy "tentor_profiles: public read" on public.tentor_profiles
  for select to anon, authenticated using (true);

create policy "tentor_profiles: admin write" on public.tentor_profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.tentor_profiles to anon, authenticated;
grant insert, update, delete on public.tentor_profiles to authenticated;
