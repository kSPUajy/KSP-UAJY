import Link from 'next/link'

import { Tag } from '@/components/ui/Badge'
import { DitherImage } from '@/components/ui/DitherImage'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { PORTRAIT } from '@/lib/types'
import type { Tentor } from '@/lib/types'
import { pad2, snakeCase } from '@/lib/utils'

type TentorCardProps = {
  tentor: Pick<Tentor, 'nama' | 'slug' | 'foto' | 'punyaFoto' | 'angkatan' | 'keahlian' | 'modul'>
  /** `sizes` for the portrait — depends on the grid the card sits in. */
  sizes: string
  /** How many modules (or, without any, skills) to list. The full set lives on the profile page. */
  skills?: number
  as?: 'h2' | 'h3'
}

/**
 * A tentor as a source file. The window title is the file's path; hover or
 * focus turns it into the command that would open it.
 *
 * The whole card is clickable, but the only link is the name: a pseudo-element
 * stretches its hit area over the card. Screen readers hear one link with the
 * tentor's name, not a card-shaped blob of everything inside it.
 */
export function TentorCard({ tentor, sizes, skills = 2, as: Heading = 'h3' }: TentorCardProps) {
  const file = `${snakeCase(tentor.slug)}.c`
  // What they teach says more than a skill list, and every tentor has it.
  const tags =
    tentor.modul.length > 0
      ? tentor.modul.map((modul) => `M${pad2(modul.minggu)} ${modul.judul.toLowerCase()}`)
      : tentor.keahlian

  return (
    <TerminalWindow
      title={`~/tentor/${file}`}
      titleHover={`$ cat ${file}`}
      interactive
      bodyClassName="flex flex-1 flex-col"
      className="flex h-full flex-col"
    >
      <DitherImage
        src={tentor.foto}
        alt={`Potret ${tentor.nama}`}
        width={PORTRAIT.width}
        height={PORTRAIT.height}
        sizes={sizes}
        bordered={false}
        // Real photos in their own colours; only the generated stand-ins are duotoned.
        treatment={tentor.punyaFoto ? 'none' : 'full'}
        reveal
        className="aspect-[4/5] border-b-2 border-line"
      />

      <div className="flex flex-1 flex-col p-4">
        <Heading className="text-sm leading-6 font-bold text-fg">
          <Link
            href={`/tentor/${tentor.slug}`}
            className="transition-colors group-hover/window:text-accent-fg after:absolute after:inset-0 after:content-['']"
          >
            {tentor.nama}
          </Link>
        </Heading>
        <p className="mt-1 text-[11px] leading-5 text-dim">angkatan {tentor.angkatan}</p>

        <ul aria-label={tentor.modul.length > 0 ? 'Modul' : 'Keahlian'} className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {tags.slice(0, skills).map((skill) => (
            <li key={skill} className="max-w-full">
              <Tag prefix="">{skill}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </TerminalWindow>
  )
}
