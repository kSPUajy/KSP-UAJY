import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

export type TerminalWindowProps = {
  /** Path-style window title, e.g. `~/tentor/andi_pratama.c`. */
  title: string
  /**
   * What the title bar turns into while the window is hovered or holds focus,
   * e.g. `$ cat andi_pratama.c`. Only for windows that are links.
   */
  titleHover?: string
  /** Overrides the accent inherited from the surrounding section. */
  accent?: AccentName
  tone?: 'surface' | 'canvas' | 'code'
  /** Offset hard shadow. Off for windows that sit inside another frame. */
  shadow?: boolean
  /** Adds the press-in hover treatment. Only for windows that are links. */
  interactive?: boolean
  /** Rendered at the right edge of the title bar. */
  actions?: React.ReactNode
  className?: string
  /**
   * Replaces the body's default padding rather than adding to it. Without a
   * class merger, `p-0` placed beside the default `p-4` loses — Tailwind emits
   * `.p-0` before `.p-4` — so an override has to be a replacement.
   */
  bodyClassName?: string
  children: React.ReactNode
}

const DEFAULT_BODY = 'p-4 sm:p-6'

const TONES: Record<NonNullable<TerminalWindowProps['tone']>, string> = {
  surface: 'bg-surface',
  canvas: 'bg-canvas',
  code: 'bg-code-bg',
}

/** `[■][□][✕]` — drawn, not imported. */
function WindowControls() {
  return (
    <span aria-hidden className="flex shrink-0 items-center text-[11px] leading-none text-dim">
      <span>
        [<span className="text-accent-fg">■</span>]
      </span>
      <span>[□]</span>
      <span>[✕]</span>
    </span>
  )
}

const SWAP = 'block truncate transition-[transform,opacity] duration-200 ease-[var(--ease-mech)] motion-reduce:transition-none'

/**
 * The path rolls up and out, the command rolls in underneath it. Both lines
 * are the same height, so the bar never changes size. Focus counts as well as
 * hover: a keyboard user tabbing onto the card's link sees the same thing.
 */
function SwappingTitle({ title, titleHover }: { title: string; titleHover: string }) {
  return (
    <span className="relative min-w-0 flex-1 overflow-hidden text-[11px] leading-none">
      <span
        className={cn(
          SWAP,
          'text-dim group-hover/window:-translate-y-full group-hover/window:opacity-0',
          'group-focus-within/window:-translate-y-full group-focus-within/window:opacity-0',
        )}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={cn(
          SWAP,
          'absolute inset-0 translate-y-full text-accent-fg opacity-0',
          'group-hover/window:translate-y-0 group-hover/window:opacity-100',
          'group-focus-within/window:translate-y-0 group-focus-within/window:opacity-100',
        )}
      >
        {titleHover}
      </span>
    </span>
  )
}

/**
 * Every card in this system is a window. The title bar carries a real path so
 * the chrome says something about the content instead of just decorating it.
 */
export function TerminalWindow({
  title,
  titleHover,
  accent,
  tone = 'surface',
  shadow = true,
  interactive = false,
  actions,
  className,
  bodyClassName,
  children,
}: TerminalWindowProps) {
  return (
    <div
      data-accent={accent}
      className={cn(
        'group/window relative border-2 border-line',
        TONES[tone],
        shadow && 'hard-shadow',
        interactive && 'press-in',
        className,
      )}
    >
      <div className="flex h-8 shrink-0 items-center gap-3 border-b-2 border-line bg-surface-2 px-3">
        <WindowControls />
        {titleHover ? (
          <SwappingTitle title={title} titleHover={titleHover} />
        ) : (
          <span className="min-w-0 flex-1 truncate text-[11px] leading-none text-dim">{title}</span>
        )}
        {actions ? <span className="flex shrink-0 items-center gap-2">{actions}</span> : null}
      </div>

      <div className={bodyClassName ?? DEFAULT_BODY}>{children}</div>
    </div>
  )
}
