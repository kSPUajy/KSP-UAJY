import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { Badge } from '@/components/ui/Badge'
import { DitherImage } from '@/components/ui/DitherImage'
import { requireProfile } from '@/lib/auth/session'
import { getTentors } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { PORTRAIT } from '@/lib/types'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Tentor — Admin',
  description: 'Profil publik tentor.',
  path: '/admin/tentor',
  noindex: true,
})

export default async function AdminTentorPage() {
  await requireProfile('/admin/tentor', ['admin'])
  const tentors = await getTentors({ semua: true })

  return (
    <>
      <AdminHeading
        command="ls -l ~/tentor"
        title="Tentor"
        description="Daftar ini terisi sendiri: setiap akun tentor, dan setiap akun yang ditugaskan ke modul. Di sini kamu hanya melengkapi profil publiknya — foto, bio, keahlian — atau menyembunyikannya dari situs."
      />
      <ol className="mt-8 border-t-2 border-line">
        {tentors.map((tentor) => (
          <li key={tentor.id} className="border-b-2 border-line">
            <Link
              href={`/admin/tentor/${tentor.id}`}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3 py-3 transition-colors hover:bg-surface-2"
            >
              <DitherImage
                src={tentor.foto}
                alt=""
                width={PORTRAIT.width}
                height={PORTRAIT.height}
                sizes="40px"
                treatment={tentor.punyaFoto ? 'none' : 'full'}
                className="aspect-[4/5] w-10"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-fg">{tentor.nama}</span>
                <span className="mt-0.5 block truncate text-[11px] text-dim">
                  {tentor.modul.length > 0
                    ? tentor.modul.map((modul) => `M${pad2(modul.minggu)} ${modul.judul}`).join(' · ')
                    : 'belum ditugaskan ke modul'}
                </span>
              </span>
              <span className="flex flex-wrap justify-end gap-2">
                {tentor.tampil ? null : (
                  <Badge size="sm" variant="solid" accent="amber">
                    tersembunyi
                  </Badge>
                )}
                <Badge size="sm" variant="ghost">
                  {tentor.punyaFoto && tentor.bio ? 'lengkap' : tentor.punyaFoto || tentor.bio ? 'sebagian' : 'kosong'}
                </Badge>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-dim">
        Menambah tentor: buat akunnya di anggota (peran tentor), atau tugaskan akunnya ke modul di menu modul.
      </p>
    </>
  )
}
