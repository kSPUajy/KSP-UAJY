import { CrtVignette } from '@/components/overlays/Overlays'
import { CompileStrip } from '@/components/sections/home/CompileStrip'
import { DriftField } from '@/components/sections/home/DriftField'
import { HeroModulPanel } from '@/components/sections/home/HeroModulPanel'
import { HeroSequence } from '@/components/sections/home/HeroSequence'
import { heroTimeline } from '@/components/sections/home/hero-timeline'
import { ButtonLink } from '@/components/ui/Button'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { SiteStats, TimelineEntry } from '@/lib/types'
import { siteConfig } from '@/site.config'

type HeroProps = {
  stats: SiteStats
  driftTokens: readonly string[]
  /** Outside a registration round the hero leads with the challenge instead. */
  registrationOpen: boolean
  /** The schedule — modules and sessions — for the panel beside the wordmark. */
  schedule: readonly TimelineEntry[]
}

const STATUS_ROWS = (registrationOpen: boolean) =>
  [
    { key: 'tentoring', value: 'Senin & Selasa, 19.00–21.00 WIB' },
    { key: 'tempat', value: 'Lab Komputasi' },
    { key: 'tugas', value: 'dikumpulkan tiap Minggu, 23.59 WIB' },
    { key: 'pendaftaran', value: registrationOpen ? 'dibuka — ayo gabung' : 'ditutup untuk periode ini', live: registrationOpen },
  ] as const

/** The week at a glance, printed like `cat` output under the buttons. */
function HeroStatus({ registrationOpen }: { registrationOpen: boolean }) {
  return (
    <div className="max-w-md border-l-2 border-accent pl-4 text-[12px] leading-6 sm:text-[13px]">
      <p aria-hidden className="text-muted">
        <span className="text-accent-fg">$</span> cat ~/ksp/jadwal.conf
      </p>
      <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
        {STATUS_ROWS(registrationOpen).map((row) => (
          <div key={row.key} className="contents">
            <dt className="text-dim">{row.key}</dt>
            <dd className={'live' in row && row.live ? 'text-accent-fg' : 'text-fg'}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * Full-viewport terminal. The window fills the first screen; the CRT vignette
 * darkens the dotted desk around it, never the text inside it.
 *
 * `svh`, not `dvh`: the small viewport height never changes as a phone's URL
 * bar slides away, so the hero never resizes under someone's thumb.
 */
export function Hero({ stats, driftTokens, registrationOpen, schedule }: HeroProps) {
  const timeline = heroTimeline(siteConfig.heroCommand)

  return (
    <section
      data-accent="magenta"
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden px-3 py-3 dot-grid sm:px-6 sm:py-6 lg:px-8 lg:py-8 short:lg:py-4"
    >
      <CrtVignette />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        <TerminalWindow
          title={`~/${siteConfig.shortName.toLowerCase()} — bash`}
          tone="canvas"
          className="flex flex-1 flex-col"
          bodyClassName="flex flex-1 flex-col"
          actions={
            <span aria-hidden className="hidden text-[10px] leading-none text-dim sm:inline">
              utf-8 · lf · c17
            </span>
          }
        >
          <HeroSequence
            command={siteConfig.heroCommand}
            wordmark={siteConfig.wordmark}
            name={siteConfig.name}
            tagline={siteConfig.tagline}
            backdrop={<DriftField tokens={driftTokens} />}
            aside={schedule.length > 0 ? <HeroModulPanel entries={schedule} /> : undefined}
            status={<HeroStatus registrationOpen={registrationOpen} />}
            actions={
              registrationOpen ? (
                <>
                  <ButtonLink href={siteConfig.cta.href} size="lg">
                    Gabung Sekarang
                  </ButtonLink>
                  <ButtonLink href="/challenge" variant="outline" size="lg">
                    Lihat Challenge
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href="/challenge" size="lg">
                    Lihat Challenge
                  </ButtonLink>
                  <ButtonLink href={siteConfig.cta.href} variant="outline" size="lg">
                    Cara Bergabung
                  </ButtonLink>
                </>
              )
            }
            footer={<CompileStrip stats={stats} countDelay={timeline.countUp} />}
          />
        </TerminalWindow>
      </div>
    </section>
  )
}
