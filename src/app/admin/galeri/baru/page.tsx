import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { GaleriForm } from '@/components/admin/galeri/GaleriForm'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Tambah ke galeri — Admin',
  description: 'Tambah foto atau video ke galeri.',
  path: '/admin/galeri/baru',
  noindex: true,
})

export default async function AdminGaleriBaruPage() {
  await requireProfile('/admin/galeri/baru', ['admin'])
  return (
    <>
      <Link href="/admin/galeri" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading command="touch ~/galeri/baru" title="Tambah ke galeri" description="Untuk video, atau satu foto dengan deskripsi lengkap. Banyak foto sekaligus lebih cepat lewat halaman galeri." />
      </div>
      <TerminalWindow title="~/galeri/baru" tone="canvas" shadow={false} className="mt-8">
        <GaleriForm initial={{}} />
      </TerminalWindow>
    </>
  )
}
