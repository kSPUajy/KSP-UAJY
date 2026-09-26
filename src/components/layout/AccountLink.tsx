'use client'

import Link from 'next/link'

import { useSignedIn } from '@/lib/hooks/useSignedIn'
import { cn } from '@/lib/utils'

type AccountLinkProps = {
  /** `sm` sits in the nav bar; `lg` fills the width of the mobile menu. */
  size?: 'sm' | 'lg'
  onNavigate?: () => void
}

const SIZES = {
  sm: 'h-8 px-2.5 text-[11px]',
  lg: 'h-12 w-full justify-center px-4 text-xs',
} as const

/**
 * `login` for visitors, `dashboard` once signed in. The server renders
 * `login`; a signed-in browser swaps the label right after hydration.
 */
export function AccountLink({ size = 'sm', onNavigate }: AccountLinkProps) {
  const signedIn = useSignedIn()

  return (
    <Link
      href={signedIn ? '/dashboard' : '/masuk'}
      onClick={onNavigate}
      className={cn(
        'inline-flex items-center gap-1.5 border-2 border-line-soft tracking-[0.06em] text-muted transition-colors hover:border-line hover:text-fg',
        SIZES[size],
      )}
    >
      <span aria-hidden className="text-accent-fg">
        {signedIn ? '~' : '>'}
      </span>
      {signedIn ? 'dashboard' : 'login'}
    </Link>
  )
}
