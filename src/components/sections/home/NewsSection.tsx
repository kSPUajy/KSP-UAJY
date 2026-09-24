import { Reveal } from '@/components/motion/Reveal'
import { GitLog } from '@/components/sections/berita/GitLog'
import { NewsLeadCard } from '@/components/sections/berita/NewsLeadCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { NewsPostMeta } from '@/lib/types'

type NewsSectionProps = {
  index: number
  /** Newest first. */
  posts: readonly NewsPostMeta[]
  /** Entries in the log under the lead story. */
  logLength?: number
}

const LEAD_SIZES = '(min-width: 1440px) 720px, (min-width: 1024px) 52vw, 92vw'

/**
 * The newest post as a full-width lead, the next few underneath it as a
 * `git log` — the same shape `/berita` uses, in miniature.
 */
export function NewsSection({ index, posts, logLength = 4 }: NewsSectionProps) {
  const [lead, ...rest] = posts
  const log = rest.slice(0, logLength)

  return (
    <SectionShell accent="amber" tone="alt" labelledBy="berita-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="berita"
          title="Kabar dari sekretariat"
          headingId="berita-title"
          description="Pengumuman, liputan kegiatan, catatan prestasi, dan tulisan teknis dari pengurus."
          actions={
            lead ? (
              <ButtonLink href="/berita" variant="outline" size="sm">
                semua berita
              </ButtonLink>
            ) : undefined
          }
        />
      </Reveal>

      {lead ? (
        <>
          <Reveal className="mt-10 sm:mt-12">
            <NewsLeadCard post={lead} sizes={LEAD_SIZES} layout="split" />
          </Reveal>

          {log.length > 0 ? (
            <Reveal className="mt-12 max-w-4xl">
              <p className="text-[11px] leading-6 text-dim">
                <span aria-hidden className="text-accent-fg">
                  ${' '}
                </span>
                git log --oneline -{log.length} berita/
              </p>
              <GitLog posts={log} label="Berita sebelumnya" className="mt-3" />
            </Reveal>
          ) : null}
        </>
      ) : (
        <Reveal className="mt-10">
          <EmptyState
            command="git log berita/"
            output="fatal: belum ada commit"
            title="Belum ada berita"
            description="Pengumuman pertama biasanya terbit bersamaan dengan pembukaan pendaftaran anggota baru."
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
