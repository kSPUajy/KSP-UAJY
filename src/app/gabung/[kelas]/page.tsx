import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'

import { MdxContent } from '@/components/mdx/MdxContent'
import { Reveal } from '@/components/motion/Reveal'
import {
  KELAS_C,
  onlyClass,
  OtherOpenClasses,
  RegisterButton,
  RegistrationStatusLine,
} from '@/components/sections/gabung/Registration'
import { trackAccent } from '@/components/sections/home/TracksSection'
import { ButtonLink } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getNewsPosts, getRegistration, getRegistrationPage, getRegistrationTracks } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'

type KelasPageProps = {
  params: Promise<{ kelas: string }>
}

/** A class's switch refreshes this page at once (the panel expires its data); hourly covers the news. */
export const revalidate = 3600

/** Tag that marks a registration announcement; a class's own also carries its id. */
const ANNOUNCEMENT_TAG = 'pendaftaran'

export async function generateStaticParams() {
  const tracks = await getRegistrationTracks()
  return tracks.filter((track) => track.id !== KELAS_C).map((track) => ({ kelas: track.id }))
}

export async function generateMetadata({ params }: KelasPageProps): Promise<Metadata> {
  const { kelas } = await params
  const page = kelas === KELAS_C ? null : await getRegistrationPage(kelas)
  if (!page) return {}
  return pageMetadata({
    title: `Daftar kelas ${page.nama}`,
    description: page.ringkasan || `Pendaftaran kelas ${page.nama} di Kelompok Studi Pemrograman UAJY.`,
    path: `/gabung/${page.id}`,
  })
}

/**
 * One class's own registration page: its pitch, its requirements, its
 * poster and the rest of its details, with its own status and form. The
 * content is edited in /admin/pendaftaran/<id>. KSP C's page is /gabung.
 */
export default async function GabungKelasPage({ params }: KelasPageProps) {
  const { kelas: id } = await params
  if (id === KELAS_C) redirect('/gabung')

  const [page, registration, posts] = await Promise.all([getRegistrationPage(id), getRegistration(), getNewsPosts()])
  if (!page) notFound()

  const kelas = onlyClass(registration, page.id)
  const open = kelas.open.length > 0
  // Newest first, so the first match is this class's latest announcement.
  const announcement = posts.find((post) => post.tags.includes(ANNOUNCEMENT_TAG) && post.tags.includes(page.id))
  const accent = trackAccent(page.id)

  return (
    <>
      <PageHeader
        accent={accent}
        command={`./gabung --kelas=${page.id}`}
        eyebrow="gabung"
        title={`Kelas ${page.nama}`}
        description={page.ringkasan || undefined}
        facts={[{ label: 'pendaftaran', value: open ? 'dibuka' : 'ditutup' }]}
      />

      <SectionShell accent={accent} tone="tint" divider={false} labelledBy="daftar-kelas">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <Reveal>
            <SectionHeader
              eyebrow="daftar"
              title={page.syarat.length > 0 ? 'Yang perlu kamu punya' : 'Pendaftaran'}
              headingId="daftar-kelas"
            />

            {page.syarat.length > 0 ? (
              <ul aria-label={`Syarat kelas ${page.nama}`} className="mt-8 space-y-3">
                {page.syarat.map((syarat) => (
                  <li key={syarat} className="flex gap-3 text-sm leading-6 text-fg">
                    <span aria-hidden className="shrink-0 text-accent-fg">
                      [x]
                    </span>
                    {syarat}
                  </li>
                ))}
              </ul>
            ) : null}

            <RegistrationStatusLine registration={kelas} className="mt-8 max-w-prose" />

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <RegisterButton registration={kelas} fallback="none" />
              {announcement ? (
                <ButtonLink href={`/berita/${announcement.slug}`} variant="outline" size="lg">
                  baca pengumuman
                </ButtonLink>
              ) : open ? null : (
                <ButtonLink href="/berita?kategori=pengumuman" variant="outline" size="lg">
                  pantau pengumuman
                </ButtonLink>
              )}
            </div>
            <OtherOpenClasses registration={registration} except={page.id} className="mt-4 max-w-prose" />
          </Reveal>

          {page.poster ? (
            <Reveal delay={0.1}>
              <a href={page.poster} target="_blank" rel="noopener noreferrer" className="block border-2 border-line hard-shadow">
                <Image
                  src={page.poster}
                  alt={`Poster kelas ${page.nama}`}
                  width={1080}
                  height={1350}
                  sizes="(min-width: 1024px) 26rem, 92vw"
                  className="h-auto w-full"
                />
                <span className="sr-only">(buka poster ukuran penuh di tab baru)</span>
              </a>
            </Reveal>
          ) : null}
        </div>
      </SectionShell>

      {page.isiMdx.trim() ? (
        <SectionShell accent={accent} tone="canvas" labelledBy="detail-kelas">
          <h2 id="detail-kelas" className="sr-only">
            Detail kelas {page.nama}
          </h2>
          <Reveal>
            <article className="measure min-w-0 font-sans text-[17px] [&>div>*:first-child]:mt-0">
              <MdxContent source={page.isiMdx} />
            </article>
          </Reveal>
        </SectionShell>
      ) : null}
    </>
  )
}
