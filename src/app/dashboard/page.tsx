import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { SignOutButton } from '@/components/sections/akun/SignOutButton'
import { modulRange } from '@/components/sections/modul/modul-format'
import { StateBadge, TugasPanel } from '@/components/sections/tugas/TugasPanel'
import { TugasList } from '@/components/sections/tugas/TugasList'
import { ButtonLink } from '@/components/ui/Button'
import { OnlineCount } from '@/components/layout/OnlinePresence'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { StructBlock } from '@/components/ui/StructBlock'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { getMySubmissions } from '@/lib/tugas/data'
import { tugasItems } from '@/lib/tugas/status'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Dashboard',
  description: 'Dashboard anggota Kelompok Studi Pemrograman.',
  path: '/dashboard',
  noindex: true,
})

/**
 * The member's week: this week's guided task up top, ready to hand in; every
 * week below it with its status and grade; the account at the bottom.
 */
export default async function DashboardPage() {
  const profile = await requireProfile('/dashboard')
  const [modules, submissions] = await Promise.all([getModules(), getMySubmissions(profile.id)])

  const items = tugasItems(modules, submissions)
  const released = items.filter((item) => item.state !== 'terkunci')
  const handedIn = released.filter((item) => item.submission !== null).length
  const grades = released.flatMap((item) => (item.submission?.nilai != null ? [item.submission.nilai] : []))
  const average = grades.length > 0 ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length) : null

  const focus = items.find((item) => item.modul.status === 'berjalan') ?? released[released.length - 1] ?? null

  return (
    <>
      <PageHeader
        accent="lime"
        command={`whoami  # ${profile.npm}`}
        eyebrow="dashboard"
        title={`Halo, ${profile.nama.split(' ')[0]}`}
        description="Tugas guided minggu ini, semua tugasmu, dan nilai dari tentor."
        facts={[
          { label: 'terkumpul', value: `${handedIn}/${released.length}` },
          { label: 'dinilai', value: grades.length },
          ...(average !== null ? [{ label: 'rata_rata', value: average }] : []),
          { label: 'online', value: <OnlineCount /> },
        ]}
      />

      {focus ? (
        <SectionShell accent="lime" tone="tint" divider={false} labelledBy="tugas-minggu-ini">
          <Reveal>
            <SectionHeader
              eyebrow={focus.modul.status === 'berjalan' ? 'minggu ini' : 'tugas terakhir'}
              title="Tugas guided"
              headingId="tugas-minggu-ini"
            />
          </Reveal>
          <Reveal className="mt-10">
            <TerminalWindow
              title={`~/tugas/minggu-${pad2(focus.modul.minggu)}`}
              bodyClassName="p-5 sm:p-8"
              actions={<StateBadge state={focus.state} />}
            >
              <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
                {`// minggu ${pad2(focus.modul.minggu)} · ${modulRange(focus.modul)}`}
              </p>
              <h3 className="mt-4 text-[clamp(1.375rem,3vw,1.875rem)] leading-tight font-bold tracking-tight text-fg">
                {focus.modul.judul}
              </h3>
              <div className="mt-6">
                <TugasPanel item={focus} />
              </div>
            </TerminalWindow>
          </Reveal>
        </SectionShell>
      ) : null}

      <SectionShell accent="lime" tone="canvas" labelledBy="semua-tugas">
        <Reveal>
          <SectionHeader
            eyebrow="semua minggu"
            title="Tugasmu"
            headingId="semua-tugas"
            description="Tugas yang belum dinilai masih bisa diganti kapan saja. Setelah tenggat lewat, pengumpulan tetap diterima tapi ditandai terlambat."
          />
        </Reveal>
        <div className="mt-10 max-w-4xl">
          <TugasList items={items} />
        </div>
      </SectionShell>

      <SectionShell accent="lime" tone="alt" labelledBy="akun">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <div>
            <SectionHeader eyebrow="akun" title="Akunmu" headingId="akun" />
            <StructBlock
              className="mt-8"
              type="anggota"
              name={`npm_${profile.npm}`}
              label="Akun"
              fields={[
                { key: 'nama', value: profile.nama },
                { key: 'npm', value: profile.npm },
                { key: 'peran', value: profile.role, kind: 'ident' },
                ...(profile.angkatan ? [{ key: 'angkatan', value: profile.angkatan }] : []),
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-3 lg:pt-16">
            {profile.role === 'admin' ? (
              <ButtonLink href="/admin" size="sm">
                panel admin
              </ButtonLink>
            ) : null}
            {profile.role !== 'anggota' ? (
              <ButtonLink href="/penilaian" size="sm" variant={profile.role === 'admin' ? 'outline' : 'solid'}>
                penilaian
              </ButtonLink>
            ) : null}
            <ButtonLink href="/modul" variant="outline" size="sm">
              lihat modul
            </ButtonLink>
            <ButtonLink href="/masuk/ganti-password?next=/dashboard" variant="outline" size="sm">
              ganti password
            </ButtonLink>
            <SignOutButton />
          </div>
        </div>
      </SectionShell>
    </>
  )
}
