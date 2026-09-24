import { Reveal } from '@/components/motion/Reveal'
import { TentorCarousel } from '@/components/sections/tentor/TentorCarousel'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { Tentor } from '@/lib/types'

type TentorTeaserProps = {
  index: number
  tentors: readonly Tentor[]
}

export function TentorTeaser({ index, tentors }: TentorTeaserProps) {

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
                semua tentor
              </ButtonLink>
            ) : undefined
          }
        />
      </Reveal>

      {tentors.length > 0 ? (
        <Reveal className="mt-10 sm:mt-12">
          <TentorCarousel tentors={tentors} />
        </Reveal>
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
