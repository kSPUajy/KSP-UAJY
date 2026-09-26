'use client'

import { useActionState, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { kirimMasukan } from '@/app/masukan/actions'
import { AdminForm, SubmitButton, TextInput } from '@/components/admin/form'
import { Button } from '@/components/ui/Button'
import type { AccentName } from '@/lib/accent'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import type { KategoriMasukan } from '@/lib/types'
import { cn } from '@/lib/utils'

const JENIS: ReadonlyArray<{ value: KategoriMasukan; glyph: string; label: string; accent: AccentName }> = [
  { value: 'saran', glyph: '+', label: 'saran', accent: 'lime' },
  { value: 'kritik', glyph: '!', label: 'kritik', accent: 'orange' },
  { value: 'lainnya', glyph: '?', label: 'lainnya', accent: 'cyan' },
]

/** Sentence openers for anyone staring at an empty box. */
const PEMBUKA = [
  { label: 'tempo kelas', text: 'Tempo kelasnya ' },
  { label: 'modul', text: 'Di modul minggu ini, bagian yang kurang jelas adalah ' },
  { label: 'tentor', text: 'Untuk tentor, ' },
  { label: 'ide kegiatan', text: 'Aku punya ide kegiatan: ' },
]

const MAX = 2000
const MIN = 10

/** The commit subject the message would make: first line, clipped. */
function subject(pesan: string): string {
  const line = pesan.trim().split('\n')[0] ?? ''
  return line.length > 44 ? `${line.slice(0, 44)}…` : line
}

/**
 * The kritik & saran form, written as a commit: pick a type, write, and
 * watch the commit line build underneath. Ctrl/⌘ + Enter sends. Once sent,
 * the form gives way to a receipt until the visitor asks to write another.
 */
export function FeedbackForm() {
  const uid = useId()
  const reduced = useMotionMode() !== 'full'
  const [state, action] = useActionState(kirimMasukan, undefined)
  const [dismissed, setDismissed] = useState<typeof state>(undefined)
  const [kategori, setKategori] = useState<KategoriMasukan>('saran')
  const [pesan, setPesan] = useState('')
  const [nama, setNama] = useState('')
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const sent = Boolean(state?.ok) && state !== dismissed
  const errors = state && !state.ok && 'errors' in state ? state.errors : undefined
  const jenis = JENIS.find((item) => item.value === kategori) ?? JENIS[0]
  const length = pesan.trim().length
  const fade = reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }

  const mulai = (text: string) => {
    setPesan((current) => (current.trim() ? `${current.trimEnd()}\n${text}` : text))
    // After React writes the new value, put the caret at its end.
    window.requestAnimationFrame(() => {
      const area = areaRef.current
      if (!area) return
      area.focus()
      area.setSelectionRange(area.value.length, area.value.length)
    })
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="terkirim" {...fade} transition={{ duration: 0.25 }} data-accent={jenis?.accent} role="status">
          <p className="text-[12px] leading-6 text-muted">
            <span className="text-accent-fg">$</span> git push origin masukan
          </p>
          <div className="mt-4 border-2 border-line bg-code-bg p-4 text-[12px] leading-6">
            <p className="font-bold text-accent-fg">[ok] masukan terkirim</p>
            <dl className="mt-2 grid grid-cols-[6rem_minmax(0,1fr)] text-muted">
              <dt>jenis</dt>
              <dd className="text-fg">{jenis?.label}</dd>
              <dt>dari</dt>
              <dd className="text-fg">{nama.trim() || 'anonim'}</dd>
              <dt>status</dt>
              <dd className="text-fg">menunggu dibaca pengurus</dd>
            </dl>
          </div>
          <p className="mt-4 text-sm leading-7 text-fg">Terima kasih. Masukanmu sudah sampai ke pengurus.</p>
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setDismissed(state)
                setPesan('')
                setNama('')
              }}
            >
              tulis masukan lain
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div key="form" {...fade} transition={{ duration: 0.25 }}>
          <AdminForm action={action} state={state} className="space-y-5">
            {/* Type, as three keys. */}
            <fieldset>
              <legend className="text-[11px] leading-5 tracking-[0.06em] text-muted">
                <span aria-hidden className="text-accent-fg">
                  --
                </span>
                jenis
              </legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {JENIS.map((item) => {
                  const on = kategori === item.value
                  return (
                    <label
                      key={item.value}
                      data-accent={item.accent}
                      className={cn(
                        'flex h-11 cursor-pointer items-center justify-center gap-2 border-2 text-[12px] font-bold tracking-[0.06em] transition-[background-color,color,transform] select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-fg',
                        on ? 'border-line bg-accent text-accent-ink hard-shadow-line' : 'border-line-soft bg-code-bg text-muted hover:border-line hover:text-fg',
                      )}
                    >
                      <input
                        type="radio"
                        name="kategori"
                        value={item.value}
                        checked={on}
                        onChange={() => setKategori(item.value)}
                        className="sr-only"
                      />
                      <span aria-hidden className="font-display text-sm">
                        {item.glyph}
                      </span>
                      {item.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <TextInput
              id={`${uid}-nama`}
              name="nama"
              label="nama"
              placeholder="boleh dikosongkan — anonim"
              autoComplete="name"
              maxLength={80}
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              error={errors?.nama}
            />

            <div data-accent={jenis?.accent}>
              <label htmlFor={`${uid}-pesan`} className="block text-[11px] leading-5 tracking-[0.06em] text-muted">
                <span aria-hidden className="text-accent-fg">
                  --
                </span>
                pesan
              </label>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] text-dim">mulai dari:</span>
                {PEMBUKA.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => mulai(item.text)}
                    className="border-2 border-line-soft px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-accent hover:text-fg"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <textarea
                ref={areaRef}
                id={`${uid}-pesan`}
                name="pesan"
                value={pesan}
                onChange={(event) => setPesan(event.target.value.slice(0, MAX))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                required
                minLength={MIN}
                maxLength={MAX}
                rows={5}
                placeholder="Tulis apa saja. Semakin spesifik, semakin mudah ditindaklanjuti."
                aria-invalid={errors?.pesan ? true : undefined}
                aria-describedby={`${uid}-hitung${errors?.pesan ? ` ${uid}-galat` : ''}`}
                className="mt-2 min-h-32 w-full resize-y border-2 border-line bg-code-bg px-3 py-2.5 font-mono text-sm leading-6 text-fg outline-none placeholder:text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg"
              />

              {/* Length, as a meter that fills to the minimum, then counts on. */}
              <div id={`${uid}-hitung`} className="mt-2 flex items-center gap-3 text-[11px] text-dim tabular-nums">
                <span aria-hidden className="relative h-1.5 flex-1 border border-line-soft">
                  <span
                    className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-200"
                    style={{ width: `${Math.min(100, length < MIN ? (length / MIN) * 100 : 100)}%` }}
                  />
                </span>
                <span>{length < MIN ? `${MIN - length} karakter lagi` : `${pesan.length}/${MAX}`}</span>
              </div>
              {errors?.pesan ? (
                <p id={`${uid}-galat`} className="mt-2 text-[12px] leading-5 text-fg">
                  <span className="text-accent-fg">error:</span> {errors.pesan}
                </p>
              ) : null}
            </div>

            {/* Honeypot: invisible to people, irresistible to bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`${uid}-situs`}>situs</label>
              <input id={`${uid}-situs`} name="situs" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {/* The commit this becomes, live. */}
            <p aria-hidden className="truncate border-l-2 border-line-soft pl-3 text-[12px] leading-6 text-muted" data-accent={jenis?.accent}>
              <span className="text-accent-fg">$</span> git commit -m &quot;
              <span className="text-accent-fg">{kategori}</span>: <span className="text-fg">{subject(pesan) || '…'}</span>&quot;
            </p>

            {state && !state.ok && state.message && !errors ? (
              <p role="alert" className="border-l-2 border-accent-fg pl-3 text-[12px] leading-6 text-fg">
                <span className="text-accent-fg">error: </span>
                {state.message}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4" data-accent={jenis?.accent}>
              <SubmitButton pendingLabel="mengirim…">kirim masukan -&gt;</SubmitButton>
              <span className="hidden text-[11px] text-dim sm:inline">
                atau <kbd className="bg-surface-2 px-1 text-accent-fg">ctrl</kbd> +{' '}
                <kbd className="bg-surface-2 px-1 text-accent-fg">enter</kbd>
              </span>
            </div>
          </AdminForm>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
