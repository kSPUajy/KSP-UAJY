'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { CALM, mech } from '@/components/motion/variants'
import { Badge } from '@/components/ui/Badge'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { formatTanggal } from '@/lib/format'
import type { GalleryItem } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type LightboxProps = {
  /** The item on screen, or null when closed. */
  item: GalleryItem | null
  /** 1-based place of `item` in the run being browsed, and the run's length. */
  position: number
  total: number
  onClose: () => void
  onStep: (delta: 1 | -1) => void
}

/** A horizontal drag longer than this, in CSS pixels, turns the page. */
const SWIPE_THRESHOLD = 48

const HEADING_ID = 'lightbox-caption'

/** File name the title bar shows: `~/galeri/2025-09/g-03.jpg`. */
const pathOf = (item: GalleryItem): string =>
  `~/galeri/${item.tanggal.slice(0, 7)}/${item.id}.${item.type === 'video' ? 'mp4' : 'jpg'}`

function StepButton({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  const previous = direction === -1
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={previous ? 'Sebelumnya' : 'Berikutnya'}
      className="inline-flex h-10 items-center gap-2 border-2 border-line bg-surface px-3 text-[11px] tracking-[0.08em] text-fg uppercase transition-colors hover:bg-surface-2 hover:text-accent-fg"
    >
      {previous ? (
        <>
          <span aria-hidden>&lt;-</span>
          <span aria-hidden className="hidden sm:inline">
            prev
          </span>
        </>
      ) : (
        <>
          <span aria-hidden className="hidden sm:inline">
            next
          </span>
          <span aria-hidden>-&gt;</span>
        </>
      )}
    </button>
  )
}

/**
 * One photo or video, full size and in its own colours — the grid behind it
 * is the duotoned contact sheet, this is the print.
 *
 * Arrow keys and a horizontal swipe step through the run; Escape, the
 * backdrop and the close button all leave. Focus is trapped while it is open
 * and handed back to the frame that opened it.
 */
export function Lightbox({ item, position, total, onClose, onStep }: LightboxProps) {
  const mode = useMotionMode()
  const open = item !== null
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  // Last item shown, so the panel keeps its content while it fades out.
  const [shown, setShown] = useState<GalleryItem | null>(null)
  if (item && item !== shown) setShown(item)

  // Kept in a ref so the listener is bound once per open, not per step.
  const stepRef = useRef(onStep)
  useEffect(() => {
    stepRef.current = onStep
  })

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent): void => {
      // A focused video uses the arrows to seek; leave them to it.
      if (event.target instanceof HTMLVideoElement) return
      if (event.key === 'ArrowLeft') stepRef.current(-1)
      else if (event.key === 'ArrowRight') stepRef.current(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const onPointerDown = (event: React.PointerEvent): void => {
    if (event.pointerType === 'mouse') return
    swipeStart.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: React.PointerEvent): void => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) onStep(dx < 0 ? 1 : -1)
  }

  const fade = mode === 'reduced' ? CALM : mech(0.25)
  const current = item ?? shown

  return (
    <AnimatePresence>
      {open && current ? (
        <div key="lightbox" data-accent="magenta" className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-canvas/90"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={HEADING_ID}
            tabIndex={-1}
            className="relative flex max-h-full w-full max-w-6xl flex-col"
            initial={mode === 'reduced' ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={mode === 'reduced' ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            transition={mode === 'reduced' ? CALM : mech(0.3)}
          >
            <TerminalWindow
              title={pathOf(current)}
              shadow={false}
              actions={
                <>
                  <span className="text-[11px] text-dim tabular-nums">
                    {pad2(position)}/{pad2(total)}
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-6 items-center gap-1.5 border-2 border-line-soft px-2 text-[10px] tracking-[0.08em] text-muted uppercase transition-colors hover:border-line hover:text-accent-fg"
                  >
                    tutup <span aria-hidden>✕</span>
                  </button>
                </>
              }
              className="flex min-h-0 flex-col"
              bodyClassName="flex min-h-0 flex-col"
            >
              <div
                className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center bg-ink select-none"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  swipeStart.current = null
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.id}
                    className="flex w-full items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={mode === 'reduced' ? CALM : mech(0.2)}
                  >
                    {current.type === 'video' && current.videoUrl ? (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={current.src}
                        aria-label={current.alt}
                        className="block max-h-[calc(100svh-15rem)] w-full"
                      >
                        <source src={current.videoUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <Image
                        src={current.src}
                        alt={current.alt}
                        width={current.width}
                        height={current.height}
                        sizes="(min-width: 1200px) 1150px, 100vw"
                        className="block h-auto max-h-[calc(100svh-15rem)] w-auto max-w-full object-contain"
                        draggable={false}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-4 border-t-2 border-line p-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="min-w-0 flex-1">
                  <p id={HEADING_ID} className="text-sm leading-6 text-fg">
                    {current.caption}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-5 text-dim">
                    <time dateTime={current.tanggal}>{formatTanggal(current.tanggal)}</time>
                    <Badge variant="ghost" size="sm">
                      {current.kategori}
                    </Badge>
                  </p>
                </div>

                {total > 1 ? (
                  <div className="flex shrink-0 gap-2">
                    <StepButton direction={-1} onClick={() => onStep(-1)} />
                    <StepButton direction={1} onClick={() => onStep(1)} />
                  </div>
                ) : null}
              </div>
            </TerminalWindow>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
