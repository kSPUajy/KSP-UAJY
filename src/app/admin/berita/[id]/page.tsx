import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { BeritaForm, DeleteBeritaForm } from '@/components/admin/berita/BeritaForm'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Edit berita — Admin',
  description: 'Edit berita.',
  path: '/admin/berita',
  noindex: true,
})

export default async function AdminBeritaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireProfile(`/admin/berita/${id}`, ['admin'])
  const db = await createSupabaseServer()
  const { data: post } = await db.from('news_posts').select('*').eq('id', id).maybeSingle()
  if (!post) notFound()

  return (
    <>
      <Link href="/admin/berita" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading
          command={`vim ~/berita/${post.slug}.md`}
          title={post.judul}
          actions={
            post.published ? (
              <Link href={`/berita/${post.slug}`} className="text-xs text-accent-fg underline underline-offset-4">
                lihat di situs ↗
              </Link>
            ) : null
          }
        />
      </div>
      <div className="mt-8 max-w-4xl">
        <BeritaForm
          initial={{
            id: post.id,
            judul: post.judul,
            slug: post.slug,
            tanggal: post.tanggal,
            kategori: post.kategori,
            penulis: post.penulis,
            cover: post.cover,
            excerpt: post.excerpt,
            tags: post.tags,
            bodyMdx: post.body_mdx,
            published: post.published,
          }}
        />
      </div>
      <div className="mt-12 max-w-4xl">
        <TerminalWindow title="~/admin/berita/hapus" tone="canvas" shadow={false} accent="orange">
          <DeleteBeritaForm id={post.id} slug={post.slug} />
        </TerminalWindow>
      </div>
    </>
  )
}
