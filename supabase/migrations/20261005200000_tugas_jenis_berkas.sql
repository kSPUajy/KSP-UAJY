-- Guided tasks may be handed in as `.cpp`, `.rar` or `.pdf`, besides `.c`
-- and `.zip`. On the first real deadline (M03, 5 Oct 2026) members were
-- turned away in their browser: Dev-C++ saves a new source file as `.cpp`
-- unless told otherwise, and most of them archive with WinRAR.

alter table public.submissions
  drop constraint submissions_file_kind_check,
  add constraint submissions_file_kind_check check (file_kind in ('c', 'cpp', 'zip', 'rar', 'pdf'));
