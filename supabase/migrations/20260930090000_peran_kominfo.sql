-- Kominfo, the communications division, gets its own role.
--
-- Kominfo accounts manage the news and the gallery from the admin panel,
-- and nothing else there; every other section stays admin-only. Like
-- tentors and admins, they hand in no guided tasks — handing in is for
-- anggota alone, which the dashboard's actions enforce.

alter type public.app_role add value if not exists 'kominfo';

-- Who may write news and gallery items: admins and Kominfo. The role is
-- compared as text, because a new enum value cannot be used as a literal
-- in the transaction that adds it.
create function public.can_publish()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role::text in ('admin', 'kominfo') from public.profiles where id = auth.uid()), false)
$$;

grant execute on function public.can_publish() to anon, authenticated;

-- Drafts are visible to whoever may publish them.
drop policy "news: public reads published" on public.news_posts;
drop policy "news: admin write" on public.news_posts;
create policy "news: public reads published" on public.news_posts
  for select to anon, authenticated using (published or public.can_publish());
create policy "news: publisher write" on public.news_posts
  for all to authenticated using (public.can_publish()) with check (public.can_publish());

drop policy "gallery: admin write" on public.gallery_items;
create policy "gallery: publisher write" on public.gallery_items
  for all to authenticated using (public.can_publish()) with check (public.can_publish());
