-- Drops the old one-per-(module, user) rule, so a member can hand in both
-- the guided and the unguided task of one module. The new rule, one per
-- (module, user, jenis), came in the previous migration.
--
-- Applied only after the app that writes `jenis` was live: the app before it
-- upserts on (module_id, user_id), which needs this constraint.

alter table public.submissions drop constraint submissions_module_id_user_id_key;
