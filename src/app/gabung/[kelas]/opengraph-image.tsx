import { KELAS_C } from '@/components/sections/gabung/Registration'
import { trackAccent } from '@/components/sections/home/TracksSection'
import { getRegistrationPage, getRegistrationTracks } from '@/lib/data'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Pendaftaran kelas Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Same classes as the page, so every card is drawn at build time. */
export async function generateStaticParams() {
  const tracks = await getRegistrationTracks()
  return tracks.filter((track) => track.id !== KELAS_C).map((track) => ({ kelas: track.id }))
}

/** The card has room for about two lines under the title. */
const SUBTITLE_MAX = 140

const clip = (text: string): string =>
  text.length <= SUBTITLE_MAX ? text : `${text.slice(0, text.lastIndexOf(' ', SUBTITLE_MAX)).replace(/[,.;:]$/, '')}…`

export default async function Image({ params }: { params: Promise<{ kelas: string }> }) {
  const { kelas } = await params
  const page = await getRegistrationPage(kelas)
  return renderOgCard({
    accent: trackAccent(kelas),
    file: `~/gabung/${kelas}/`,
    command: `./gabung --kelas=${kelas}`,
    eyebrow: 'gabung',
    title: page ? `Kelas ${page.nama}` : 'Gabung KSP',
    subtitle: page?.ringkasan ? clip(page.ringkasan) : undefined,
  })
}
