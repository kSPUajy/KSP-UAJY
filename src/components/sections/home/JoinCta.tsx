import { Reveal } from '@/components/motion/Reveal'
import { BenefitLog } from '@/components/sections/gabung/BenefitLog'
import { RegisterButton, RegistrationStatusLine } from '@/components/sections/gabung/Registration'
import { ButtonLink } from '@/components/ui/Button'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { SectionShell } from '@/components/ui/SectionShell'
import type { JoinInfo, Registration } from '@/lib/types'

type JoinCtaProps = {
  index: number
  info: JoinInfo
  registration: Registration
}

/**
 * The close. Always a dark band, whatever the theme: it follows the cream
 * gallery band, and the lime button has to be the brightest thing in view.
 *
 * Left: the pitch and the three conditions. Right: what membership installs,
 * printed as a build log.
 */
export function JoinCta({ index, info, registration }: JoinCtaProps) {
  return (
    <SectionShell accent="lime" tone="void" dots labelledBy="gabung-title">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
        <Reveal>
          <SectionMarker index={index} label="gabung" />

          <h2
            id="gabung-title"
            className="mt-4 font-display text-[clamp(1.5rem,4.6vw,2.75rem)] leading-[1.2] tracking-[0.04em] text-fg uppercase"
          >
            Belum bisa C? <span className="text-accent-fg">Justru itu alasannya.</span>
          </h2>

          <p className="mt-6 max-w-prose text-sm leading-7 text-muted">{info.ringkasan}</p>

          <ul aria-label="Syarat bergabung" className="mt-6 space-y-2">
            {info.syarat.map((syarat) => (
              <li key={syarat} className="flex gap-3 text-sm leading-6 text-fg">
                <span aria-hidden className="shrink-0 text-accent-fg">
                  [x]
                </span>
                {syarat}
              </li>
            ))}
          </ul>

          <RegistrationStatusLine registration={registration} className="mt-8 max-w-prose" />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <RegisterButton registration={registration} />
            <ButtonLink href="/gabung" variant="outline" size="lg">
              cara bergabung
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <BenefitLog benefits={info.manfaat} />
        </Reveal>
      </div>
    </SectionShell>
  )
}
