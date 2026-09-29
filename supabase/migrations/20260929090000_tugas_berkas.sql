-- Task files beside the module file: the guided task's sheet and the
-- unguided task, each a PDF or a ZIP.
--
-- The module file and the guided task are public: they sit in the public
-- `modul` bucket and can be downloaded any week, past or upcoming.
--
-- The unguided task stays locked until an admin switches it on. Its file
-- lives in the private `modul-privat` bucket, which has no storage policies
-- at all: the only way to it is a short-lived signed URL that the server
-- hands out from `/modul/<id>/tugas-unguided`, after reading
-- `tugas_unguided_terbuka` fresh (admins and tentors may preview it while it
-- is locked). The object path in `tugas_unguided_path` is no secret on its
-- own — without a signed URL it opens nothing.

alter table public.modules
  add column tugas_guided_url text check (tugas_guided_url is null or tugas_guided_url ~ '^https://'),
  add column tugas_unguided_path text check (tugas_unguided_path is null or tugas_unguided_path ~ '^unguided/[0-9a-f-]{36}\.(pdf|zip)$'),
  add column tugas_unguided_terbuka boolean not null default false;

-- The public bucket now takes ZIPs too (the admin form sends `application/zip`).
update storage.buckets
  set allowed_mime_types = array['application/pdf', 'application/zip']
  where id = 'modul';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('modul-privat', 'modul-privat', false, 20971520, array['application/pdf', 'application/zip'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
