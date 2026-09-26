import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { Stat } from '@/components/ui/Stat'
import { StructBlock } from '@/components/ui/StructBlock'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { AccentName } from '@/lib/accent'
import { getAboutInfo, getStats } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { pad2 } from '@/lib/utils'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Tentang',
  description: `Tentang ${siteConfig.name} ${siteConfig.campus.short}: komunitas belajar bahasa C dengan tentor sebaya, challenge mingguan, dan kelas rutin tiap Senin dan Selasa.`,
  path: '/tentang',
})

type Shortcut = {
  href: string
  path: string
  deskripsi: string
  accent: AccentName
}

/** Where to go next, each in the accent of the page it opens. */
const SHORTCUTS: readonly Shortcut[] = [
  { href: '/struktur', path: '~/struktur', deskripsi: 'Orang-orang di balik KSP, per divisi.', accent: 'violet' },
  { href: '/tentor', path: '~/tentor', deskripsi: 'Kakak tingkat yang memegang kelas.', accent: 'cyan' },
  { href: '/challenge', path: '~/challenge', deskripsi: 'Satu soal C tiap Senin.', accent: 'magenta' },
  { href: '/gabung', path: '~/gabung', deskripsi: 'Syarat, alur, dan FAQ pendaftaran.', accent: 'lime' },
]

export default async function TentangPage() {
  const [about, stats] = await Promise.all([getAboutInfo(), getStats()])

  return (
    <>
      <PageHeader
        accent="violet"
        command="cat ~/tentang/README.md"
        eyebrow="tentang"
        title="Kelompok studi, bukan kelas tambahan"
        description={siteConfig.tagline}
        facts={[
          { label: 'kampus', value: siteConfig.campus.short },
          { label: 'bahasa', value: 'C' },
          { label: 'kelas', value: 'senin+selasa' },
        ]}
      />

      <SectionShell accent="violet" tone="tint" divider={false} labelledBy="readme">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <Reveal>
            <TerminalWindow title="~/tentang/README.md" bodyClassName="p-5 sm:p-8">
              <h2 id="readme" className="font-mono text-xl leading-8 font-bold tracking-tight text-fg">
                <span aria-hidden className="mr-2 text-accent-fg">
                  #
                </span>
                {siteConfig.name}
              </h2>
              <div className="measure mt-4 font-sans">
                {about.pembuka.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-5 text-[17px] leading-[1.75] text-fg first:mt-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </TerminalWindow>
          </Reveal>

          <Reveal delay={0.1}>
            <section aria-labelledby="angka">
              <h2 id="angka" className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
                {'// dalam angka'}
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 border-2 border-line bg-surface p-6">
                <Stat value={stats.anggota} label="anggota aktif" />
                <Stat value={stats.tentorAktif} label="tentor" />
                <Stat value={stats.challengeTerbit} label="challenge terbit" />
                <Stat value={stats.totalSubmission} label="submission" />
              </div>
            </section>
          </Reveal>
        </div>
      </SectionShell>

      {about.prinsip.length > 0 ? (
        <SectionShell accent="violet" tone="canvas" labelledBy="prinsip">
          <Reveal>
            <SectionHeader
              eyebrow="prinsip"
              title="Yang kami pegang"
              headingId="prinsip"
              description="Bukan visi-misi untuk dibingkai, tapi kebiasaan yang bisa kamu lihat sendiri di kelas mana pun."
            />
          </Reveal>
          <Stagger as="ul" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {about.prinsip.map((item, index) => (
              <StaggerItem as="li" key={item.id} className="border-2 border-line bg-surface p-5 sm:p-6">
                <p aria-hidden className="text-[11px] leading-5 text-syn-comment">{`/* ${pad2(index + 1)} */`}</p>
                <h3 className="mt-3 text-base leading-7 font-bold text-fg">{item.judul}</h3>
                <p className="mt-2 text-[13px] leading-6 text-muted">{item.deskripsi}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </SectionShell>
      ) : null}

      {about.sejarah.length > 0 ? (
        <SectionShell accent="violet" tone="inverse" labelledBy="sejarah">
          <Reveal>
            <SectionHeader
              eyebrow="sejarah"
              title="Sampai sejauh ini"
              headingId="sejarah"
              description="Dari yang paling lama. Setiap baris punya ceritanya sendiri di berita atau galeri."
            />
          </Reveal>
          <Reveal className="mt-10 max-w-4xl">
            <p className="text-[11px] leading-6 text-dim">
              <span aria-hidden className="text-accent-fg">
                ${' '}
              </span>
              git log --reverse --format=&quot;%ad %s&quot;
            </p>
            <ol className="mt-4 border-l-2 border-line">
              {about.sejarah.map((milestone) => (
                <li
                  key={`${milestone.periode}-${milestone.judul}`}
                  className="relative grid grid-cols-1 gap-x-6 gap-y-1 py-4 pl-6 sm:grid-cols-[6rem_minmax(0,1fr)]"
                >
                  <span aria-hidden className="absolute top-[1.4rem] -left-[7px] block h-3 w-3 border-2 border-line bg-accent" />
                  <p className="text-[11px] leading-6 font-bold text-accent-fg tabular-nums">{milestone.periode}</p>
                  <div>
                    <h3 className="text-sm leading-6 font-bold text-fg">{milestone.judul}</h3>
                    <p className="mt-1 max-w-prose text-[13px] leading-6 text-muted">{milestone.deskripsi}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </SectionShell>
      ) : null}

      <SectionShell accent="violet" tone="alt" labelledBy="temukan">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <SectionHeader eyebrow="sekretariat" title="Temukan kami" headingId="temukan" />
            <StructBlock
              className="mt-8"
              type="sekretariat"
              name="ksp"
              label="Lokasi dan jadwal"
              fields={[
                { key: 'lokasi', value: about.sekretariat.lokasi },
                { key: 'kelas', value: about.sekretariat.jadwalKelas },
                { key: 'email', value: siteConfig.email },
                { key: 'whatsapp', value: `${siteConfig.contact.phone} (${siteConfig.contact.name})` },
              ]}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <nav aria-label="Jelajahi lebih lanjut">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SHORTCUTS.map((shortcut) => (
                  <li key={shortcut.href} data-accent={shortcut.accent}>
                    <Link
                      href={shortcut.href}
                      className="group flex h-full flex-col border-2 border-line bg-surface p-5 press-in hard-shadow"
                    >
                      <span className="text-sm font-bold text-fg group-hover:text-accent-fg">
                        <span aria-hidden className="text-accent-fg">
                          cd{' '}
                        </span>
                        {shortcut.path}
                      </span>
                      <span className="mt-2 text-[12px] leading-5 text-muted">{shortcut.deskripsi}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </SectionShell>
    </>
  )
}
