import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { ChallengeForm, DeleteChallengeForm, WinnerForm } from '@/components/admin/challenge/ChallengeForm'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { isChallengeClosed } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { toChallenge, toWinner } from '@/lib/supabase/rows'
import { createSupabaseServer } from '@/lib/supabase/server'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Edit challenge — Admin',
  description: 'Edit challenge mingguan.',
  path: '/admin/challenge',
  noindex: true,
})

export default async function AdminChallengeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireProfile(`/admin/challenge/${id}`, ['admin'])
  const db = await createSupabaseServer()
  const [{ data: row }, { data: winnerRow }] = await Promise.all([
    db.from('challenges').select('*, winners(id)').eq('id', id).maybeSingle(),
    db.from('winners').select('*').eq('challenge_id', id).maybeSingle(),
  ])
  if (!row) notFound()
  const challenge = toChallenge(row)
  const winner = winnerRow ? toWinner(winnerRow) : null
  const closed = isChallengeClosed(challenge)

  return (
    <>
      <Link href="/admin/challenge" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading
          command={`vim ~/challenge/minggu-${pad2(challenge.minggu)}/soal.md`}
          title={challenge.judul}
          actions={
            <Link href={`/challenge/${challenge.slug}`} className="text-xs text-accent-fg underline underline-offset-4">
              lihat di situs ↗
            </Link>
          }
        />
      </div>

      <div className="mt-8 max-w-4xl">
        <ChallengeForm initial={challenge} />
      </div>

      <section aria-labelledby="pemenang" className="mt-14 max-w-4xl">
        <h2 id="pemenang" className="font-display text-[11px] tracking-[0.16em] text-accent-fg uppercase">
          {'// pemenang'}
        </h2>
        <p className="mt-3 mb-6 max-w-prose text-[13px] leading-6 text-muted">
          {winner
            ? 'Pemenang minggu ini. Solusinya tampil di halaman soal setelah deadline, dan orangnya di hall of fame.'
            : closed
              ? 'Deadline sudah lewat. Isi pemenangnya untuk membuka solusi di halaman soal.'
              : 'Deadline belum lewat. Pemenang bisa diisi sekarang, tapi solusinya baru tampil setelah deadline.'}
        </p>
        <WinnerForm
          challengeId={challenge.id}
          exists={winner !== null}
          initial={
            winner
              ? {
                  nama: winner.nama,
                  slug: winner.slug,
                  foto: winner.foto,
                  angkatan: winner.angkatan,
                  waktuSubmit: winner.waktuSubmit,
                  runtimeMs: winner.runtimeMs,
                  totalMenang: winner.totalMenang,
                  pendekatan: winner.pendekatan,
                  kodeSolusi: winner.kodeSolusi,
                  quote: winner.quote,
                }
              : {}
          }
        />
      </section>

      <div className="mt-14 max-w-4xl">
        <TerminalWindow title="~/admin/challenge/hapus" tone="canvas" shadow={false} accent="orange">
          <DeleteChallengeForm id={challenge.id} slug={challenge.slug} />
        </TerminalWindow>
      </div>
    </>
  )
}
