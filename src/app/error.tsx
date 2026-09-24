'use client'

import { useEffect } from 'react'

import { Scanlines } from '@/components/overlays/Overlays'
import { Button, ButtonLink } from '@/components/ui/Button'
import { TerminalWindow } from '@/components/ui/TerminalWindow'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ksp] unhandled render error', error)
  }, [error])

  return (
    <section
      data-accent="orange"
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden px-4 py-16 dot-grid sm:px-6 lg:px-8"
    >
      <Scanlines />

      <div className="relative mx-auto w-full max-w-2xl">
        <TerminalWindow title="~/stderr" tone="code" bodyClassName="p-0">
          <div className="border-b-2 border-line-soft p-4 sm:p-6">
            <p className="text-xs text-dim">
              <span className="text-accent-fg">$</span> ./ksp
            </p>
            <h1 className="mt-4 font-display text-xl leading-tight tracking-[0.06em] text-accent-fg uppercase sm:text-2xl">
              Aborted
            </h1>
            <p className="mt-1 text-xs text-muted">signal SIGABRT (6)</p>
          </div>

          <div className="p-4 sm:p-6">
            <p className="max-w-prose text-sm leading-6 text-fg">
              Ada yang gagal waktu halaman ini dirender. Coba jalankan ulang — kalau masih sama,
              kabari pengurus lewat kontak di footer.
            </p>

            {error.digest ? (
              <p className="mt-4 text-[11px] break-all text-dim">
                digest: <span className="text-syn-number">{error.digest}</span>
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={reset}>coba lagi</Button>
              <ButtonLink href="/" variant="outline">
                return 0;
              </ButtonLink>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  )
}
