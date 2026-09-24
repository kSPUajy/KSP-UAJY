import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { TentorCard } from '@/components/sections/tentor/TentorCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { Tentor } from '@/lib/types'

type TentorTeaserProps = {
  index: number
  tentors: readonly Tentor[]
  /** How many cards the teaser shows. */
  limit?: number
}

const SIZES = '(min-width: 1440px) 330px, (min-width: 1024px) 23vw, 46vw'

export function TentorTeaser({ index, tentors, limit = 4 }: TentorTeaserProps) {
  const shown = tentors.slice(0, limit)
  const rest = tentors.length - shown.length

  return (
    <SectionShell accent="cyan" tone="inverse" labelledBy="tentor-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="tentor"
          title="Yang berdiri di depan kelas"
          headingId="tentor-title"
          description={
            tentors.length > 0
              ? `${tentors.length} tentor aktif. Semuanya mahasiswa yang dulu duduk di kursi yang sama — dan masih ingat rasanya segfault pertama.`
              : undefined
          }
          actions={
            tentors.length > 0 ? (
              <ButtonLink href="/tentor" variant="outline" size="sm">
                {rest > 0 ? `semua tentor (+${rest})` : 'semua tentor'}
              </ButtonLink>
            ) : undefined
          }
        />
      </Reveal>

      {shown.length > 0 ? (
        <Stagger className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 sm:mt-12 sm:gap-6 lg:grid-cols-4">
          {shown.map((tentor) => (
            <StaggerItem key={tentor.id}>
              <TentorCard tentor={tentor} sizes={SIZES} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Reveal className="mt-10">
          <EmptyState
            command="ls ~/tentor"
            output="0 berkas"
            title="Daftar tentor sedang disusun"
            description="Tentor untuk semester ini diumumkan setelah sesi perkenalan anggota baru. Kelas tetap berjalan seperti biasa."
            action={
              <ButtonLink href="/gabung" variant="outline" size="sm">
                cara bergabung
              </ButtonLink>
            }
          />
        </Reveal>
      )}
    </SectionShell>
  )
}
