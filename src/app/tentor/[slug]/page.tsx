import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { ExperienceTimeline } from '@/components/sections/tentor/ExperienceTimeline'
import { SkillArray } from '@/components/sections/tentor/SkillArray'
import { TentorCarousel } from '@/components/sections/tentor/TentorCarousel'
import { TentorQuote } from '@/components/sections/tentor/TentorQuote'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { DitherImage } from '@/components/ui/DitherImage'
import { Prompt } from '@/components/ui/Prompt'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { getMemberBySlug, getTentorBySlug, getTentors, getWinnerProfile } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { PORTRAIT } from '@/lib/types'
import type { Socials, Tentor } from '@/lib/types'
import { pad2, snakeCase } from '@/lib/utils'

type TentorPageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Tentors known at build time are prerendered; one added later (a new
 * account or module assignment) renders on its first visit instead of 404ing.
 */
export async function generateStaticParams() {
  const tentors = await getTentors()
  return tentors.map((tentor) => ({ slug: tentor.slug }))
}

export async function generateMetadata({ params }: TentorPageProps): Promise<Metadata> {
  const { slug } = await params
  const tentor = await getTentorBySlug(slug)
  if (!tentor) return {}
  return pageMetadata({
    title: tentor.nama,
    description: tentor.quote
      ? `${tentor.nama}, tentor KSP. “${tentor.quote}”`
      : `${tentor.nama}, tentor KSP${tentor.modul.length > 0 ? ` — memegang ${tentor.modul.map((modul) => modul.judul).join(', ')}` : ''}.`,
    path: `/tentor/${tentor.slug}`,
  })
}

const SOCIAL_ORDER: ReadonlyArray<keyof Socials> = ['github', 'linkedin', 'instagram']

/** Until an admin writes a bio, say what is known: the person and their modules. */
function defaultBio(tentor: Tentor): string {
  const modules = tentor.modul.map((modul) => modul.judul).join(', ')
  return `${tentor.nama} adalah tentor KSP angkatan ${tentor.angkatan}${modules ? `, penanggung jawab modul ${modules}` : ''}.`
}

function Label({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
      {`// ${children}`}
    </h2>
  )
}

export default async function TentorProfilePage({ params }: TentorPageProps) {
  const { slug } = await params
  const tentor = await getTentorBySlug(slug)
  if (!tentor) notFound()

  const [tentors, member, winner] = await Promise.all([
    getTentors(),
    getMemberBySlug(slug),
    getWinnerProfile(slug),
  ])

  const file = `${snakeCase(tentor.slug)}.c`
  const snippet = tentor.favoriteSnippet
  const others = tentors.filter((other) => other.slug !== tentor.slug)
  const socials = SOCIAL_ORDER.flatMap((network) => {
    const href = tentor.socials[network]
    return href ? [{ network, href }] : []
  })

  return (
    <>
      <section data-accent="cyan" className="relative border-b-2 border-line bg-canvas dot-grid">
        <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8 lg:pb-24">
          <Link
            href="/tentor"
            className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent-fg"
          >
            <span aria-hidden className="text-accent-fg">
              &lt;-
            </span>
            cd ..<span className="sr-only"> — kembali ke daftar tentor</span>
          </Link>

          <Prompt className="mt-6">cat ~/tentor/{file}</Prompt>

          <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
            <div className="lg:sticky lg:top-24">
              <TerminalWindow title={`~/tentor/${file}`}>
                <div className="flex items-start gap-4 lg:block">
                  <DitherImage
                    src={tentor.foto}
                    alt={`Potret ${tentor.nama}`}
                    width={PORTRAIT.width}
                    height={PORTRAIT.height}
                    sizes="(min-width: 1024px) 320px, 112px"
                    eager
                    className="aspect-[4/5] w-28 shrink-0 lg:w-full"
                  />
                  <div className="min-w-0 lg:mt-5">
                    <p className="font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">
                      tentor · {tentor.angkatan}
                    </p>
                    <h1 className="mt-2 text-xl leading-snug font-bold tracking-tight text-fg sm:text-2xl">
                      {tentor.nama}
                    </h1>
                  </div>
                </div>

                <div className="mt-6 border-t-2 border-line-soft pt-5">
                  <p className="text-[11px] leading-5 text-dim">modul yang dipegang</p>
                  {tentor.modul.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-fg">
                      {tentor.modul.map((modul) => (
                        <li key={modul.id}>
                          <Link href={`/modul#minggu-${pad2(modul.minggu)}`} className="flex gap-2 hover:text-accent-fg">
                            <span className="text-accent-fg tabular-nums">M{pad2(modul.minggu)}</span>
                            {modul.judul}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-muted">belum ditugaskan ke modul</p>
                  )}
                </div>

                {member || winner ? (
                  <div className="mt-5 flex flex-col gap-2 border-t-2 border-line-soft pt-5 text-xs leading-5">
                    {member ? (
                      <Link href={`/struktur#${member.slug}`} className="text-accent-fg hover:underline">
                        juga pengurus: {member.jabatan.toLowerCase()} <span aria-hidden>-&gt;</span>
                      </Link>
                    ) : null}
                    {winner ? (
                      <Link href={`/hall-of-fame/${winner.slug}`} className="text-accent-fg hover:underline">
                        {winner.totalMenang}× juara challenge mingguan <span aria-hidden>-&gt;</span>
                      </Link>
                    ) : null}
                  </div>
                ) : null}

                {socials.length > 0 ? (
                  <ul aria-label="Kontak" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-line-soft pt-5 text-xs">
                    {socials.map(({ network, href }) => (
                      <li key={network}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted transition-colors hover:text-accent-fg"
                        >
                          {network} <span aria-hidden>↗</span>
                          <span className="sr-only"> (membuka tab baru)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </TerminalWindow>
            </div>

            <div className="flex min-w-0 flex-col gap-12">
              {tentor.quote ? (
                <Reveal>
                  <TentorQuote quote={tentor.quote} author={tentor.nama} />
                </Reveal>
              ) : null}

              <Reveal>
                <section aria-labelledby="tentang">
                  <Label id="tentang">tentang</Label>
                  <p className="mt-4 max-w-prose text-sm leading-7 text-muted sm:text-[15px] sm:leading-8">
                    {tentor.bio || defaultBio(tentor)}
                  </p>
                </section>
              </Reveal>

              {tentor.keahlian.length > 0 ? (
                <Reveal>
                  <section aria-labelledby="keahlian">
                    <Label id="keahlian">keahlian</Label>
                    <SkillArray skills={tentor.keahlian} className="mt-4" />
                  </section>
                </Reveal>
              ) : null}

              {tentor.pengalaman.length > 0 ? (
                <section aria-labelledby="pengalaman">
                  <Reveal>
                    <Label id="pengalaman">pengalaman</Label>
                  </Reveal>
                  <ExperienceTimeline items={tentor.pengalaman} className="mt-6" />
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {snippet ? (
        <SectionShell accent="cyan" tone="alt" divider={false} labelledBy="snippet-favorit">
          <Reveal>
            <SectionHeader
              eyebrow="snippet favorit"
              title={snippet.judul}
              headingId="snippet-favorit"
              description={`Potongan kode yang dipilih ${tentor.nama.split(' ')[0] ?? tentor.nama} untuk menjelaskan satu hal sebaik-baiknya.`}
            />
          </Reveal>
          <Reveal className="mt-10 max-w-4xl">
            <CodeBlock
              code={snippet.code}
              filename={`~/tentor/${snakeCase(tentor.slug)}/favorit.c`}
              caption="Salin, kompilasi dengan gcc -std=c17 -Wall -Wextra, lalu jalankan sendiri."
            />
          </Reveal>
        </SectionShell>
      ) : null}

      {others.length > 0 ? (
        <SectionShell accent="cyan" tone="inverse" labelledBy="tentor-lain">
          <Reveal>
            <SectionHeader eyebrow="tentor lain" title="Masih ada yang lain" headingId="tentor-lain" />
          </Reveal>
          <Reveal className="mt-10">
            <TentorCarousel tentors={others} />
          </Reveal>
        </SectionShell>
      ) : null}
    </>
  )
}
