import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { BulkPhotoUpload } from '@/components/admin/galeri/BulkPhotoUpload'
import { ButtonLink } from '@/components/ui/Button'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { formatTanggalPendek } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Galeri — Admin',
  description: 'Kelola galeri dokumentasi.',
  path: '/admin/galeri',
  noindex: true,
})

export default async function AdminGaleriPage() {
  await requireProfile('/admin/galeri', ['admin'])
  const db = await createSupabaseServer()
  const { data, error } = await db
    .from('gallery_items')
    .select('id, src, alt, caption, tanggal, kategori, type')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Gagal membaca galeri: ${error.message}`)

  return (
    <>
      <AdminHeading
        command="ls ~/galeri"
        title="Galeri"
        description="Foto diperkecil otomatis sebelum diunggah, jadi foto langsung dari HP pun aman. Semua perubahan langsung tampil di /galeri dan beranda."
        actions={
          <ButtonLink href="/admin/galeri/baru" variant="outline" size="sm">
            tambah video / satu foto
          </ButtonLink>
        }
      />

      <TerminalWindow title="~/galeri/unggah" tone="canvas" shadow={false} className="mt-8">
        <h2 className="mb-5 text-sm font-bold text-fg">Unggah foto kegiatan</h2>
        <BulkPhotoUpload />
      </TerminalWindow>

      <section aria-labelledby="daftar-galeri" className="mt-12">
        <h2 id="daftar-galeri" className="text-[11px] tracking-[0.12em] text-dim uppercase">
          {`// ${data.length} item`}
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/galeri/${item.id}`}
                className="group block border-2 border-line-soft bg-surface transition-colors hover:border-accent focus-visible:border-accent"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-surface-2">
                  <Image src={item.src} alt="" fill sizes="(min-width: 1024px) 18vw, 45vw" className="object-cover" />
                  {item.type === 'video' ? (
                    <span className="absolute top-1.5 left-1.5 bg-canvas px-1.5 text-[10px] tracking-[0.1em] text-accent-fg uppercase">video</span>
                  ) : null}
                </span>
                <span className="block p-2">
                  <span className="block truncate text-[12px] text-fg group-hover:text-accent-fg">{item.caption || item.alt}</span>
                  <span className="mt-0.5 block text-[10px] text-dim">
                    {formatTanggalPendek(item.tanggal)} · {item.kategori}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
