'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { motion } from 'motion/react'

import { kirimMasukan } from '@/app/masukan/actions'
import type { AccentName } from '@/lib/accent'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import type { KategoriMasukan } from '@/lib/types'
import { cn } from '@/lib/utils'

const JENIS: ReadonlyArray<{ value: KategoriMasukan; label: string; accent: AccentName; tanya: string }> = [
  { value: 'saran', label: 'saran', accent: 'lime', tanya: 'Siap. Apa sarannya?' },
  { value: 'kritik', label: 'kritik', accent: 'orange', tanya: 'Boleh banget. Apa yang menurutmu kurang?' },
  { value: 'lainnya', label: 'lainnya', accent: 'cyan', tanya: 'Silakan, tulis saja.' },
]

/** Sentence openers for anyone staring at an empty box. */
const PEMBUKA = [
  { label: 'tempo kelas', text: 'Tempo kelasnya ' },
  { label: 'modul', text: 'Di modul minggu ini, bagian yang kurang jelas adalah ' },
  { label: 'tentor', text: 'Untuk tentor, ' },
  { label: 'ide kegiatan', text: 'Aku punya ide kegiatan: ' },
]

const MIN = 10
const MAX = 2000

type Step = 'jenis' | 'pesan' | 'nama' | 'kirim' | 'selesai'

/** How long the bot "types" before a message appears. */
const TYPING_MS = 650

function useTyping(reduced: boolean): boolean {
  const [typing, setTyping] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setTyping(false), reduced ? 0 : TYPING_MS)
    return () => window.clearTimeout(timer)
  }, [reduced])
  return typing && !reduced
}

function Dots() {
  return (
    <span aria-label="mengetik" className="inline-flex gap-1 py-1">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 animate-pulse bg-muted motion-reduce:animate-none"
          style={{ animationDelay: `${dot * 150}ms` }}
        />
      ))}
    </span>
  )
}

/** A message from KSP: the pixel badge, then the bubble after a beat of typing. */
function Bot({ children, reduced, waitFor }: { children: React.ReactNode; reduced: boolean; waitFor?: boolean }) {
  const typing = useTyping(reduced)
  const showDots = typing || waitFor
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2.5"
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-line bg-accent font-display text-[9px] text-accent-ink"
      >
        KSP
      </span>
      <div className="max-w-[85%] border-2 border-line bg-surface px-3.5 py-2.5 text-sm leading-6 text-fg">
        {showDots ? <Dots /> : children}
      </div>
    </motion.li>
  )
}

/** The visitor's side, in the colour of what they picked. */
function Me({ children, accent, reduced }: { children: React.ReactNode; accent?: AccentName; reduced: boolean }) {
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
      data-accent={accent}
    >
      <div className="max-w-[85%] border-2 border-line bg-accent px-3.5 py-2.5 text-sm leading-6 whitespace-pre-line text-accent-ink hard-shadow-line">
        {children}
      </div>
    </motion.li>
  )
}

/** Controls that follow a bot message, held back until it has "typed". */
function Replies({ children, reduced, className }: { children: React.ReactNode; reduced: boolean; className?: string }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: reduced ? 0 : TYPING_MS / 1000 + 0.05 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const chip =
  'border-2 border-line bg-surface px-3 py-1.5 text-[12px] font-bold tracking-[0.04em] text-fg transition-colors hover:bg-accent hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg'

/**
 * Kritik & saran as a conversation with KSP rather than a form: pick a type
 * from quick replies, write, choose a name or stay anonymous, and the bot
 * confirms. Every answer stays on screen as a bubble, so the whole exchange
 * reads back like a chat log. The server action is the same one a form
 * would post to — this only changes how the fields are asked for.
 */
export function FeedbackChat() {
  const uid = useId()
  const reduced = useMotionMode() !== 'full'
  const [step, setStep] = useState<Step>('jenis')
  const [kategori, setKategori] = useState<KategoriMasukan | null>(null)
  const [pesan, setPesan] = useState('')
  const [nama, setNama] = useState('')
  const [anonim, setAnonim] = useState(true)
  const [galat, setGalat] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const namaRef = useRef<HTMLInputElement>(null)
  const trapRef = useRef<HTMLInputElement>(null)

  const jenis = JENIS.find((item) => item.value === kategori)
  const length = pesan.trim().length

  // Each step hands focus to the control it just revealed.
  useEffect(() => {
    const delay = reduced ? 0 : TYPING_MS + 80
    const timer = window.setTimeout(() => {
      if (step === 'pesan') areaRef.current?.focus({ preventScroll: true })
      if (step === 'nama') namaRef.current?.focus({ preventScroll: true })
    }, delay)
    return () => window.clearTimeout(timer)
  }, [step, reduced])

  const pilih = (value: KategoriMasukan) => {
    setKategori(value)
    setGalat(null)
    setStep('pesan')
  }

  const lanjut = () => {
    if (length < MIN) {
      setGalat(`Tulis minimal ${MIN} karakter, supaya pengurus paham maksudnya.`)
      return
    }
    setGalat(null)
    setStep('nama')
  }

  const kirim = (pakaiNama: boolean) => {
    if (pakaiNama && !nama.trim()) {
      namaRef.current?.focus()
      return
    }
    setAnonim(!pakaiNama)
    setGalat(null)
    setStep('kirim')
    const data = new FormData()
    data.set('kategori', kategori ?? '')
    data.set('pesan', pesan)
    data.set('nama', pakaiNama ? nama : '')
    data.set('situs', trapRef.current?.value ?? '')
    startTransition(async () => {
      const result = await kirimMasukan(undefined, data)
      if (result?.ok) {
        setStep('selesai')
        return
      }
      const errors = result && 'errors' in result ? result.errors : undefined
      setGalat(errors?.pesan ?? errors?.nama ?? result?.message ?? 'Masukan gagal terkirim. Coba lagi sebentar lagi.')
      setStep(errors?.pesan ? 'pesan' : 'nama')
    })
  }

  const ulang = () => {
    setStep('jenis')
    setKategori(null)
    setPesan('')
    setNama('')
    setAnonim(true)
    setGalat(null)
  }

  const mulai = (text: string) => {
    setPesan((current) => (current.trim() ? `${current.trimEnd()}\n${text}` : text))
    window.requestAnimationFrame(() => {
      const area = areaRef.current
      if (!area) return
      area.focus()
      area.setSelectionRange(area.value.length, area.value.length)
    })
  }

  const past = (target: Step): boolean => {
    const order: Step[] = ['jenis', 'pesan', 'nama', 'kirim', 'selesai']
    return order.indexOf(step) > order.indexOf(target)
  }

  return (
    <div className="border-2 border-line bg-canvas hard-shadow" data-accent="violet">
      {/* Chat header. */}
      <div className="flex items-center gap-3 border-b-2 border-line bg-surface px-4 py-3">
        <span aria-hidden className="flex h-9 w-9 items-center justify-center border-2 border-line bg-accent font-display text-[10px] text-accent-ink">
          KSP
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-5 font-bold text-fg">Pengurus KSP</p>
          <p className="text-[11px] leading-4 text-dim">
            <span aria-hidden className="text-accent-fg">●</span> membaca setiap masukan
          </p>
        </div>
        <span className="ml-auto hidden text-[11px] text-dim sm:block">tanpa login · boleh anonim</span>
      </div>

      <ol aria-live="polite" aria-label="Percakapan kritik dan saran" className="dot-grid space-y-4 px-4 py-6 sm:px-6">
        <Bot reduced={reduced}>
          Halo! Ini kotak kritik & saran KSP. Apa pun yang kamu tulis dibaca langsung oleh pengurus.
        </Bot>
        <Bot reduced={reduced}>Mau menyampaikan apa?</Bot>

        {step === 'jenis' ? (
          <Replies reduced={reduced} className="flex flex-wrap justify-end gap-2">
            {JENIS.map((item) => (
              <button key={item.value} type="button" data-accent={item.accent} onClick={() => pilih(item.value)} className={chip}>
                {item.label}
              </button>
            ))}
          </Replies>
        ) : null}

        {jenis && step !== 'jenis' ? (
          <>
            <Me accent={jenis.accent} reduced={reduced}>
              {jenis.label}
            </Me>
            <Bot key={`tanya-${jenis.value}`} reduced={reduced}>
              {jenis.tanya}
            </Bot>
          </>
        ) : null}

        {past('pesan') && jenis ? (
          <>
            <Me accent={jenis.accent} reduced={reduced}>
              {pesan.trim()}
            </Me>
            <Bot reduced={reduced}>Terakhir: mau cantumkan nama, atau kirim anonim?</Bot>
          </>
        ) : null}

        {past('nama') && jenis ? (
          <>
            <Me accent={jenis.accent} reduced={reduced}>
              {anonim ? 'kirim anonim' : `nama: ${nama.trim()}`}
            </Me>
            <Bot reduced={reduced} waitFor={pending || step === 'kirim'}>
              Terkirim ke pengurus. Terima kasih{anonim ? '' : `, ${nama.trim().split(/\s+/)[0]}`}! Masukan seperti ini yang membuat KSP
              makin baik.
            </Bot>
          </>
        ) : null}

        {galat ? <Bot key={galat} reduced={reduced}>{galat}</Bot> : null}

        {step === 'selesai' ? (
          <Replies reduced={reduced} className="flex justify-end">
            <button type="button" onClick={ulang} className={chip}>
              tulis masukan lain
            </button>
          </Replies>
        ) : null}
      </ol>

      {/* Composer: what the current question needs. */}
      {step === 'pesan' && jenis ? (
        <Replies reduced={reduced} className="border-t-2 border-line bg-surface p-3 sm:p-4">
          <div data-accent={jenis.accent}>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
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
            <label htmlFor={`${uid}-pesan`} className="sr-only">
              Pesan {jenis.label}
            </label>
            <div className="flex items-end gap-2">
              <textarea
                ref={areaRef}
                id={`${uid}-pesan`}
                value={pesan}
                onChange={(event) => setPesan(event.target.value.slice(0, MAX))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault()
                    lanjut()
                  }
                }}
                rows={3}
                maxLength={MAX}
                placeholder="Tulis pesanmu…"
                className="min-h-20 flex-1 resize-y border-2 border-line bg-code-bg px-3 py-2 font-mono text-sm leading-6 text-fg outline-none placeholder:text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg"
              />
              <button
                type="button"
                onClick={lanjut}
                aria-label="Kirim pesan"
                className="flex h-11 shrink-0 items-center border-2 border-line bg-accent px-4 text-[12px] font-bold text-accent-ink press-pop hard-shadow-line"
              >
                kirim -&gt;
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-dim tabular-nums">
              <span>{length < MIN ? `${MIN - length} karakter lagi` : `${pesan.length}/${MAX}`}</span>
              <span className="hidden sm:inline">
                <kbd className="bg-surface-2 px-1 text-accent-fg">ctrl</kbd> + <kbd className="bg-surface-2 px-1 text-accent-fg">enter</kbd>
              </span>
              <button type="button" onClick={() => setStep('jenis')} className="text-muted underline-offset-2 hover:text-fg hover:underline">
                ganti jenis
              </button>
            </div>
          </div>
        </Replies>
      ) : null}

      {step === 'nama' && jenis ? (
        <Replies reduced={reduced} className="border-t-2 border-line bg-surface p-3 sm:p-4">
          <form
            data-accent={jenis.accent}
            onSubmit={(event) => {
              event.preventDefault()
              kirim(true)
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor={`${uid}-nama`} className="sr-only">
              Nama
            </label>
            <input
              ref={namaRef}
              id={`${uid}-nama`}
              value={nama}
              onChange={(event) => setNama(event.target.value.slice(0, 80))}
              autoComplete="name"
              placeholder="namamu (opsional)"
              className="h-11 min-w-0 flex-1 border-2 border-line bg-code-bg px-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!nama.trim()}
                className="h-11 flex-1 border-2 border-line bg-accent px-4 text-[12px] font-bold text-accent-ink press-pop hard-shadow-line disabled:opacity-40 sm:flex-none"
              >
                kirim dengan nama
              </button>
              <button type="button" onClick={() => kirim(false)} className={cn(chip, 'h-11 flex-1 sm:flex-none')}>
                kirim anonim
              </button>
            </div>
          </form>
          <button type="button" onClick={() => setStep('pesan')} className="mt-2 text-[11px] text-muted underline-offset-2 hover:text-fg hover:underline">
            ubah pesan
          </button>
        </Replies>
      ) : null}

      {/* Honeypot: invisible to people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-situs`}>situs</label>
        <input ref={trapRef} id={`${uid}-situs`} name="situs" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </div>
  )
}
