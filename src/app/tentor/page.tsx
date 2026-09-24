import type { Metadata } from 'next'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { ModulIndex } from '@/components/sections/tentor/ModulIndex'
import { TentorCard } from '@/components/sections/tentor/TentorCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getTentors } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Tentor',
  description: `Tentor ${siteConfig.name} ${siteConfig.campus.short}: mahasiswa yang memegang modul C tiap minggu, mendampingi peserta, dan menilai tugas guided.`,
  path: '/tentor',
})

const CARD_SIZES = '(min-width: 1440px) 330px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw'

export default async function TentorPage() {
  const tentors = await getTentors()
  const years = tentors.map((tentor) => tentor.angkatan)
  const modules = new Set(tentors.flatMap((tentor) => tentor.modul.map((modul) => modul.id)))

  return (
    <>
      <PageHeader
        accent="cyan"
        command="ls ~/tentor"
        eyebrow="tentor"
        title="Belajar dari kakak tingkat"
        description={
          tentors.length > 0
            ? `${tentors.length} tentor aktif. Semuanya pernah duduk di kursi yang sama — sekarang mereka yang memegang kelas tiap minggu, mendampingi peserta, dan menilai tugas guided.`
            : undefined
        }
        facts={
          tentors.length > 0
            ? [
                { label: 'tentor', value: tentors.length },
                { label: 'modul', value: modules.size },
                {
                  label: 'angkatan',
                  value: Math.min(...years) === Math.max(...years) ? Math.min(...years) : `${Math.min(...years)}..${Math.max(...years)}`,
                },
              ]
            : undefined
        }
      />

      <SectionShell accent="cyan" tone="alt" divider={false}>
        {tentors.length > 0 ? (
          <Stagger as="ul" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {tentors.map((tentor) => (
              <StaggerItem as="li" key={tentor.id}>
                <TentorCard tentor={tentor} sizes={CARD_SIZES} skills={3} as="h2" />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            accent="cyan"
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
        )}
      </SectionShell>

      {tentors.length > 0 ? (
        <SectionShell accent="cyan" tone="inverse" labelledBy="per-modul">
          <Reveal>
            <SectionHeader
              eyebrow="per modul"
              title="Nyangkut di satu modul?"
              headingId="per-modul"
              description="Setiap modul dipegang tentor penanggung jawab. Cari modulnya, lalu buka profil tentornya."
            />
          </Reveal>
          <Reveal className="mt-10">
            <ModulIndex tentors={tentors} />
          </Reveal>
        </SectionShell>
      ) : null}
    </>
  )
}
