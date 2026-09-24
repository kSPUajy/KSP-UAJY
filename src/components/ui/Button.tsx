import Link from 'next/link'

import { cn } from '@/lib/utils'

export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

type StyleProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

const BASE =
  'inline-flex select-none items-center justify-center gap-2 border-2 font-mono font-medium uppercase tracking-[0.08em] whitespace-nowrap disabled:pointer-events-none disabled:opacity-45'

const VARIANTS: Record<ButtonVariant, string> = {
  // Shadow reads as --line here because an accent shadow under an accent fill
  // would be invisible.
  solid: 'border-line bg-accent text-accent-ink press-pop hard-shadow-line',
  outline: 'border-line bg-surface text-fg press-pop hard-shadow',
  ghost: 'border-transparent bg-transparent text-muted hover:border-line-soft hover:text-fg',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[11px]',
  md: 'h-10 px-4 text-xs',
  lg: 'h-12 px-6 text-sm',
}

function buttonClass({ variant = 'solid', size = 'md', className }: StyleProps): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}

/**
 * These are server components on purpose. The press is a CSS transform on
 * `:active` with an overshoot ease, which costs no client JavaScript and still
 * flattens correctly under `prefers-reduced-motion`.
 */
export function Button({
  variant,
  size,
  className,
  ...props
}: StyleProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClass({ variant, size, className })} {...props} />
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & React.ComponentPropsWithoutRef<typeof Link>) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />
}

/** Outbound links: same shape, plus the attributes an external target needs. */
export function ButtonAnchor({
  variant,
  size,
  className,
  ...props
}: StyleProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={buttonClass({ variant, size, className })}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    />
  )
}
