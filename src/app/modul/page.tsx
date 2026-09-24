import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { CurrentModul } from '@/components/sections/modul/CurrentModul'
import { ModulTimeline } from '@/components/sections/modul/ModulTimeline'
import { modulRelease } from '@/components/sections/modul/modul-format'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getModules } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { pad2 } from '@/lib/utils'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Modul',
  description: `Modul kelas mingguan ${siteConfig.name} ${siteConfig.campus.short}: dari flowchart sampai array of record, satu modul setiap minggu.`,
  path: '/modul',
})

/** Which module is this week's depends on the clock; regenerate hourly. */
export const revalidate = 3600

export default async function ModulPage() {
  const modules = await getModules()

  const current = modules.find((modul) => modul.status === 'berjalan') ?? null
  const released = modules.filter((modul) => modul.status !== 'terkunci').length
  const first = modules[0]
  const notStarted = released === 0

  return (
    <>
      <PageHeader
        accent="cyan"
        command="ls ~/modul"
        eyebrow="modul"
        title="Modul mingguan"
        description={
          modules.length > 0
            ? 'Satu modul setiap minggu, dari flowchart sampai array of record. Modul terbuka setiap Senin, dan halaman ini berpindah sendiri ke minggu yang sedang berjalan.'
            : undefined
        }
        facts={
          modules.length > 0
            ? [
                { label: 'modul', value: modules.length },
                { label: 'minggu_ini', value: current ? pad2(current.minggu) : '—' },
                { label: 'terbuka', value: `${released}/${modules.length}` },
              ]
            : undefined
        }
      />

      {modules.length > 0 ? (
        <>
          <SectionShell accent="cyan" tone="tint" divider={false} labelledBy="minggu-ini">
            <Reveal>
              <SectionHeader eyebrow="minggu ini" title="Yang sedang dipelajari" headingId="minggu-ini" />
            </Reveal>
            <Reveal className="mt-10">
              {current ? (
                <CurrentModul modul={current} total={modules.length} />
              ) : (
                <EmptyState
                  accent="cyan"
                  command="cat ~/modul/minggu-ini"
                  output={notStarted ? 'cat: belum ada modul yang dibuka' : 'EOF'}
                  title={notStarted ? 'Semester belum dimulai' : 'Semua modul sudah selesai'}
                  description={
                    notStarted && first
                      ? `Modul pertama dibuka ${modulRelease(first)}.`
                      : 'Seluruh modul semester ini sudah dibagikan. Arsipnya tetap bisa dibuka di bawah.'
                  }
                />
              )}
            </Reveal>
          </SectionShell>

          <SectionShell accent="cyan" tone="canvas" labelledBy="semua-modul">
            <Reveal>
              <SectionHeader
                eyebrow="timeline"
                title="Satu semester, minggu demi minggu"
                headingId="semua-modul"
                description="Modul yang sudah lewat tetap terbuka untuk diulang. Yang belum tiba menunjukkan kapan dibuka."
              />
            </Reveal>
            <Reveal className="mt-10 max-w-4xl">
              <ModulTimeline modules={modules} />
            </Reveal>
          </SectionShell>
        </>
      ) : (
        <SectionShell accent="cyan" tone="tint" divider={false}>
          <EmptyState
            accent="cyan"
            command="ls ~/modul"
            output="0 berkas"
            title="Jadwal modul sedang disusun"
            description="Jadwal modul semester ini diumumkan setelah sesi perkenalan anggota baru."
          />
        </SectionShell>
      )}
    </>
  )
}
