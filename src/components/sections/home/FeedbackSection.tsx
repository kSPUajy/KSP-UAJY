import { Reveal } from '@/components/motion/Reveal'
import { FeedbackForm } from '@/components/sections/home/FeedbackForm'
import { SectionShell } from '@/components/ui/SectionShell'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { pad2 } from '@/lib/utils'

/**
 * Kritik dan saran, straight to the pengurus. Anonymous unless the sender
 * signs it; admins read them at `/admin/masukan`.
 */
export function FeedbackSection({ index }: { index: number }) {
  return (
    <SectionShell accent="violet" tone="tint" labelledBy="masukan-title">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16">
        <Reveal>
          <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
            {`// ${pad2(index)} — kritik & saran`}
          </p>
          <h2
            id="masukan-title"
            className="mt-4 font-display text-[clamp(1.5rem,4.6vw,2.75rem)] leading-[1.2] tracking-[0.04em] text-fg uppercase"
          >
            Ada yang bisa <span className="text-accent-fg">lebih baik?</span>
          </h2>
          <p className="mt-6 max-w-prose text-sm leading-7 text-muted">
            Kelas terlalu cepat, modul kurang jelas, tentor susah dihubungi, atau punya ide kegiatan baru? Tulis
            saja. Setiap masukan dibaca langsung oleh pengurus.
          </p>
          <ul className="mt-6 space-y-2 text-sm leading-6 text-fg">
            {['Nama boleh dikosongkan', 'Tidak perlu login', 'Dibaca pengurus, tidak ditampilkan di situs'].map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="shrink-0 text-accent-fg">
                  [x]
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <TerminalWindow title="~/masukan/baru.txt" tone="surface" className="relative">
            <FeedbackForm />
          </TerminalWindow>
        </Reveal>
      </div>
    </SectionShell>
  )
}
