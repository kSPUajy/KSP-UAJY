'use client'

import { useState, useTransition } from 'react'

import { tukarJadwal } from '@/app/admin/modul/actions'

const BUTTON_CLASS =
  'inline-flex h-9 w-9 cursor-pointer items-center justify-center border-2 border-line bg-surface text-sm text-fg hover:bg-surface-2 disabled:cursor-default disabled:opacity-40'

/** The up and down buttons of one timeline row, and what the last move said. */
export function TimelineGeser({ id, judul, pertama, terakhir }: { id: string; judul: string; pertama: boolean; terakhir: boolean }) {
  const [pending, startTransition] = useTransition()
  const [pesan, setPesan] = useState<{ ok: boolean; text: string } | null>(null)

  const geser = (arah: 'naik' | 'turun'): void => {
    startTransition(async () => {
      const result = await tukarJadwal(id, arah)
      setPesan(result.ok ? { ok: true, text: result.pesan } : { ok: false, text: result.error })
    })
  }

  return (
    <>
      <span className="flex gap-2">
        <button type="button" aria-label={`Naikkan ${judul}`} disabled={pending || pertama} onClick={() => geser('naik')} className={BUTTON_CLASS}>
          <span aria-hidden>↑</span>
        </button>
        <button type="button" aria-label={`Turunkan ${judul}`} disabled={pending || terakhir} onClick={() => geser('turun')} className={BUTTON_CLASS}>
          <span aria-hidden>↓</span>
        </button>
      </span>
      <p role="status" className="col-span-full text-[12px] leading-5 empty:hidden">
        {pesan ? (
          <span className={pesan.ok ? 'text-accent-fg' : 'text-fg'}>
            {pesan.ok ? '[ok] ' : <span className="text-accent-fg">error: </span>}
            {pesan.text}
          </span>
        ) : null}
      </p>
    </>
  )
}
