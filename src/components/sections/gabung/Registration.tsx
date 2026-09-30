import Link from 'next/link'

import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import type { ButtonSize } from '@/components/ui/Button'
import type { Registration, RegistrationTrack } from '@/lib/types'
import { cn } from '@/lib/utils'

/** C's registration page is /gabung itself; every other class has its own. */
export const KELAS_C = 'c'

export const pendaftaranHref = (id: string): string => (id === KELAS_C ? '/gabung' : `/gabung/${id}`)

/** Registration narrowed to one class, for that class's own page. */
export function onlyClass(registration: Registration, id: string): Registration {
  return {
    tracks: registration.tracks.filter((track) => track.id === id),
    open: registration.open.filter((track) => track.id === id),
  }
}

/** `Bahasa C`, `Bahasa C dan Blockchain`, `Bahasa C, Blockchain, dan Java`. */
export function listNames(names: readonly string[]): string {
  if (names.length <= 2) return names.join(' dan ')
  return `${names.slice(0, -1).join(', ')}, dan ${names[names.length - 1]}`
}

/**
 * The primary action for joining, whatever registration is doing.
 *
 * One "daftar" button per open class that has a form. With none, it points
 * at the weekly challenge instead (the `challenge` fallback): the one thing
 * anyone on campus can do today without being a member, and the door most
 * members came in through. A closed form behind a "daftar sekarang" button
 * would be the worst of both.
 */
export function RegisterButton({
  registration,
  size = 'lg',
  fallback = 'challenge',
}: {
  registration: Registration
  size?: ButtonSize
  fallback?: 'challenge' | 'none'
}) {
  const forms = registration.open.filter((track): track is RegistrationTrack & { link: string } => track.link !== null)

  if (forms.length > 0) {
    return (
      <>
        {forms.map((track) => (
          <ButtonAnchor key={track.id} href={track.link} size={size}>
            daftar kelas {track.nama}
            <span aria-hidden>↗</span>
            <span className="sr-only">(formulir, membuka tab baru)</span>
          </ButtonAnchor>
        ))}
      </>
    )
  }

  if (fallback === 'none') return null
  return (
    <ButtonLink href="/challenge" size={size}>
      coba challenge dulu
    </ButtonLink>
  )
}

/**
 * Where registration stands, as one status line: an LED and a sentence.
 * Given one class (`onlyClass`), it speaks for that class alone.
 */
export function RegistrationStatusLine({
  registration,
  className,
}: {
  registration: Registration
  className?: string
}) {
  const open = registration.open.length > 0
  const single = registration.tracks.length === 1 ? registration.tracks[0] : undefined
  const text = open
    ? `Pendaftaran kelas ${listNames(registration.open.map((track) => track.nama))} sedang dibuka.`
    : single
      ? `Pendaftaran kelas ${single.nama} sedang tidak dibuka. Info pendaftaran berikutnya diumumkan di halaman berita.`
      : 'Tidak ada pendaftaran yang sedang dibuka. Info pendaftaran berikutnya diumumkan di halaman berita.'

  return (
    <p className={cn('flex items-start gap-3 text-[12px] leading-6', className)}>
      <span
        aria-hidden
        className={cn('mt-[7px] block h-2.5 w-2.5 shrink-0 border-2 border-line', open ? 'bg-accent' : 'bg-transparent')}
      />
      <span>
        <span className="font-display text-[10px] tracking-[0.14em] text-accent-fg uppercase">
          {open ? 'dibuka' : 'ditutup'}
        </span>
        <span className="text-muted"> — {text}</span>
      </span>
    </p>
  )
}

/** On one class's page: the other classes taking sign-ups, each a way to its own page. */
export function OtherOpenClasses({
  registration,
  except,
  className,
}: {
  registration: Registration
  except: string
  className?: string
}) {
  const others = registration.open.filter((track) => track.id !== except)
  if (others.length === 0) return null

  return (
    <p className={cn('text-[12px] leading-6 text-muted', className)}>
      Sedang dibuka juga:{' '}
      {others.map((track, position) => (
        <span key={track.id}>
          {position > 0 ? ', ' : null}
          <Link
            href={pendaftaranHref(track.id)}
            className="text-accent-fg underline decoration-2 underline-offset-4 hover:text-fg"
          >
            kelas {track.nama} <span aria-hidden>→</span>
          </Link>
        </span>
      ))}
    </p>
  )
}
