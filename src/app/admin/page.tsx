import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { requireProfile } from '@/lib/auth/session'
import { getModules, getRegistration } from '@/lib/data'
import { formatTanggal } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Admin',
  description: 'Panel admin Kelompok Studi Pemrograman.',
  path: '/admin',
  noindex: true,
})

/** Counts that tell an admin whether anything needs doing this week. */
export default async function AdminPage() {
  await requireProfile('/admin', ['admin'])
  const db = await createSupabaseServer()

  const [modules, registration, members, drafts, submissions] = await Promise.all([
    getModules(),
    getRegistration(),
    db.from('profiles').select('role, must_change_password'),
    db.from('news_posts').select('id', { count: 'exact', head: true }).eq('published', false),
    db.from('submissions').select('module_id, nilai'),
  ])

  const current = modules.find((modul) => modul.status === 'berjalan')
  const people = members.data ?? []
  const waiting = people.filter((person) => person.must_change_password).length
  const thisWeek = (submissions.data ?? []).filter((row) => row.module_id === current?.id)
  const ungraded = (submissions.data ?? []).filter((row) => row.nilai === null).length

  const cards = [
    {
      href: '/admin/anggota',
      label: 'anggota',
      value: people.filter((person) => person.role === 'anggota').length,
      note: `${people.filter((person) => person.role !== 'anggota').length} tentor/admin · ${waiting} belum login pertama`,
    },
    {
      href: '/admin/modul',
      label: 'modul minggu ini',
      value: current ? pad2(current.minggu) : '—',
      note: current ? `${current.judul} · ${thisWeek.length} tugas masuk` : 'tidak ada modul berjalan',
    },
    { href: '/penilaian', label: 'belum dinilai', value: ungraded, note: 'tugas guided menunggu tentor' },
    { href: '/admin/berita', label: 'draf berita', value: drafts.count ?? 0, note: 'belum diterbitkan' },
    {
      href: '/admin/pendaftaran',
      label: 'pendaftaran',
      value: registration.status === 'buka' ? 'buka' : registration.status === 'segera' ? 'segera' : 'tutup',
      note: registration.tutup ? `gelombang terakhir tutup ${formatTanggal(registration.tutup)}` : 'belum ada gelombang',
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
    </>
  )
}
