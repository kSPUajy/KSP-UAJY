import type { Metadata } from 'next'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { EditRoundForm, NewRoundForm } from '@/components/admin/pendaftaran/RoundForms'
import { RegistrationStatusLine } from '@/components/sections/gabung/Registration'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { getRegistration } from '@/lib/data'
import { addDays, formatTanggalWaktu, toWib } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { wallClock } from '@/lib/supabase/rows'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Pendaftaran — Admin',
  description: 'Buka dan tutup gelombang pendaftaran.',
  path: '/admin/pendaftaran',
  noindex: true,
})

export default async function AdminPendaftaranPage() {
  await requireProfile('/admin/pendaftaran', ['admin'])
  const db = await createSupabaseServer()
  const [registration, { data: rounds }] = await Promise.all([
    getRegistration(),
    db.from('registration_rounds').select('id, buka, tutup').order('buka', { ascending: false }),
  ])

  const [latest, ...history] = rounds ?? []
  const today = toWib(new Date().toISOString()).slice(0, 10)

  return (
    <>
      <AdminHeading
        command="systemctl status pendaftaran"
        title="Pendaftaran"
        description="Gelombang yang dipakai situs adalah yang tanggal bukanya paling baru. Tombol daftar di beranda dan /gabung mengikuti statusnya secara otomatis."
      />

      <RegistrationStatusLine registration={registration} className="mt-8 max-w-prose" />

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {latest ? (
          <TerminalWindow title="~/admin/pendaftaran/gelombang-terakhir" tone="canvas" shadow={false}>
            <h2 className="mb-5 text-sm font-bold text-fg">Gelombang terakhir</h2>
            <EditRoundForm
              id={latest.id}
              buka={wallClock(latest.buka)}
              tutup={wallClock(latest.tutup)}
              running={registration.status === 'buka' || registration.status === 'segera'}
            />
          </TerminalWindow>
        ) : null}
        <TerminalWindow title="~/admin/pendaftaran/baru" tone="canvas" shadow={false}>
          <h2 className="mb-5 text-sm font-bold text-fg">Gelombang baru</h2>
          <NewRoundForm suggestBuka={`${today}T08:00`} suggestTutup={`${addDays(today, 14)}T23:59`} />
        </TerminalWindow>
      </div>

      {history.length > 0 ? (
        <section aria-labelledby="riwayat" className="mt-12">
          <h2 id="riwayat" className="text-[11px] tracking-[0.12em] text-dim uppercase">
            {'// riwayat'}
          </h2>
          <ul className="mt-3 border-t-2 border-line-soft text-[12px] leading-6">
            {history.map((round) => (
              <li key={round.id} className="border-b-2 border-line-soft px-3 py-2.5 text-muted">
                {formatTanggalWaktu(wallClock(round.buka))} <span className="text-dim">→</span>{' '}
                {formatTanggalWaktu(wallClock(round.tutup))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
