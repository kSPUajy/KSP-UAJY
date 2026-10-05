import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { RosterGroup } from '@/components/penilaian/RosterGroup'
import { PENERBIT, requireProfile } from '@/lib/auth/session'
import { getModules, getRegistration } from '@/lib/data'
import { formatTanggalWaktu } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getRoster } from '@/lib/tugas/grading'
import { effectiveDeadline } from '@/lib/tugas/rules'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Admin',
  description: 'Panel admin Kelompok Studi Pemrograman.',
  path: '/admin',
  noindex: true,
})

/**
 * Counts that tell an admin whether anything needs doing this week, then who
 * has handed in the guided task and who has not. Kominfo starts at the news.
 */
export default async function AdminPage() {
  const profile = await requireProfile('/admin', PENERBIT)
  if (profile.role !== 'admin') redirect('/admin/berita')
  const db = await createSupabaseServer()

  const [modules, registration, members, drafts, submissions, feedback] = await Promise.all([
    getModules(),
    getRegistration(),
    db.from('profiles').select('role, must_change_password'),
    db.from('news_posts').select('id', { count: 'exact', head: true }).eq('published', false),
    db.from('submissions').select('module_id, nilai'),
    db.from('feedback').select('id', { count: 'exact', head: true }).eq('dibaca', false),
  ])

  const current = modules.find((modul) => modul.status === 'berjalan')
  const people = members.data ?? []
  const waiting = people.filter((person) => person.must_change_password).length
  const thisWeek = (submissions.data ?? []).filter((row) => row.module_id === current?.id)
  const ungraded = (submissions.data ?? []).filter((row) => row.nilai === null).length

  // The task to watch: this week's, or between class weeks the last one out.
  const watched = current ?? modules.filter((modul) => modul.status === 'selesai').at(-1)
  const roster = watched ? await getRoster(watched.id) : null
  const handedIn = (roster ?? []).filter((row) => row.submission)
  const missing = (roster ?? []).filter((row) => !row.submission)

  const cards = [
    {
      href: '/admin/anggota',
      label: 'anggota',
      value: people.filter((person) => person.role === 'anggota').length,
      note: `${people.filter((person) => person.role !== 'anggota').length} tentor/admin/kominfo · ${waiting} belum login pertama`,
    },
    {
      href: '/admin/modul',
      label: 'modul minggu ini',
      value: current ? pad2(current.minggu) : '—',
      note: current ? `${current.judul} · ${thisWeek.length} tugas masuk` : 'tidak ada modul berjalan',
    },
    { href: '/penilaian', label: 'belum dinilai', value: ungraded, note: 'tugas guided menunggu tentor' },
    { href: '/admin/masukan', label: 'masukan baru', value: feedback.count ?? 0, note: 'kritik & saran belum dibaca' },
    { href: '/admin/berita', label: 'draf berita', value: drafts.count ?? 0, note: 'belum diterbitkan' },
    {
      href: '/admin/pendaftaran',
      label: 'pendaftaran',
      value: registration.open.length > 0 ? `${registration.open.length} buka` : 'tutup',
      note:
        registration.open.length > 0
          ? registration.open.map((track) => track.nama).join(', ')
          : 'tidak ada pendaftaran yang sedang dibuka',
    },
  ]

  return (
    <>
      <AdminHeading
        command="uptime"
        title="Ringkasan"
        description="Setiap perubahan di panel ini langsung terlihat di situs publik."
      />
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className="block h-full border-2 border-line bg-surface p-5 press-in hard-shadow">
              <span className="block text-[10px] tracking-[0.12em] text-dim uppercase">{card.label}</span>
              <span className="mt-3 block font-display text-3xl leading-none text-accent-fg tabular-nums">{card.value}</span>
              <span className="mt-3 block text-[12px] leading-5 text-muted">{card.note}</span>
            </Link>
          </li>
        ))}
      </ul>

      {watched && roster ? (
        <section aria-labelledby="pengumpulan" className="mt-14 max-w-5xl">
          <h2 id="pengumpulan" className="font-display text-[11px] tracking-[0.16em] text-accent-fg uppercase">
            {`// tugas guided · M${pad2(watched.minggu)} ${watched.judul}`}
          </h2>
          <p className="mt-3 max-w-prose text-[13px] leading-6 text-muted">
            {handedIn.length} dari {roster.length} anggota sudah mengumpulkan. Tenggat{' '}
            {formatTanggalWaktu(effectiveDeadline(watched))}.{' '}
            <Link href={`/penilaian/${watched.id}`} className="text-accent-fg underline underline-offset-4">
              buka di penilaian <span aria-hidden>-&gt;</span>
            </Link>
          </p>

          <RosterGroup
            heading="h3"
            id="sudah-mengumpulkan"
            title="sudah mengumpulkan"
            rows={handedIn}
            moduleId={watched.id}
            empty="Belum ada yang mengumpulkan."
            className="mt-8"
          />

          {missing.length > 0 ? (
            <details className="group mt-8 border-2 border-line-soft">
              <summary className="cursor-pointer list-none px-3 py-3 text-[11px] tracking-[0.12em] text-dim uppercase hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="mr-2 group-open:hidden">
                  +
                </span>
                <span aria-hidden className="mr-2 hidden text-accent-fg group-open:inline">
                  -
                </span>
                {`belum mengumpulkan (${missing.length})`}
              </summary>
              <ul className="grid grid-cols-1 gap-x-8 border-t-2 border-line-soft px-3 py-3 sm:grid-cols-2 xl:grid-cols-3">
                {missing.map((row) => (
                  <li key={row.profileId} className="flex min-w-0 gap-3 py-1 text-[12px]">
                    <span className="shrink-0 text-muted tabular-nums">{row.npm}</span>
                    <span className="min-w-0 truncate text-fg">{row.nama}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}
    </>
  )
}
