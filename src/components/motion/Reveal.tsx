'use client'

import { motion } from 'motion/react'

import {
  REVEAL_VIEWPORT,
  enterLabel,
  revealVariants,
  staggerParent,
} from '@/components/motion/variants'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'

type RevealProps = {
  /** Seconds to hold before this element starts. */
  delay?: number
  className?: string
  children: React.ReactNode
}

/**
 * Scroll reveal: 16px rise plus a fade, fired once, 80px before the element
 * reaches the viewport edge. Under reduced motion it becomes a 140ms opacity
 * fade with no transform at all.
 *
 * Nothing reveals until the motion preference is known (`enterLabel` holds
 * at `hidden` while it is pending), so an element already in view at load
 * never starts a full-motion rise that reduced motion could not cancel.
 *
 * `data-reveal` is the hook the root layout's <noscript> styles use to show
 * the content when no JavaScript will ever run the reveal.
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  const mode = useMotionMode()

  return (
    <motion.div
      data-reveal
      variants={revealVariants}
      custom={delay}
      initial="hidden"
      whileInView={enterLabel(mode)}
      viewport={REVEAL_VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  )
}

type StaggerProps = {
  /** Seconds between children. */
  stagger?: number
  delayChildren?: number
  /** Render as a list when the items are one, so they can be `<li>`s. */
  as?: 'div' | 'ul' | 'ol'
  className?: string
  children: React.ReactNode
}

const STAGGER_ELEMENT = { div: motion.div, ul: motion.ul, ol: motion.ol } as const

/**
 * Parent for a run of `StaggerItem`s. The children must not carry their own
 * `whileInView` — the parent owns the trigger and hands each one its turn.
 * Under reduced motion they all arrive together.
 */
export function Stagger({
  stagger = 0.06,
  delayChildren = 0,
  as = 'div',
  className,
  children,
}: StaggerProps) {
  const mode = useMotionMode()
  const Element = STAGGER_ELEMENT[as]

  return (
    <Element
      variants={staggerParent(stagger, delayChildren)}
      initial="hidden"
      whileInView={enterLabel(mode)}
      viewport={REVEAL_VIEWPORT}
      className={className}
    >
      {children}
    </Element>
  )
}

const ITEM_ELEMENT = { div: motion.div, li: motion.li } as const

export function StaggerItem({
  as = 'div',
  className,
  children,
}: {
  /** `li` inside a `Stagger` rendered as a list. */
  as?: 'div' | 'li'
  className?: string
  children: React.ReactNode
}) {
  const Element = ITEM_ELEMENT[as]

  return (
    <Element data-reveal variants={revealVariants} className={className}>
      {children}
    </Element>
  )
}
