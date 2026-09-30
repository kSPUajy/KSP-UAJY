import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import type { ButtonSize } from '@/components/ui/Button'
import type { Registration, RegistrationTrack } from '@/lib/types'
import { cn } from '@/lib/utils'

/** `Bahasa C`, `Bahasa C dan Blockchain`, `Bahasa C, Blockchain, dan Java`. */
export function listNames(names: readonly string[]): string {
  if (names.length <= 2) return names.join(' dan ')
  return `${names.slice(0, -1).join(', ')}, dan ${names[names.length - 1]}`
}

/**
 * The primary action for joining, whatever registration is doing.
 *
 * One "daftar" button per open class that has a form. With none, it points
 * at the weekly challenge instead: the one thing anyone on campus can do
 * today without being a member, and the door most members came in through.
 * A closed form behind a "daftar sekarang" button would be the worst of both.
 */
export function RegisterButton({ registration, size = 'lg' }: { registration: Registration; size?: ButtonSize }) {
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

  return (
    <ButtonLink href="/challenge" size={size}>
      coba challenge dulu
    </ButtonLink>
  )
}

/** Where registration stands, as one status line: an LED and a sentence. */
export function RegistrationStatusLine({
  registration,
  className,
}: {
  registration: Registration
  className?: string
}) {
  const open = registration.open.length > 0
  const text = open
    ? `Pendaftaran kelas ${listNames(registration.open.map((track) => track.nama))} sedang dibuka.`
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
