import { Reveal } from '@/components/motion/Reveal'
import { TentorSurveillance } from '@/components/sections/home/TentorSurveillance'
import { TentorTop } from '@/components/sections/home/TentorTop'
import type { TopRow, TopStat } from '@/components/sections/home/TentorTop'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { formatTanggalPendek } from '@/lib/format'
import type { Tentor, TimelineEntry } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type TentorTeaserProps = {
  index: number
  tentors: readonly Tentor[]
  /** The module schedule: decides who is teaching this week. */
  schedule: readonly TimelineEntry[]
}

const ORDER: Record<TopStat, number> = { R: 0, S: 1, Z: 2, I: 3 }

/**
 * Each tentor as a process whose state comes from the schedule: running if
 * one of their modules is this week's, sleeping until the next one, a zombie
 * once all of theirs are done.
 */
function toRows(tentors: readonly Tentor[], schedule: readonly TimelineEntry[]): TopRow[] {
  const byId = new Map(schedule.flatMap((entry) => (entry.jenis === 'modul' ? [[entry.id, entry] as const] : [])))

  return tentors
    .map((tentor, index): TopRow => {
      const entries = tentor.modul.flatMap((modul) => {
        const entry = byId.get(modul.id)
        return entry ? [entry] : []
      })
      const running = entries.find((entry) => entry.status === 'berjalan')
      const next = entries
        .filter((entry) => entry.status === 'terkunci')
        .sort((a, b) => a.rilis.localeCompare(b.rilis))[0]
      const label = (entry: { minggu: number }) => `M${pad2(entry.minggu)}`

      const stat: TopStat = running ? 'R' : next ? 'S' : entries.length > 0 ? 'Z' : 'I'
      const command = running
        ? `teach --modul=${label(running)} "${running.judul}"`
        : next
          ? `sleep --until="${formatTanggalPendek(next.rilis)}"  # ${label(next)}`
          : entries.length > 0
            ? `exit 0  # ${entries.map(label).join(', ')} selesai`
            : 'wait  # menunggu penugasan'

      return {
        id: tentor.id,
        pid: 101 + index,
        nama: tentor.nama,
        slug: tentor.slug,
        foto: tentor.foto,
        stat,
        modul: tentor.modul.map((modul) => `M${pad2(modul.minggu)} ${modul.judul}`),
        command,
        search: [
          tentor.nama,
          ...tentor.modul.flatMap((modul) => [`m${pad2(modul.minggu)}`, modul.judul]),
          ...tentor.keahlian,
        ]
          .join(' ')
          .toLowerCase(),
        // Carried for sorting sleepers by who wakes first.
        ...(next ? { wake: next.rilis } : {}),
      }
    })
    .sort(
      (a, b) =>
        ORDER[a.stat] - ORDER[b.stat] ||
        ((a as TopRow & { wake?: string }).wake ?? '').localeCompare((b as TopRow & { wake?: string }).wake ?? '') ||
        a.pid - b.pid,
    )
}

export function TentorTeaser({ index, tentors, schedule }: TentorTeaserProps) {
  const rows = toRows(tentors, schedule)
  const modules = schedule.filter((entry) => entry.jenis === 'modul')
  const current = schedule.find((entry) => entry.status === 'berjalan')
  const done = modules.filter((entry) => entry.status !== 'terkunci').length
  const load = current
    ? current.jenis === 'modul'
      ? `modul ${pad2(current.minggu)}/${pad2(modules.length)} · ${current.judul}`
      : `${current.judul} — tanpa modul minggu ini`
    : 'jeda — tidak ada kelas minggu ini'

  return (
    <SectionShell accent="cyan" tone="paper" labelledBy="tentor-title">
      {tentors.length > 0 ? (
        <TentorSurveillance
          targets={rows.map((row) => ({
            id: row.id,
            pid: row.pid,
            nama: row.nama,
            foto: row.foto,
            running: row.stat === 'R',
          }))}
        />
      ) : null}

      <Reveal>
        <div data-surveil-avoid="content">
          <SectionHeader
            index={index}
            eyebrow="tentor"
            title="Yang berdiri di depan kelas"
            headingId="tentor-title"
            description={
              tentors.length > 0
                ? `${tentors.length} tentor aktif. Semuanya mahasiswa yang dulu duduk di kursi yang sama — dan masih ingat rasanya pertama kali programnya error.`
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
        </div>
      </Reveal>

      {tentors.length > 0 ? (
        <Reveal className="mt-10 sm:mt-12">
          <div data-surveil-avoid className="relative">
            <TentorTop rows={rows} load={load} progress={{ done, total: modules.length }} />
          </div>
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
