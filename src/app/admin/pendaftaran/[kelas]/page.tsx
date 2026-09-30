import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { KelasPageForm } from '@/components/admin/pendaftaran/TrackControls'
import { KELAS_C, pendaftaranHref } from '@/components/sections/gabung/Registration'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Halaman kelas — Admin',
  description: 'Isi halaman pendaftaran satu kelas.',
  path: '/admin/pendaftaran',
  noindex: true,
})

export default async function AdminHalamanKelasPage({ params }: { params: Promise<{ kelas: string }> }) {
  const { kelas } = await params
  await requireProfile(`/admin/pendaftaran/${kelas}`, ['admin'])
  // C's page is /gabung, written in code: nothing to edit here.
  if (kelas === KELAS_C) redirect('/admin/pendaftaran')

  // Read fresh under the admin's session, never from the public cache.
  const db = await createSupabaseServer()
  const { data: track } = await db
    .from('registration_tracks')
    .select('id, nama, ringkasan, syarat, isi_mdx, poster')
    .eq('id', kelas)
    .maybeSingle()
  if (!track) notFound()

  return (
    <>
      <Link href="/admin/pendaftaran" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-4">
        <AdminHeading
          command={`vim ~/gabung/${track.id}.md`}
          title={`Halaman kelas ${track.nama}`}
          description={`Isi halaman ${pendaftaranHref(track.id)}. Status dan tombol daftarnya mengikuti saklar dan tautan formulir di halaman pendaftaran.`}
          actions={
            <Link href={pendaftaranHref(track.id)} className="text-xs text-accent-fg underline underline-offset-4">
              lihat di situs ↗
            </Link>
          }
        />
      </div>
      <div className="mt-8 max-w-4xl">
        <KelasPageForm
          initial={{
            id: track.id,
            ringkasan: track.ringkasan,
            syarat: track.syarat,
            isiMdx: track.isi_mdx,
            poster: track.poster,
          }}
        />
      </div>
    </>
  )
}
