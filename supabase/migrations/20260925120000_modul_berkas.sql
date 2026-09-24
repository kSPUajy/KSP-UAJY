-- Module files (PDF) uploaded from the admin panel.
--
-- Public read: a released module is meant for everyone, and the site only
-- prints the link once the module's release date has passed. Object names
-- are random, so an unreleased file cannot be guessed. Uploads go through
-- signed upload URLs issued to admins; there are no write policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('modul', 'modul', true, 20971520, array['application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
