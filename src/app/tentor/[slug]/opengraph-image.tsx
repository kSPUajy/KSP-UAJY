import { getTentorBySlug, getTentors } from '@/lib/data'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'
import { snakeCase } from '@/lib/utils'

export const alt = 'Kartu profil tentor'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Same slugs as the page, so every card is drawn at build time. */
export async function generateStaticParams() {
  const tentors = await getTentors()
  return tentors.map((tentor) => ({ slug: tentor.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tentor = await getTentorBySlug(slug)
  const file = `~/tentor/${snakeCase(slug)}.c`
  return renderOgCard({
    accent: 'cyan',
    file,
    command: `cat ${file}`,
    eyebrow: tentor ? `tentor · angkatan ${tentor.angkatan}` : 'tentor',
    title: tentor?.nama ?? 'Tentor',
    subtitle: tentor?.modul.length ? tentor.modul.map((modul) => modul.judul).join(' · ') : undefined,
  })
}
