import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { BeritaForm } from '@/components/admin/berita/BeritaForm'
import { requireProfile } from '@/lib/auth/session'
import { toWib } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Tulis berita — Admin',
  description: 'Tulis berita baru.',
  path: '/admin/berita/baru',
  noindex: true,
})

export default async function AdminBeritaBaruPage() {
  const profile = await requireProfile('/admin/berita/baru', ['admin'])
  return (
    <>
      <Link href="/admin/berita" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading command="touch ~/berita/baru.md" title="Tulis berita" description="Tersimpan sebagai draf sampai kamu mencentang “terbitkan”." />
      </div>
      <div className="mt-8 max-w-4xl">
        <BeritaForm
          initial={{
            tanggal: toWib(new Date().toISOString()).slice(0, 10),
            penulis: profile.nama,
            published: false,
          }}
        />
      </div>
    </>
  )
}
