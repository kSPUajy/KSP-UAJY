import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import Link from 'next/link'

import { DitherImage } from '@/components/ui/DitherImage'
import { StructBlock } from '@/components/ui/StructBlock'
import type { Member } from '@/lib/types'
import { PORTRAIT } from '@/lib/types'

type AboutSectionProps = {
  index: number
  /** Pengurus harian, in org-chart order. */
  pengurus: readonly Member[]
}

/** The first two words of a name: enough to recognise someone on a small card. */
const shortName = (nama: string): string => nama.split(/\s+/).slice(0, 2).join(' ')

/** Who KSP is, straight under the hero: the first thing a newcomer reads after the wordmark. */
export function AboutSection({ index, pengurus }: AboutSectionProps) {
  return (
    <SectionShell accent="violet" labelledBy="tentang-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <SectionHeader
            index={index}
            eyebrow="tentang ksp"
            title="Belajar ngoding bareng, bukan sendirian"
            headingId="tentang-title"
          />

          <div className="mt-8 max-w-2xl space-y-5 text-sm leading-7 text-fg sm:text-base sm:leading-8">
            <p>
              <strong>Kelompok Studi Pemrograman (KSP)</strong> adalah wadah bagi mahasiswa Informatika Universitas
              Atma Jaya Yogyakarta yang ingin tumbuh di dunia pemrograman. Di sini kamu belajar dalam lingkungan yang
              suportif dan seru — tempat bertanya tanpa takut, berdiskusi, dan mengasah kemampuan coding bersama
              teman-teman seangkatan.
            </p>
            <p>
              Setiap minggu ada <strong>tentoring hari Senin dan Selasa</strong>, ditambah <strong>sharing session</strong>{' '}
              dan <strong>workshop</strong> yang memperdalam kemampuanmu dalam bahasa C. Hasilnya, kamu lebih siap
              menghadapi mata kuliah pemrograman — dan pulang dengan teman-teman baru yang bikin semangat belajar tetap
              menyala.
            </p>
            <p className="font-bold text-accent-fg">
              Raih potensi terbaikmu di bidang informatika bersama KSP UAJY. Mari belajar dan berkarya bersama!
            </p>
          </div>
        </Reveal>

        <Reveal className="flex flex-col justify-end gap-6">
          <StructBlock
            type="ksp"
            name="kegiatan"
            label="Kegiatan rutin KSP"
            className="text-[13px] leading-7"
            fields={[
              { key: 'tentoring', value: 'Senin & Selasa' },
              { key: 'jam', value: '19.00–21.00 WIB' },
              { key: 'tempat', value: 'Lab Komputasi' },
              { key: 'bahasa', value: 'C', kind: 'ident' },
              { key: 'sharing', value: 'rutin' },
              { key: 'workshop', value: 'berkala' },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/tentang" variant="outline" size="sm">
              kenali ksp lebih jauh
            </ButtonLink>
            <ButtonLink href="/modul" variant="ghost" size="sm">
              lihat materi
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      {pengurus.length > 0 ? (
        <Reveal className="mt-14 border-t-2 border-line-soft pt-8 sm:mt-16">
          <h3 className="font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">{'// diurus oleh'}</h3>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {pengurus.map((person) => (
              <li key={person.id}>
                <Link
                  href="/struktur"
                  className="group/row flex items-center gap-3 border-2 border-line-soft bg-surface p-2.5 transition-colors hover:border-accent focus-visible:border-accent"
                >
                  <DitherImage
                    src={person.foto}
                    alt=""
                    width={PORTRAIT.width}
                    height={PORTRAIT.height}
                    sizes="44px"
                    reveal="row"
                    className="aspect-[4/5] w-11 shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-[10px] tracking-[0.1em] text-accent-fg uppercase">{person.jabatan}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 font-bold text-fg group-hover/row:text-accent-fg">
                      {shortName(person.nama)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </SectionShell>
  )
}
