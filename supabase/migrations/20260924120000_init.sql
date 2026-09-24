-- =====================================================================
-- KSP — initial schema
--
-- Conventions
--   * Wall-clock times (deadlines, releases, registration windows) are
--     `timestamp without time zone` and always mean campus time, WIB.
--     That is the convention the site already uses everywhere, and it
--     keeps "Minggu 23.59" meaning 23.59 no matter where the server is.
--   * Ids of content rows are short readable text (`mod-01`, `n-08`),
--     carried over from the file-based seed data.
--   * Every table has row-level security on. The public (anon) can read
--     what the website shows; only admins can write, and admin writes go
--     through a signed-in session, so RLS is the one gate.
-- =====================================================================

-- ------------------------------------------------------------ roles ---

create type public.app_role as enum ('anggota', 'tentor', 'admin');

-- One row per account. Sign-in is by NPM: the auth user's email is a
-- synthetic `<npm>@anggota.ksp` address the app derives from the NPM, so
-- the NPM here is the thing people actually type.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  npm text not null unique check (npm ~ '^[0-9]{6,15}$'),
  nama text not null check (length(trim(nama)) > 0),
  angkatan integer check (angkatan between 2000 and 2100),
  role public.app_role not null default 'anggota',
  -- Accounts are created by an admin with a generated password; the
  -- member has to replace it on first sign-in.
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

-- Role lookups for policies. SECURITY DEFINER so a policy on `profiles`
-- can read `profiles` without recursing into its own policy.
create function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role in ('admin', 'tentor') from public.profiles where id = auth.uid()), false)
$$;

alter table public.profiles enable row level security;

-- Members see themselves; staff see everyone. Nobody writes through the
-- API: accounts, roles and the password flag are changed server-side with
-- the secret key, so a member can never promote themselves.
create policy "profiles: read own, staff read all"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

-- ------------------------------------------------------- touch trigger ---

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------ modules ---

create table public.modules (
  id text primary key,
  minggu integer not null unique check (minggu > 0),
  judul text not null,
  -- The Monday the module is handed out.
  rilis date not null,
  -- Names as printed in the schedule; linking them to tentor accounts is a
  -- later phase.
  tentor_pj text[] not null default '{}',
  koordinator text not null default '',
  ringkasan text not null default '',
  berkas_url text,
  -- Deadline for the week's guided task. Null means the default: Sunday
  -- 23.59 of the module's week.
  tenggat timestamp,
  tugas_deskripsi text not null default '',
  updated_at timestamptz not null default now()
);

create trigger modules_touch before update on public.modules
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------- news ---

create table public.news_posts (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  judul text not null,
  tanggal date not null,
  kategori text not null check (kategori in ('pengumuman', 'liputan', 'tutorial', 'prestasi')),
  cover text not null,
  excerpt text not null,
  penulis text not null,
  body_mdx text not null,
  tags text[] not null default '{}',
  -- Drafts stay invisible to the public until an admin publishes them.
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create index news_posts_tanggal_idx on public.news_posts (tanggal desc);

create trigger news_posts_touch before update on public.news_posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------- challenges ---

create table public.challenges (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  minggu integer not null unique check (minggu > 0),
  judul text not null,
  tanggal_rilis date not null,
  deadline timestamp not null,
  difficulty text not null check (difficulty in ('MUDAH', 'SEDANG', 'SULIT', 'SEGFAULT')),
  topik text[] not null default '{}',
  deskripsi_mdx text not null,
  constraints text[] not null default '{}',
  -- [{ "input": "...", "output": "...", "penjelasan": "..." }, ...]
  sample_io jsonb not null default '[]'::jsonb check (jsonb_typeof(sample_io) = 'array'),
  hint_terkunci text[] not null default '{}',
  total_peserta integer not null default 0 check (total_peserta >= 0),
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create trigger challenges_touch before update on public.challenges
  for each row execute function public.touch_updated_at();

-- One winner per challenge. The challenge's winner is found from here,
-- never stored on the challenge, so the two can never disagree.
create table public.winners (
  id text primary key,
  -- Identifies the person; repeats across their wins.
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nama text not null,
  foto text not null,
  angkatan integer not null,
  challenge_id text not null unique references public.challenges (id) on delete cascade,
  minggu integer not null,
  waktu_submit timestamp not null,
  runtime_ms integer check (runtime_ms >= 0),
  pendekatan text not null,
  kode_solusi text not null,
  quote text not null,
  -- All-time count, including seasons not published on the site.
  total_menang integer not null check (total_menang > 0),
  updated_at timestamptz not null default now()
);

create index winners_slug_idx on public.winners (slug);

create trigger winners_touch before update on public.winners
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------- registration ---

-- One row per round. The current round is the one that opened most
-- recently; old rounds stay as history.
create table public.registration_rounds (
  id bigint generated always as identity primary key,
  buka timestamp not null,
  tutup timestamp not null,
  created_at timestamptz not null default now(),
  check (tutup > buka)
);

create index registration_rounds_buka_idx on public.registration_rounds (buka desc);

-- -------------------------------------------------------------- access ---

alter table public.modules enable row level security;
alter table public.news_posts enable row level security;
alter table public.challenges enable row level security;
alter table public.winners enable row level security;
alter table public.registration_rounds enable row level security;

create policy "modules: public read" on public.modules
  for select to anon, authenticated using (true);
create policy "modules: admin write" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "news: public reads published" on public.news_posts
  for select to anon, authenticated using (published or public.is_admin());
create policy "news: admin write" on public.news_posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "challenges: public read" on public.challenges
  for select to anon, authenticated using (true);
create policy "challenges: admin write" on public.challenges
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "winners: public read" on public.winners
  for select to anon, authenticated using (true);
create policy "winners: admin write" on public.winners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "registration: public read" on public.registration_rounds
  for select to anon, authenticated using (true);
create policy "registration: admin write" on public.registration_rounds
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Explicit grants: newer Supabase projects no longer expose new tables to
-- the Data API automatically. RLS above still decides row by row.
grant usage on schema public to anon, authenticated;
grant select on public.modules, public.news_posts, public.challenges, public.winners, public.registration_rounds
  to anon, authenticated;
grant insert, update, delete on public.modules, public.news_posts, public.challenges, public.winners, public.registration_rounds
  to authenticated;
grant select on public.profiles to authenticated;
grant execute on function public.current_app_role(), public.is_admin(), public.is_staff() to anon, authenticated;
