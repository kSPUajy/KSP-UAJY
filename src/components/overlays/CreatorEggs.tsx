'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { CREATOR, WHOAMI_LINES, komboLine } from '@/lib/creator'

/** How long god mode lasts. */
const GOD_MS = 30_000

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

type Egg = { command: string; lines: readonly string[] }

const EGGS: Record<string, Egg> = {
  whoami: { command: 'whoami', lines: WHOAMI_LINES },
  sudo: {
    command: 'sudo su',
    lines: [
      `[sudo] password for ${CREATOR.handle}: ********`,
      'Sorry, try again.',
      `hint: password-nya dimulai dengan ${CREATOR.angkatan} :p`,
      `sudo: cd /${CREATOR.angkatan}: No such file or directory  # buka aja, pasti crash`,
      komboLine(4),
    ],
  },
  '2024': {
    command: `grep -r ${CREATOR.angkatan} ~/`,
    lines: [
      '~/web/src/lib/creator.ts: angkatan: 2024',
      '~/404: segmentation fault (core dumped)  # baca backtrace-nya sampai habis',
      '~/.bash_history: git commit -m "init ksp web"',
      '~/htop: grep 2024  # ada proses yang ngumpet',
    ],
  },
  konami: {
    command: './cheat --konami',
    lines: [
      '[✓] god mode: ON (30s)',
      `made with ☕ and too many segfaults by angkatan ${CREATOR.angkatan}`,
      'selamat, kamu nemu easter egg paling dalam.',
    ],
  },
}

/** Words typed anywhere on the page (outside inputs) that open an egg. */
const WORDS = ['whoami', 'sudo', '2024'] as const

const CONSOLE_ART = String.raw`
 ██╗  ██╗███████╗██████╗
 ██║ ██╔╝██╔════╝██╔══██╗
 █████╔╝ ███████╗██████╔╝
 ██╔═██╗ ╚════██║██╔═══╝
 ██║  ██╗███████║██║
 ╚═╝  ╚═╝╚══════╝╚═╝`

/**
 * Easter eggs about whoever built the site:
 *
 * - a banner in the browser console, with a hint;
 * - typing `whoami`, `sudo` or `2024` anywhere (not in a field) opens a small
 *   terminal with clues; so does the Konami code;
 * - clicking the footer's `return 0;` five times.
 *
 * Nothing here names anyone: the eggs only hint (angkatan 2024).
 */
export function CreatorEggs() {
  const reduced = useReducedMotion()
  const [egg, setEgg] = useState<Egg | null>(null)
  const [god, setGod] = useState(false)
  const [lines, setLines] = useState(0)
  const typed = useRef('')
  const keys = useRef<string[]>([])
  const clicks = useRef<number[]>([])

  // The console banner, once per load.
  useEffect(() => {
    console.log(`%c${CONSOLE_ART}`, 'color:#ff3d8b;font-family:monospace;line-height:1.1')
    console.log(
      `%c// kamu buka devtools? kita sefrekuensi.\n// web ini dibuat oleh anak angkatan ${CREATOR.angkatan} yang sudah pensiun dari pengurus.\n// coba ketik "whoami" di halaman mana saja.`,
      'color:#2fd5e0;font-family:monospace',
    )
  }, [])

  // Typed words and the Konami code.
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
      if (event.key === 'Escape') {
        setEgg(null)
        return
      }

      keys.current = [...keys.current, event.key].slice(-KONAMI.length)
      if (keys.current.join(',').toLowerCase() === KONAMI.join(',').toLowerCase()) {
        keys.current = []
        setEgg(EGGS.konami ?? null)
        setGod(true)
        return
      }

      if (event.key.length !== 1) return
      typed.current = (typed.current + event.key.toLowerCase()).slice(-12)
      const word = WORDS.find((candidate) => typed.current.endsWith(candidate))
      if (word) {
        typed.current = ''
        setEgg(EGGS[word] ?? null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Five quick clicks on the footer's `return 0;`.
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const target = (event.target as HTMLElement | null)?.closest('[data-egg="return"]')
      if (!target) return
      const now = Date.now()
      clicks.current = [...clicks.current.filter((time) => now - time < 2500), now]
      if (clicks.current.length >= 5) {
        clicks.current = []
        setEgg(EGGS.whoami ?? null)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // God mode: the whole site recolours for 30 seconds.
  useEffect(() => {
    if (!god) return
    document.documentElement.dataset.godmode = 'on'
    const timer = window.setTimeout(() => setGod(false), GOD_MS)
    return () => {
      window.clearTimeout(timer)
      delete document.documentElement.dataset.godmode
    }
  }, [god])

  // Print the lines one by one.
  useEffect(() => {
    if (!egg) return
    const reset = window.setTimeout(() => setLines(reduced ? egg.lines.length : 0), 0)
    if (reduced) return () => window.clearTimeout(reset)
    const timers = egg.lines.map((_, index) => window.setTimeout(() => setLines(index + 1), 350 + index * 260))
    const close = window.setTimeout(() => setEgg(null), 350 + egg.lines.length * 260 + 9000)
    return () => [reset, close, ...timers].forEach((timer) => window.clearTimeout(timer))
  }, [egg, reduced])

  return (
    <>
      <AnimatePresence>
        {god ? (
          <motion.div
            key="god"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[65]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <div className="god-wash absolute inset-0" />
            <div className="absolute inset-0 scanlines opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <motion.p
                className="glitch glitch-sharp text-center font-display text-[clamp(2.5rem,11vw,9rem)] leading-none tracking-[0.06em] text-(--god) [text-shadow:0_0_24px_var(--god),4px_4px_0_#000]"
                data-text="STOP SEARCHING"
                initial={reduced ? false : { scale: 1.6, opacity: 0 }}
                animate={reduced ? { opacity: 1 } : { scale: [1.6, 1, 1.03, 1], opacity: 1 }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.4,
                }}
              >
                STOP SEARCHING
              </motion.p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {egg ? (
          <motion.div
            key={egg.command}
            role="status"
            aria-live="polite"
            data-palette="dark"
            data-accent="magenta"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scaleY: 0.02 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scaleY: 0.02, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 z-[70] w-[min(28rem,calc(100vw-2rem))] origin-bottom border-2 border-line bg-surface font-mono text-[12px] leading-6 shadow-[6px_6px_0_0_var(--accent)]"
          >
            <div className="flex items-center justify-between border-b-2 border-line px-3 py-1 text-[11px] text-muted">
              <span>{CREATOR.handle}@ksp: ~</span>
              <button
                type="button"
                onClick={() => setEgg(null)}
                aria-label="Tutup"
                className="font-bold hover:text-accent-fg"
              >
                [×]
              </button>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-fg">
                <span className="text-accent-fg">$</span> {egg.command}
              </p>
              {egg.lines.slice(0, lines).map((line) => (
                <p key={line} className="whitespace-pre-wrap text-muted">
                  {line}
                </p>
              ))}
              {lines >= egg.lines.length ? (
                <p className="text-fg">
                  <span className="text-accent-fg">$</span>{' '}
                  <span className="cursor-blink inline-block h-3.5 w-2 translate-y-0.5 bg-accent" />
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {god ? (
        <p className="sr-only" role="alert">
          God mode aktif selama 30 detik. Stop searching.
        </p>
      ) : null}
    </>
  )
}
