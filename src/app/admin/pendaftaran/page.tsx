import type { Metadata } from 'next'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { TrackLinkForm, TrackSwitch } from '@/components/admin/pendaftaran/TrackControls'
import { RegistrationStatusLine } from '@/components/sections/gabung/Registration'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Pendaftaran — Admin',
  description: 'Buka dan tutup pendaftaran tiap kelas.',
  path: '/admin/pendaftaran',
  noindex: true,
})

export default async function AdminPendaftaranPage() {
  await requireProfile('/admin/pendaftaran', ['admin'])
  // Read fresh under the admin's session, never from the public cache.
  const db = await createSupabaseServer()
  const { data: tracks, error } = await db.from('registration_tracks').select('id, nama, buka, link').order('urutan')
  if (error) throw new Error(`Gagal membaca pendaftaran: ${error.message}`)

  return (
    <>
      <AdminHeading
        command="systemctl status pendaftaran"
        title="Pendaftaran"
        description="Satu saklar untuk tiap kelas. Kelas yang dibuka langsung diumumkan di beranda dan /gabung, dengan tombol daftar kalau tautan formulirnya diisi. Tidak ada tanggal: kelas tetap dibuka sampai saklarnya dimatikan."
      />

      <RegistrationStatusLine registration={{ open: tracks.filter((track) => track.buka) }} className="mt-8 max-w-prose" />

      <ul className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {tracks.map((track) => (
          <li key={track.id}>
            <TerminalWindow title={`~/admin/pendaftaran/${track.id}`} tone="canvas" shadow={false}>
              <h2 className="mb-4 text-sm font-bold text-fg">Kelas {track.nama}</h2>
              <TrackSwitch id={track.id} nama={track.nama} initial={track.buka} />
              <TrackLinkForm id={track.id} initial={track.link} className="mt-6 border-t-2 border-line-soft pt-6" />
            </TerminalWindow>
          </li>
        ))}
      </ul>
    </>
  )
}
