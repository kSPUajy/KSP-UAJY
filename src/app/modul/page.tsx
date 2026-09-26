import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { CurrentModul, CurrentSesi } from '@/components/sections/modul/CurrentModul'
import { ModulTimeline } from '@/components/sections/modul/ModulTimeline'
import { modulRelease } from '@/components/sections/modul/modul-format'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getTimeline } from '@/lib/data'
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
  const entries = await getTimeline()
  const modules = entries.flatMap((entry) => (entry.jenis === 'modul' ? [entry] : []))

  // This week's row — a module, or a session such as Games.
  const current = entries.find((entry) => entry.status === 'berjalan') ?? null
  const currentModul = current?.jenis === 'modul' ? current : null
  const released = modules.filter((modul) => modul.status !== 'terkunci').length
  const first = entries[0]
  const notStarted = entries.every((entry) => entry.status === 'terkunci')
  const upcoming = entries.find((entry) => entry.status === 'terkunci')

  return (
    <>
      <PageHeader
        accent="cyan"
        command="ls ~/modul"
        eyebrow="modul"
        title="Modul mingguan"
        description={
          modules.length > 0
            ? 'Dari flowchart sampai array of record, dua pertemuan untuk tiap modul — Senin dan Selasa. Setiap modul dilengkapi materi dan tugas guided yang didampingi tentor.'
            : undefined
        }
        facts={
          modules.length > 0
            ? [
                { label: 'modul', value: modules.length },
                { label: 'minggu_ini', value: currentModul ? pad2(currentModul.minggu) : current ? current.judul.toLowerCase() : '—' },
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
              {currentModul ? (
                <CurrentModul modul={currentModul} total={modules.length} />
              ) : current?.jenis === 'sesi' ? (
                <CurrentSesi sesi={current} />
              ) : (
                <EmptyState
                  accent="cyan"
                  command="cat ~/modul/minggu-ini"
                  output={notStarted ? 'cat: belum ada modul yang dibuka' : upcoming ? 'jeda' : 'EOF'}
                  title={notStarted ? 'Semester belum dimulai' : upcoming ? 'Minggu ini tidak ada modul baru' : 'Semua modul sudah selesai'}
                  description={
                    notStarted && first
                      ? `Modul pertama dibuka ${modulRelease(first)}.`
                      : upcoming
                        ? `Modul berikutnya, ${upcoming.judul}, dibuka ${modulRelease(upcoming)}. Modul yang sudah lewat tetap bisa dibuka di bawah.`
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
              <ModulTimeline entries={entries} />
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
