import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { requireProfile } from '@/lib/auth/session'
import { formatTanggalPendek } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Berita — Admin',
  description: 'Kelola berita.',
  path: '/admin/berita',
  noindex: true,
})

export default async function AdminBeritaPage() {
  await requireProfile('/admin/berita', ['admin'])
  const db = await createSupabaseServer()
  // The admin's session sees drafts too (RLS: published or is_admin).
  const { data, error } = await db
    .from('news_posts')
    .select('id, slug, judul, tanggal, kategori, penulis, published')
    .order('tanggal', { ascending: false })
  if (error) throw new Error(`Gagal membaca berita: ${error.message}`)

  return (
    <>
      <AdminHeading
        command="git log berita/"
        title="Berita"
        description="Draf hanya terlihat di panel ini. Berita yang diterbitkan langsung muncul di /berita dan beranda."
        actions={
          <ButtonLink href="/admin/berita/baru" size="sm">
            tulis berita
          </ButtonLink>
        }
      />
      <ol className="mt-8 border-t-2 border-line">
        {data.map((post) => (
          <li key={post.id} className="border-b-2 border-line">
            <Link
              href={`/admin/berita/${post.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3 py-3.5 transition-colors hover:bg-surface-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto_auto]"
            >
              <span className="text-[11px] text-dim tabular-nums">{formatTanggalPendek(post.tanggal)}</span>
              <span className="col-start-1 row-start-2 min-w-0 truncate text-sm font-bold text-fg sm:col-start-auto sm:row-start-auto">
                {post.judul}
              </span>
              <span className="text-[11px] text-muted">{post.kategori}</span>
              <Badge size="sm" variant={post.published ? 'ghost' : 'solid'} accent={post.published ? undefined : 'amber'}>
                {post.published ? 'terbit' : 'draf'}
              </Badge>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
