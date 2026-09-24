import type { Metadata } from 'next'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { CourseIndex } from '@/components/sections/tentor/CourseIndex'
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
  description: `Tentor ${siteConfig.name} ${siteConfig.campus.short}: mahasiswa yang memegang kelas C, mendampingi peserta, dan menulis soal challenge mingguan.`,
  path: '/tentor',
})

const CARD_SIZES = '(min-width: 1440px) 330px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw'

export default async function TentorPage() {
  const tentors = await getTentors()
  const years = tentors.map((tentor) => tentor.angkatan)
  const courses = new Set(tentors.flatMap((tentor) => tentor.mataKuliahBinaan))

  return (
    <>
      <PageHeader
        accent="cyan"
        command="ls ~/tentor"
        eyebrow="tentor"
        title="Belajar dari kakak tingkat"
        description={
          tentors.length > 0
            ? `${tentors.length} tentor aktif, angkatan ${Math.min(...years)} sampai ${Math.max(...years)}. Semuanya pernah duduk di kursi yang sama — sekarang mereka yang memegang kelas, mendampingi peserta, dan menulis soal challenge.`
            : undefined
        }
        facts={
          tentors.length > 0
            ? [
                { label: 'tentor', value: tentors.length },
                { label: 'mata_kuliah', value: courses.size },
                { label: 'angkatan', value: `${Math.min(...years)}..${Math.max(...years)}` },
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
        <SectionShell accent="cyan" tone="inverse" labelledBy="per-mata-kuliah">
          <Reveal>
            <SectionHeader
              eyebrow="per mata kuliah"
              title="Nyangkut di satu mata kuliah?"
              headingId="per-mata-kuliah"
              description="Setiap tentor memegang mata kuliah binaan. Cari mata kuliahmu, lalu buka profil tentornya."
            />
          </Reveal>
          <Reveal className="mt-10">
            <CourseIndex tentors={tentors} />
          </Reveal>
        </SectionShell>
      ) : null}
    </>
  )
}
