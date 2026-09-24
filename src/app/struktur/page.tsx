import type { Metadata } from 'next'

import { StrukturExplorer } from '@/components/sections/struktur/StrukturExplorer'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getMemberTree, getMembers, getTentors, getWinnerProfiles } from '@/lib/data'
import { slugify } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { buildOrgTree } from '@/lib/org'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Struktur',
  description: `Struktur organisasi ${siteConfig.name} ${siteConfig.campus.short}: pengurus inti dan divisi akademik, media, serta acara.`,
  path: '/struktur',
})

export default async function StrukturPage() {
  const [tree, members, tentors, winners] = await Promise.all([
    getMemberTree(),
    getMembers(),
    getTentors(),
    getWinnerProfiles(),
  ])

  const roots = buildOrgTree(tree, {
    tentorSlugs: new Set(tentors.map((tentor) => tentor.slug)),
    hallOfFameSlugs: new Set(winners.map((winner) => winner.slug)),
  })
  const [root] = roots

  const years = members.map((member) => member.angkatan)
  // Every report of the root outside its own division heads a division.
  const divisions = root ? root.children.filter((child) => child.divisi !== root.divisi) : []

  return (
    <>
      <PageHeader
        accent="violet"
        command="cd ~/struktur"
        eyebrow="struktur"
        title="Siapa mengurus apa"
        description={
          members.length > 0
            ? `${members.length} orang yang menjaga kelas, challenge, dan dokumentasi tetap jalan tiap minggu. Pilih siapa pun untuk membuka detailnya — atau ganti tampilan ke tree kalau lebih suka membaca daftar.`
            : undefined
        }
        facts={
          members.length > 0
            ? [
                { label: 'pengurus', value: members.length },
                { label: 'divisi', value: divisions.length },
                { label: 'angkatan', value: `${Math.min(...years)}..${Math.max(...years)}` },
              ]
            : undefined
        }
      />

      <SectionShell accent="violet" tone="tint" divider={false}>
        {root ? (
          <StrukturExplorer roots={roots} rootLabel={slugify(siteConfig.name)} />
        ) : (
          <EmptyState
            accent="violet"
            command="tree ~/struktur"
            output="0 directories, 0 files"
            title="Kepengurusan sedang disusun"
            description="Susunan pengurus periode ini diumumkan setelah rapat pleno. Sementara itu, kelas dan challenge tetap berjalan seperti biasa."
            action={
              <ButtonLink href="/berita" variant="outline" size="sm">
                cek pengumuman
              </ButtonLink>
            }
          />
        )}
      </SectionShell>
    </>
  )
}
