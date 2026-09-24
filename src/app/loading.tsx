import { TerminalWindow } from '@/components/ui/TerminalWindow'

const STEPS = [
  ['CC', 'src/app/page.tsx'],
  ['CC', 'src/components/ui/*.tsx'],
  ['LD', 'ksp'],
] as const

/**
 * Root loading state: a `make` log rather than a grey box. Individual routes
 * override this with a skeleton shaped like their own content.
 */
export default function Loading() {
  return (
    <section className="relative px-4 py-16 dot-grid sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <TerminalWindow title="~/build.log" tone="code">
          <p className="text-xs text-dim">
            <span className="text-accent-fg">$</span> make
          </p>

          <ul className="mt-4 space-y-2">
            {STEPS.map(([tool, target]) => (
              <li key={target} className="flex items-baseline gap-3 text-xs">
                <span className="w-8 shrink-0 text-accent-fg">{tool}</span>
                <span className="truncate text-muted">{target}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 h-2 border-2 border-line-soft" role="status" aria-label="Memuat halaman">
            <span aria-hidden className="build-bar block h-full bg-accent" />
          </div>

          <p className="mt-3 text-[11px] text-dim">mengompilasi halaman…</p>
        </TerminalWindow>
      </div>
    </section>
  )
}
