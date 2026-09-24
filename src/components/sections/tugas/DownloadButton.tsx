'use client'

import { useState } from 'react'

import { unduhTugas } from '@/app/dashboard/actions'

/** Asks for a short-lived link, then follows it. Links are never left lying in the page. */
export function DownloadButton({ submissionId, fileName }: { submissionId: string; fileName: string }) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function download(): Promise<void> {
    setBusy(true)
    setError(null)
    const result = await unduhTugas(submissionId)
    setBusy(false)
    if (!result.ok) return setError(result.error)
    window.location.assign(result.url)
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="text-accent-fg underline decoration-2 underline-offset-4 hover:text-fg disabled:opacity-60"
      >
        {busy ? 'menyiapkan…' : 'unduh'}
        <span className="sr-only"> {fileName}</span>
      </button>
      {error ? (
        <span role="alert" className="text-fg">
          {error}
        </span>
      ) : null}
    </span>
  )
}
