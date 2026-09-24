import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { ChallengeForm } from '@/components/admin/challenge/ChallengeForm'
import { requireProfile } from '@/lib/auth/session'
import { getChallenges } from '@/lib/data'
import { addDays } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Soal baru — Admin',
  description: 'Tambah challenge mingguan.',
  path: '/admin/challenge/baru',
  noindex: true,
})

/** Suggests the next week: released the Monday after the last one, due that Sunday 23.59. */
export default async function AdminChallengeBaruPage() {
  await requireProfile('/admin/challenge/baru', ['admin'])
  const [latest] = await getChallenges()
  const rilis = latest ? addDays(latest.tanggalRilis, 7) : undefined

  return (
    <>
      <Link href="/admin/challenge" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading command="touch ~/challenge/baru" title="Soal baru" />
      </div>
      <div className="mt-8 max-w-4xl">
        <ChallengeForm
          initial={{
            minggu: latest ? latest.minggu + 1 : 1,
            tanggalRilis: rilis,
            deadline: rilis ? `${addDays(rilis, 6)}T23:59` : undefined,
          }}
        />
      </div>
    </>
  )
}
