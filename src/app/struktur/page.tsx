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
import type { OrgBranch } from '@/lib/org'
import { pad2 } from '@/lib/utils'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Struktur',
  description: `Struktur organisasi ${siteConfig.name} ${siteConfig.campus.short}: pengurus harian serta divisi kominfo dan USDA.`,
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

  // The tentors hang off whoever coordinates them.
  const coordinator = members.find((member) => /^koordinator tentor$/i.test(member.jabatan))
  const branch: OrgBranch | undefined =
    coordinator && tentors.length > 0
      ? {
          parentId: coordinator.id,
          label: 'tentor',
          items: tentors.map((tentor) => ({
            id: tentor.id,
            nama: tentor.nama,
            slug: tentor.slug,
            foto: tentor.foto,
            modul: tentor.modul.map((modul) => `M${pad2(modul.minggu)}`),
          })),
        }
      : undefined

  const years = members.map((member) => member.angkatan)
  // Every report of the root outside its own division heads a division.
  const divisions = root ? root.children.filter((child) => child.divisi !== root.divisi) : []

  return (
    <>
      <PageHeader
        accent="violet"
        command="cd ~/struktur"
        eyebrow="struktur"
        title="Orang-orang di balik KSP"
        description={
          members.length > 0
            ? `${members.length} pengurus yang bekerja di balik layar supaya kelas, kabar, dan kegiatan KSP tetap berjalan setiap minggu — dari pengurus harian, kominfo, sampai USDA. Klik salah satu nama untuk mengenal perannya, atau ganti ke tampilan tree untuk melihat semuanya sekaligus.`
            : undefined
        }
        facts={
          members.length > 0
            ? [
                { label: 'pengurus', value: members.length },
                ...(tentors.length > 0 ? [{ label: 'tentor', value: tentors.length }] : []),
                ...(divisions.length > 0 ? [{ label: 'divisi', value: divisions.length }] : []),
                {
                  label: 'angkatan',
                  value:
                    Math.min(...years) === Math.max(...years)
                      ? Math.min(...years)
                      : `${Math.min(...years)}..${Math.max(...years)}`,
                },
              ]
            : undefined
        }
      />

      <SectionShell accent="violet" tone="tint" divider={false}>
        {root ? (
          <StrukturExplorer roots={roots} rootLabel={slugify(siteConfig.name)} branch={branch} />
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
