import { Reveal } from '@/components/motion/Reveal'
import { FeedbackForm } from '@/components/sections/home/FeedbackForm'
import { SectionShell } from '@/components/ui/SectionShell'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { pad2 } from '@/lib/utils'

const ALUR = [
  { glyph: '>', judul: 'Tulis', deskripsi: 'Tanpa login. Nama boleh dikosongkan.' },
  { glyph: '~', judul: 'Terkirim ke pengurus', deskripsi: 'Masuk ke kotak masuk pengurus, tidak ditampilkan di situs.' },
  { glyph: '*', judul: 'Dibaca', deskripsi: 'Setiap masukan dibaca, satu per satu.' },
] as const

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
          <ol aria-label="Alur masukan" className="mt-8 max-w-md">
            {ALUR.map((step, position) => (
              <li key={step.judul} className="relative flex gap-4 pb-6 last:pb-0">
                {position < ALUR.length - 1 ? (
                  <span aria-hidden className="absolute top-10 bottom-0 left-[1.1875rem] border-l-2 border-dashed border-line-soft" />
                ) : null}
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-line bg-accent font-display text-sm text-accent-ink hard-shadow-line"
                >
                  {step.glyph}
                </span>
                <span className="pt-1">
                  <span className="block text-sm font-bold text-fg">{step.judul}</span>
                  <span className="mt-0.5 block text-[13px] leading-6 text-muted">{step.deskripsi}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1}>
          <TerminalWindow title="~/masukan — nano baru.txt" tone="surface" shadow className="relative">
            <FeedbackForm />
          </TerminalWindow>
        </Reveal>
      </div>
    </SectionShell>
  )
}
