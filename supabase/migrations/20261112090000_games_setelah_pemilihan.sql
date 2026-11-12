-- Pengurus moved Games from after Prosedur 1 to right after Pemilihan: it
-- took Perulangan 1's class week (9 Nov). Perulangan 1, Perulangan 2 and
-- Prosedur 1 each shift one week later into the next slot, and Prosedur 1
-- takes Games' old week (30 Nov). Everything from Review Materi on stays.
-- Challenges follow their module's class Monday, due that Sunday.

update public.sesi
set rilis = '2026-11-09',
    ringkasan = 'Sesi santai setelah materi Pemilihan: permainan dan kuis seputar materi yang sudah dipelajari. Tanpa modul dan tanpa tugas.'
where id = 'sesi-games';

update public.modules set rilis = rilis + 7 where id in ('mod-05', 'mod-06', 'mod-07');

update public.challenges
set tanggal_rilis = tanggal_rilis + 7, deadline = deadline + interval '7 days'
where id in ('c-05', 'c-06', 'c-07');

-- The guided task of Perulangan 1 is now due at its new class, Mon 16 Nov 19.00 WIB.
update public.submissions
set terlambat = submitted_at > timestamptz '2026-11-16 19:00:00+07'
where module_id = 'mod-05' and jenis = 'guided';
