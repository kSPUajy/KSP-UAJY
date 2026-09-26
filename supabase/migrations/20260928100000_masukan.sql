-- =====================================================================
-- Kritik dan saran from the home page.
--
-- Anyone may send one, name optional. Rows are written only by the
-- server action (secret key, after validation and a spam check), so there
-- is no public insert policy; admins read, mark and delete them.
-- =====================================================================

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  nama text check (nama is null or char_length(nama) between 1 and 80),
  kategori text not null check (kategori in ('kritik', 'saran', 'lainnya')),
  pesan text not null check (char_length(pesan) between 10 and 2000),
  dibaca boolean not null default false,
  created_at timestamptz not null default now()
);

create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

create policy "feedback: admin all" on public.feedback
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update, delete on public.feedback to authenticated;
