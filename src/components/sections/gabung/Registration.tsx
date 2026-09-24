import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import type { ButtonSize } from '@/components/ui/Button'
import { formatTanggal, formatTanggalWaktu, namaHari } from '@/lib/format'
import type { Registration } from '@/lib/types'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/site.config'

/**
 * The one primary action for joining, whatever the round is doing.
 *
 * While registration is open it goes to the form. Outside a round it points
 * at the weekly challenge instead — the one thing anyone on campus can do
 * today without being a member, and the door most members came in through.
 * A closed form behind a "daftar sekarang" button would be the worst of both.
 */
export function RegisterButton({ registration, size = 'lg' }: { registration: Registration; size?: ButtonSize }) {
  if (registration.status === 'buka') {
    return (
      <ButtonAnchor href={siteConfig.joinFormUrl} size={size}>
        daftar sekarang
        <span aria-hidden>↗</span>
        <span className="sr-only">(formulir, membuka tab baru)</span>
      </ButtonAnchor>
    )
  }

  return (
    <ButtonLink href="/challenge" size={size}>
      coba challenge dulu
    </ButtonLink>
  )
}

const when = (iso: string): string => `${namaHari(iso)}, ${formatTanggalWaktu(iso)}`

/**
 * Where the round stands, as one status line: an LED and a sentence. Open
 * rounds show the closing time to the minute; the others only need the day.
 */
export function RegistrationStatusLine({
  registration,
  className,
}: {
  registration: Registration
  className?: string
}) {
  const { status, buka, tutup } = registration

  const [label, text] =
    status === 'buka'
      ? ['dibuka', `Pendaftaran dibuka sampai ${when(tutup)}.`]
      : status === 'segera'
        ? ['segera', `Pendaftaran gelombang berikutnya dibuka ${namaHari(buka)}, ${formatTanggal(buka)}.`]
        : tutup
          ? [
              'ditutup',
              `Pendaftaran gelombang ini ditutup ${formatTanggal(tutup)}. Gelombang berikutnya diumumkan di halaman berita.`,
            ]
          : ['ditutup', 'Belum ada gelombang pendaftaran yang dijadwalkan. Jadwalnya diumumkan di halaman berita.']

  return (
    <p className={cn('flex items-start gap-3 text-[12px] leading-6', className)}>
      <span
        aria-hidden
        className={cn(
          'mt-[7px] block h-2.5 w-2.5 shrink-0 border-2 border-line',
          status === 'buka' ? 'bg-accent' : 'bg-transparent',
        )}
      />
      <span>
        <span className="font-display text-[10px] tracking-[0.14em] text-accent-fg uppercase">{label}</span>
        <span className="text-muted"> — {text}</span>
      </span>
    </p>
  )
}
