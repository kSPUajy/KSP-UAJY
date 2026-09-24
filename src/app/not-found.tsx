import type { Metadata } from 'next'

import { CrtVignette, Scanlines } from '@/components/overlays/Overlays'
import { ButtonLink } from '@/components/ui/Button'
import { TerminalWindow } from '@/components/ui/TerminalWindow'

export const metadata: Metadata = {
  title: 'Segmentation fault',
  robots: { index: false, follow: false },
}

const BACKTRACE = [
  ['#0', '0x0000dead', 'resolve_route (path=NULL)', 'router.c:404'],
  ['#1', '0x0000beef', 'render_page ()', 'app.c:87'],
  ['#2', '0x00c0ffee', 'main ()', 'main.c:12'],
] as const

export default function NotFound() {
  return (
    <section
      data-accent="magenta"
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden px-4 py-16 dot-grid sm:px-6 lg:px-8"
    >
      <Scanlines />
      <CrtVignette />

      <div className="relative mx-auto w-full max-w-2xl">
        <TerminalWindow title="~/core.dump" tone="code" bodyClassName="p-0">
          <div className="border-b-2 border-line-soft p-4 sm:p-6">
            <p className="text-xs text-dim">
              <span className="text-accent-fg">$</span> ./ksp --route=0x0
            </p>
            <h1 className="mt-4 font-display text-xl leading-tight tracking-[0.06em] text-accent-fg uppercase sm:text-2xl">
              Segmentation fault
            </h1>
            <p className="mt-1 text-xs text-muted">(core dumped)</p>
          </div>

          <div className="overflow-x-auto border-b-2 border-line-soft p-4 sm:p-6">
            <p className="text-[11px] tracking-[0.1em] text-dim uppercase">*** backtrace ***</p>
            <table className="mt-3 w-full text-[11px] whitespace-nowrap text-muted">
              <tbody>
                {BACKTRACE.map(([frame, address, symbol, origin]) => (
                  <tr key={frame}>
                    <td className="py-1 pr-4 text-dim">{frame}</td>
                    <td className="py-1 pr-4 text-syn-number">{address}</td>
                    <td className="py-1 pr-4 text-fg">{symbol}</td>
                    <td className="py-1 text-syn-comment">{origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-6">
            <p className="max-w-prose text-sm leading-6 text-fg">
              Pointer-nya menunjuk ke halaman yang tidak ada. Kemungkinan besar URL-nya salah ketik,
              atau kontennya sudah dipindah ke alamat lain.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/">return 0;</ButtonLink>
              <ButtonLink href="/challenge" variant="outline">
                lihat challenge
              </ButtonLink>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  )
}
