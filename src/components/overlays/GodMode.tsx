'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/** Lines typed under the title, one after another. */
const WHISPERS = [
  'we see you.',
  'why are you still searching?',
  'every click is logged.',
  'it lives in the code.',
  'you were never supposed to find this.',
  'stop.',
] as const

/** Words that flash up faintly around the screen. */
const ECHOES = ['STOP', 'GO BACK', '2024', '▒▒▒▒▒', 'STOP', 'root', '??', 'STOP'] as const

type Echo = { key: number; word: string; x: number; y: number; size: number; rotate: number }

/**
 * The Konami payoff, made to feel wrong for 30 seconds: the page dims from
 * the edges in, static crawls over it, the colours lurch green → gold → red,
 * the screen jolts now and then, "STOP SEARCHING" beats like a pulse, and
 * whispers type themselves out underneath while fragments flash up around
 * the edges. It ends with a blackout.
 *
 * Under reduced motion it is only the dimmed page and the still title.
 */
export function GodMode({ duration, reduced }: { duration: number; reduced: boolean }) {
  const [whisper, setWhisper] = useState(0)
  const [typed, setTyped] = useState('')
  const [echoes, setEchoes] = useState<Echo[]>([])
  const [blackout, setBlackout] = useState(false)

  // Whispers: type one, hold, next.
  useEffect(() => {
    if (reduced) return
    const text = WHISPERS[whisper % WHISPERS.length] ?? ''
    let index = 0
    let hold: number | undefined
    const type = window.setInterval(() => {
      index += 1
      setTyped(text.slice(0, index))
      if (index >= text.length) {
        window.clearInterval(type)
        hold = window.setTimeout(() => setWhisper((value) => value + 1), 1800)
      }
    }, 70)
    return () => {
      window.clearInterval(type)
      window.clearTimeout(hold)
    }
  }, [whisper, reduced])

  // Echoes flashing around the edges.
  useEffect(() => {
    if (reduced) return
    let key = 0
    const timer = window.setInterval(() => {
      key += 1
      const echo: Echo = {
        key,
        word: ECHOES[Math.floor(Math.random() * ECHOES.length)] ?? 'STOP',
        x: Math.random() < 0.5 ? 3 + Math.random() * 22 : 70 + Math.random() * 24,
        y: 6 + Math.random() * 86,
        size: 0.9 + Math.random() * 2.4,
        rotate: -8 + Math.random() * 16,
      }
      setEchoes((current) => [...current.slice(-5), echo])
    }, 650)
    return () => window.clearInterval(timer)
  }, [reduced])

  // The last half-second goes black.
  useEffect(() => {
    if (reduced) return
    const timer = window.setTimeout(() => setBlackout(true), duration - 600)
    return () => window.clearTimeout(timer)
  }, [duration, reduced])

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[65] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: reduced ? 0.2 : 1.2 }}
    >
      {/* The page, drained and closing in. */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="god-wash absolute inset-0" />
      <div className="god-vignette absolute inset-0" />
      {reduced ? null : <div className="tv-static absolute inset-0 opacity-[0.13] mix-blend-screen" />}
      <div className="absolute inset-0 scanlines opacity-60" />
      {reduced ? null : <div className="god-flicker absolute inset-0 bg-black" />}

      {/* Fragments at the edges. */}
      <AnimatePresence>
        {echoes.map((echo) => (
          <motion.span
            key={echo.key}
            className="absolute font-display leading-none tracking-[0.1em] text-(--god) [text-shadow:0_0_12px_var(--god)]"
            style={{ left: `${echo.x}%`, top: `${echo.y}%`, fontSize: `${echo.size}rem`, rotate: `${echo.rotate}deg` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0.1, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, times: [0, 0.1, 0.25, 0.4, 1] }}
          >
            {echo.word}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* The title and the whisper under it. */}
      <div className={reduced ? 'absolute inset-0 flex flex-col items-center justify-center gap-8 p-4' : 'god-shake absolute inset-0 flex flex-col items-center justify-center gap-8 p-4'}>
        <motion.p
          className="glitch glitch-sharp text-center font-display text-[clamp(2.5rem,11vw,9rem)] leading-none tracking-[0.06em] text-(--god) [text-shadow:0_0_40px_var(--god),0_0_4px_var(--god),5px_5px_0_#000]"
          data-text="STOP SEARCHING"
          initial={reduced ? false : { scale: 3, opacity: 0, filter: 'blur(12px)' }}
          animate={
            reduced
              ? { opacity: 1 }
              : { scale: [3, 1, 1.07, 1, 1.04, 1], opacity: 1, filter: 'blur(0px)' }
          }
          transition={
            reduced
              ? undefined
              : {
                  scale: { duration: 1.1, times: [0, 0.5, 0.62, 0.74, 0.86, 1], repeat: Infinity, repeatDelay: 0.4, delay: 1 },
                  opacity: { duration: 1.2, delay: 0.8 },
                  filter: { duration: 1.2, delay: 0.8 },
                }
          }
        >
          STOP SEARCHING
        </motion.p>
        {reduced ? null : (
          <p className="min-h-6 font-mono text-[clamp(0.85rem,1.6vw,1.15rem)] tracking-[0.08em] text-[#e8e2d0]/85 [text-shadow:0_0_8px_#000]">
            {typed}
            <span className="cursor-blink ml-1 inline-block h-4 w-2.5 translate-y-0.5 bg-(--god)" />
          </p>
        )}
      </div>

      {blackout ? <div className="absolute inset-0 bg-black" /> : null}
    </motion.div>
  )
}
