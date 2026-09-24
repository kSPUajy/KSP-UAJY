import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MdxContent } from '@/components/mdx/MdxContent'
import { Reveal } from '@/components/motion/Reveal'
import { Countdown } from '@/components/sections/challenge/Countdown'
import { SampleTranscript } from '@/components/sections/challenge/SampleTranscript'
import { SolutionTabs } from '@/components/sections/challenge/SolutionTabs'
import { Accordion } from '@/components/ui/Accordion'
import { Badge, DifficultyBadge, Tag } from '@/components/ui/Badge'
import { DitherImage } from '@/components/ui/DitherImage'
import { Prompt } from '@/components/ui/Prompt'
import { SectionShell } from '@/components/ui/SectionShell'
import { StructBlock } from '@/components/ui/StructBlock'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { getChallengeBySlug, getChallenges, getWinnerById, isChallengeClosed } from '@/lib/data'
import { mdxExcerpt } from '@/lib/excerpt'
import { formatTanggalPendek, formatTanggalWaktu, namaHari } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { PORTRAIT } from '@/lib/types'
import type { Winner } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type ChallengePageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Slugs added in the admin panel after a build are rendered on first visit
 * instead of 404ing; an unknown slug still ends in `notFound()`.
 */
export const dynamicParams = true

/** Open or closed depends on the clock; regenerate hourly. */
export const revalidate = 3600

export async function generateStaticParams() {
  const challenges = await getChallenges()
  return challenges.map((challenge) => ({ slug: challenge.slug }))
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const { slug } = await params
  const challenge = await getChallengeBySlug(slug)
  if (!challenge) return {}
  return pageMetadata({
    title: `Minggu ${pad2(challenge.minggu)} — ${challenge.judul}`,
    description: mdxExcerpt(challenge.deskripsiMdx, 160),
    path: `/challenge/${challenge.slug}`,
  })
}

function Label({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
      {`// ${children}`}
    </h2>
  )
}

function WinnerByline({ winner }: { winner: Winner }) {
  return (
    <div className="group relative flex items-center gap-4 border-2 border-line bg-surface p-3 pr-4 transition-colors hover:bg-surface-2">
      <DitherImage
        src={winner.foto}
        alt={`Potret ${winner.nama}`}
        width={PORTRAIT.width}
        height={PORTRAIT.height}
        sizes="56px"
        className="aspect-[4/5] w-14 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">juara minggu ini</p>
        <p className="mt-1.5 text-sm leading-6 font-bold text-fg">
          <Link
            href={`/hall-of-fame/${winner.slug}`}
            className="decoration-accent-fg decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {winner.nama}
          </Link>
        </p>
        <p className="text-[11px] leading-5 text-dim">
          angkatan {winner.angkatan} · dikumpulkan {formatTanggalWaktu(winner.waktuSubmit)}
          {winner.runtimeMs !== undefined ? ` · ${winner.runtimeMs} ms` : ''}
        </p>
      </div>
      <span aria-hidden className="shrink-0 text-accent-fg">
        -&gt;
      </span>
    </div>
  )
}

export default async function ChallengeDetailPage({ params }: ChallengePageProps) {
  const { slug } = await params
  const challenge = await getChallengeBySlug(slug)
  if (!challenge) notFound()

  const [challenges, winner] = await Promise.all([
    getChallenges(),
    challenge.pemenangId ? getWinnerById(challenge.pemenangId) : null,
  ])

  const closed = isChallengeClosed(challenge)
  const week = pad2(challenge.minggu)
  const ordered = [...challenges].sort((a, b) => a.minggu - b.minggu)
  const position = ordered.findIndex((item) => item.slug === challenge.slug)
  const previous = position > 0 ? ordered[position - 1] : undefined
  const next = position >= 0 ? ordered[position + 1] : undefined

  const closedStatus = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
      <Badge variant="ghost" size="sm">
        ditutup
      </Badge>
      <span>{winner ? `juara: ${winner.nama}` : 'penilaian berlangsung — pemenang diumumkan Selasa'}</span>
    </p>
  )

  return (
    <>
      <header data-accent="magenta" className="relative border-b-2 border-line bg-canvas dot-grid">
        <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-14 lg:px-8">
          <Link
            href="/challenge"
            className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent-fg"
          >
            <span aria-hidden className="text-accent-fg">
              &lt;-
            </span>
            cd ..<span className="sr-only"> — kembali ke arsip challenge</span>
          </Link>

          <Prompt className="mt-6">cat ~/challenge/minggu-{week}/soal.md</Prompt>

          <p className="mt-8 font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
            {`// minggu ${week}`}
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight font-bold tracking-tight text-fg">
            {challenge.judul}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={challenge.difficulty} />
            <ul aria-label="Topik" className="flex flex-wrap gap-2">
              {challenge.topik.map((topik) => (
                <li key={topik}>
                  <Tag>{topik}</Tag>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <SectionShell accent="magenta" tone="tint" divider={false} bare containerClassName="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-x-14">
          {/* The measure is set in the prose face so 68ch means 68 of its characters. */}
          <article aria-label="Soal" className="measure min-w-0 font-sans text-[17px] lg:col-start-1 lg:row-start-1">
            <MdxContent source={challenge.deskripsiMdx} />
          </article>

          <aside
            aria-label="Detail soal"
            className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100svh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1"
          >
            <TerminalWindow title={`~/challenge/minggu-${week}/status`} tone="code">
              <Countdown
                deadline={challenge.deadline}
                deadlineLabel={`${namaHari(challenge.deadline)}, ${formatTanggalWaktu(challenge.deadline)}`}
                closed={closedStatus}
                closedAtRender={closed}
              />
            </TerminalWindow>

            <StructBlock
              type="challenge"
              name={`minggu_${week}`}
              label={`Detail challenge minggu ${challenge.minggu}`}
              fields={[
                { key: 'tingkat', value: challenge.difficulty, kind: 'ident' },
                {
                  key: 'rilis',
                  value: `${namaHari(challenge.tanggalRilis)}, ${formatTanggalPendek(challenge.tanggalRilis)}`,
                },
                { key: 'peserta', value: challenge.totalPeserta },
                { key: 'tags', value: challenge.tags.join(', ') },
              ]}
            />

            <section aria-labelledby="batasan">
              <Label id="batasan">batasan</Label>
              <ol className="mt-4 space-y-2 border-l-2 border-line-soft pl-4 font-mono text-[12px] leading-5 text-fg ligatures-none">
                {challenge.constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="contoh-io">
              <Label id="contoh-io">contoh masukan &amp; keluaran</Label>
              <div className="mt-4 flex flex-col gap-4">
                {challenge.sampleIO.map((sample, index) => (
                  <SampleTranscript key={sample.input} sample={sample} index={index} />
                ))}
              </div>
            </section>
          </aside>

          <div className="flex min-w-0 flex-col gap-14 lg:col-start-1 lg:row-start-2">
            {challenge.hintTerkunci.length > 0 ? (
              <Reveal>
                <section aria-labelledby="petunjuk">
                  <Label id="petunjuk">petunjuk terkunci</Label>
                  <p className="mt-4 max-w-prose text-sm leading-7 text-muted">
                    Buka satu per satu, hanya kalau buntu. Membukanya tidak mengurangi nilai — kuncinya ada supaya
                    kamu berhenti sebentar dulu.
                  </p>
                  <Accordion
                    className="mt-6"
                    variant="unlock"
                    numbered
                    allowMultiple
                    items={challenge.hintTerkunci.map((hint, index) => ({
                      id: `petunjuk-${index + 1}`,
                      title: `Petunjuk ${index + 1}`,
                      content: <p>{hint}</p>,
                    }))}
                  />
                </section>
              </Reveal>
            ) : null}

            <Reveal>
              <section aria-labelledby="solusi">
                <Label id="solusi">solusi pemenang</Label>
                {closed && winner ? (
                  <div className="mt-6 flex flex-col gap-8">
                    <WinnerByline winner={winner} />
                    <SolutionTabs winner={winner} />
                  </div>
                ) : (
                  <TerminalWindow title={`~/challenge/minggu-${week}/solusi.c`} tone="code" className="mt-6">
                    <Prompt>cat solusi.c</Prompt>
                    <p className="mt-2 text-xs leading-6 text-accent-fg">cat: solusi.c: Permission denied</p>
                    <p className="mt-4 text-sm leading-7 text-muted">
                      {closed
                        ? 'Pengumpulan sudah ditutup dan penilaian sedang berjalan. Solusi pemenang terbit bersama pengumumannya hari Selasa.'
                        : 'Solusi pemenang dan pembahasannya dibuka setelah deadline lewat. Sampai saat itu, yang ada hanya soalnya — dan kamu.'}
                    </p>
                  </TerminalWindow>
                )}
              </section>
            </Reveal>
          </div>
        </div>
      </SectionShell>

      {previous || next ? (
        <nav aria-label="Challenge lain" data-accent="magenta" className="border-t-2 border-line bg-canvas-alt">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:px-8">
            {previous ? (
              <Link href={`/challenge/${previous.slug}`} className="group min-w-0 text-left">
                <span className="block text-[11px] leading-5 text-dim">
                  <span aria-hidden>&lt;- </span>minggu {pad2(previous.minggu)}
                </span>
                <span className="mt-1 block truncate text-sm font-bold text-fg group-hover:text-accent-fg">
                  {previous.judul}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/challenge/${next.slug}`} className="group min-w-0 text-right">
                <span className="block text-[11px] leading-5 text-dim">
                  minggu {pad2(next.minggu)}
                  <span aria-hidden> -&gt;</span>
                </span>
                <span className="mt-1 block truncate text-sm font-bold text-fg group-hover:text-accent-fg">
                  {next.judul}
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  )
}
