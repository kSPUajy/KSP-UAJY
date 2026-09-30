-- An announcement's last valid day (WIB, inclusive). Until then it leads the
-- home page's front page; after it, the home page leaves it out and it lives
-- on only in the archive. Null means no end: the announcement is dealt at
-- random like any other story. Other categories keep it null.

alter table public.news_posts add column berlaku_sampai date;

-- Registration closed on 11 September.
update public.news_posts set berlaku_sampai = '2026-09-11' where slug = 'pendaftaran-anggota-baru-2026';
-- Blockchain Dev Class registration runs until 9 October.
update public.news_posts set berlaku_sampai = '2026-10-09' where slug = 'blockchain-dev-class-dibuka';
