import { Reveal } from '@/components/motion/Reveal'
import { ButtonAnchor } from '@/components/ui/Button'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { SectionShell } from '@/components/ui/SectionShell'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { siteConfig } from '@/site.config'

/** The letters of the name and the word each one stands for. */
const ACRONYM = [
  { letter: 'L', word: 'Logic' },
  { letter: 'I', word: 'Information' },
  { letter: 'N', word: 'and' },
  { letter: 'K', word: 'Knowledge' },
] as const

const FACTS = [
  { key: 'kapan', value: 'akhir semester genap, setiap tahun' },
  { key: 'format', value: 'kompetisi pemrograman' },
  { key: 'penyelenggara', value: siteConfig.shortName },
] as const

/**
 * KSP's yearly competition. The site itself lives elsewhere, so the only
 * action here is the way out to it.
 */
export function LinkEvent({ index }: { index: number }) {
  const { event } = siteConfig

  return (
    <SectionShell accent="orange" scanlines labelledBy="link-title">
      {/* Mirrored: the box sits left here, so the split sections on the page
          alternate instead of all leaning the same way. Text still comes
          first in the markup, and first on a phone. */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-16">
        {/* Right column, so it reads flush right from `lg` up. */}
        <Reveal className="lg:text-right">
          <SectionMarker index={index} label="event tahunan" className="lg:justify-end" />

          <h2
            id="link-title"
            className="mt-4 font-display text-[clamp(1.5rem,4.6vw,2.75rem)] leading-[1.2] tracking-[0.04em] text-fg uppercase"
          >
            {event.name} <span className="text-accent-fg">{event.year}</span>
          </h2>
          <p className="mt-2 text-xs tracking-[0.08em] text-muted uppercase">{event.expansion}</p>

          <p className="mt-6 max-w-prose text-sm leading-7 text-muted lg:ml-auto">
            Kompetisi besar yang digelar {siteConfig.shortName} setiap tahun di akhir semester genap. Semua yang
            dilatih sepanjang tahun — di kelas, di modul, dan di challenge mingguan — dibuktikan di sini.
          </p>

          <dl className="mt-6 space-y-2 text-sm leading-6">
            {FACTS.map((fact) => (
              <div key={fact.key} className="flex gap-3 lg:justify-end">
                <dt className="w-32 shrink-0 text-dim lg:w-auto">{fact.key}</dt>
                <dd className="text-fg">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <ButtonAnchor href={event.url} size="lg">
              buka situs {event.name} -&gt;
            </ButtonAnchor>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:order-first">
          <TerminalWindow title={`~/event/${event.name.toLowerCase()}-${event.year}`} tone="code">
            <p className="text-[12px] leading-6 text-muted">
              <span aria-hidden className="text-accent-fg">
                ${' '}
              </span>
              ./{event.name.toLowerCase()} --expand
            </p>

            <ul aria-label={`Kepanjangan ${event.name}`} className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
              {ACRONYM.map(({ letter, word }) => (
                <li key={word} className="flex flex-col items-center gap-2">
                  <span
                    aria-hidden
                    className="flex aspect-square w-full items-center justify-center border-2 border-line bg-accent font-display text-[clamp(1.5rem,6vw,2.5rem)] text-accent-ink hard-shadow-line"
                  >
                    {letter}
                  </span>
                  <span className="text-center text-[10px] leading-4 tracking-[0.06em] text-fg uppercase sm:text-[11px]">
                    {word}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t-2 border-line-soft pt-4 text-[11px] leading-5 text-dim">
              pendaftaran dan info lomba ada di situs resmi <span className="text-accent-fg">{event.name}</span>.
            </p>
          </TerminalWindow>
        </Reveal>
      </div>
    </SectionShell>
  )
}
