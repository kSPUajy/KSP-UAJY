-- =====================================================================
-- Guided tasks: one submission per member per module.
--
-- Files live in the private `tugas` bucket. Members never write to the
-- table or the bucket through the API: the server hands out a one-time
-- signed upload URL, checks the uploaded file, and records the row with the
-- secret key. That keeps `terlambat` and the grade fields trustworthy —
-- a member cannot mark their own late work as on time, or grade it.
-- =====================================================================

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  module_id text not null references public.modules (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- `<user id>/<module id>/<random>.<ext>` inside the `tugas` bucket.
  storage_path text not null unique,
  -- What the member called it, for display and download.
  file_name text not null check (length(file_name) between 1 and 160),
  file_size integer not null check (file_size > 0 and file_size <= 5242880),
  file_kind text not null check (file_kind in ('c', 'zip')),
  submitted_at timestamptz not null default now(),
  -- Decided by the server at the moment of submission, against the
  -- module's deadline (WIB).
  terlambat boolean not null default false,
  -- Grading (phase C5). A graded submission is locked: no resubmission.
  nilai integer check (nilai between 0 and 100),
  komentar text,
  dinilai_oleh uuid references public.profiles (id) on delete set null,
  dinilai_at timestamptz,
  -- A member has one submission per module; resubmitting replaces it.
  unique (module_id, user_id)
);

create index submissions_user_idx on public.submissions (user_id);
create index submissions_module_idx on public.submissions (module_id);

alter table public.submissions enable row level security;

-- Members read their own; tentors and admins read all. No write policies:
-- every write goes through the server with the secret key.
create policy "submissions: read own, staff read all"
  on public.submissions for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff());

grant select on public.submissions to authenticated;

-- ------------------------------------------------------------- storage ---

-- Private bucket, 5 MB per object. No storage policies for members: uploads
-- use signed upload URLs issued by the server, downloads use short-lived
-- signed URLs issued after an ownership check.
insert into storage.buckets (id, name, public, file_size_limit)
values ('tugas', 'tugas', false, 5242880)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
