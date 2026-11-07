-- Unguided tasks are handed in too (2026-11-07). They share the guided
-- task's table, bucket, file checks and grading; `jenis` tells them apart,
-- and a member has at most one of each per module. Unguided has no
-- deadline: it is taken while the module's unguided switch is on, and is
-- never late.
--
-- The old one-per-(module, user) constraint stays until the app that writes
-- `jenis` is live, because the app before it upserts on exactly that pair.
-- It is dropped in the next migration.

alter table public.submissions
  add column jenis text not null default 'guided' check (jenis in ('guided', 'unguided')),
  add constraint submissions_module_id_user_id_jenis_key unique (module_id, user_id, jenis);
