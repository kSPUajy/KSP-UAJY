import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { BenefitLog } from '@/components/sections/gabung/BenefitLog'
import { JoinSteps } from '@/components/sections/gabung/JoinSteps'
import { RegisterButton, RegistrationStatusLine } from '@/components/sections/gabung/Registration'
import { Accordion } from '@/components/ui/Accordion'
import { ButtonLink } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getJoinInfo, getNewsPosts, getRegistration, getStats } from '@/lib/data'
import { formatTanggal } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Gabung',
  description: `Cara bergabung dengan ${siteConfig.name} ${siteConfig.campus.short}: persiapan mata kuliah dasar pemrograman C untuk mahasiswa semester 1, tanpa syarat kemampuan awal, biaya pendaftaran Rp150.000 dengan cashback 70%.`,
  path: '/gabung',
})

/** Tag that marks a registration announcement in the news data. */
const ANNOUNCEMENT_TAG = 'pendaftaran'

/** Registration opens and closes on the clock; regenerate hourly. */
export const revalidate = 3600

/** Printed as a `key=value` fact in the header. */
const STATUS_FACT = { segera: 'segera', buka: 'dibuka', tutup: 'ditutup' } as const

export default async function GabungPage() {
  const [info, posts, stats, registration] = await Promise.all([
    getJoinInfo(),
    getNewsPosts(),
    getStats(),
    getRegistration(),
  ])
  const open = registration.status === 'buka'

  // Newest first, so the first match is the current round's announcement.
  const announcement = posts.find((post) => post.tags.includes(ANNOUNCEMENT_TAG))

  return (
    <>
      <PageHeader
        accent="lime"
        command="./gabung --help"
        eyebrow="gabung"
        title="Belum bisa C? Justru itu alasannya."
        description={info.ringkasan}
        facts={[
          { label: 'pendaftaran', value: STATUS_FACT[registration.status] },
          { label: 'biaya', value: 'Rp150rb' },
          { label: 'seleksi', value: 'tidak_ada' },
          { label: 'anggota_aktif', value: stats.anggota },
        ]}
      />

      <SectionShell accent="lime" tone="tint" divider={false} labelledBy="syarat">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
          <Reveal>
            <SectionHeader eyebrow="syarat" title="Yang perlu kamu punya" headingId="syarat" />

            <ul aria-label="Syarat bergabung" className="mt-8 space-y-3">
              {info.syarat.map((syarat) => (
                <li key={syarat} className="flex gap-3 text-sm leading-6 text-fg">
                  <span aria-hidden className="shrink-0 text-accent-fg">
                    [x]
                  </span>
                  {syarat}
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-prose text-sm leading-7 text-muted">
              Itu saja. Tidak ada tes masuk, tidak ada wawancara, dan tidak ada yang ditolak. Sesi perkenalan
              setelah pendaftaran ada untuk menempatkanmu di jalur yang pas, bukan untuk menyaring.
            </p>

            <RegistrationStatusLine registration={registration} className="mt-8 max-w-prose" />

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <RegisterButton registration={registration} />
              {announcement ? (
                <ButtonLink href={`/berita/${announcement.slug}`} variant="outline" size="lg">
                  baca pengumuman
                </ButtonLink>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <BenefitLog benefits={info.manfaat} />
          </Reveal>
        </div>
      </SectionShell>

      {info.langkah.length > 0 ? (
        <SectionShell accent="lime" tone="canvas" labelledBy="alur">
          <Reveal>
            <SectionHeader
              eyebrow="alur"
              title="Dari formulir sampai kelas pertama"
              headingId="alur"
              description={
                announcement
                  ? `Tanggal pasti tiap gelombang ada di pengumumannya — yang terbaru terbit ${formatTanggal(announcement.tanggal)}.`
                  : 'Tanggal pasti tiap gelombang diumumkan di halaman berita.'
              }
            />
          </Reveal>
          <div className="mt-10">
            <JoinSteps steps={info.langkah} />
          </div>
        </SectionShell>
      ) : null}

      {info.faq.length > 0 ? (
        <SectionShell accent="lime" tone="inverse" labelledBy="faq">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
            <Reveal>
              <SectionHeader
                eyebrow="faq"
                title="Yang sering ditanyakan"
                headingId="faq"
                description="Pertanyaan yang paling sering masuk ke kotak masuk kami, dijawab sekali di sini."
              />
              <p className="mt-6 text-[12px] leading-6 text-muted">
                Pertanyaanmu tidak ada? Kirim ke{' '}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="break-all text-accent-fg underline decoration-2 underline-offset-4 hover:text-fg"
                >
                  {siteConfig.email}
                </a>{' '}
                atau WhatsApp{' '}
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-fg underline decoration-2 underline-offset-4 hover:text-fg"
                >
                  {siteConfig.contact.name} ({siteConfig.contact.phone})
                </a>
                .
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <Accordion
                numbered
                allowMultiple
                items={info.faq.map((item) => ({
                  id: item.id,
                  title: item.pertanyaan,
                  content: <p className="max-w-prose">{item.jawaban}</p>,
                }))}
              />
            </Reveal>
          </div>
        </SectionShell>
      ) : null}

      <SectionShell accent="lime" tone="void" dots labelledBy="daftar">
        <Reveal className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs text-muted">
              <span aria-hidden className="text-accent-fg">
                ${' '}
              </span>
              {open ? './daftar --nama="kamu"' : './daftar --status'}
            </p>
            <h2
              id="daftar"
              className="mt-6 font-display text-[clamp(1.25rem,3.6vw,2.25rem)] leading-[1.25] tracking-[0.04em] text-fg uppercase"
            >
              {open ? (
                <>
                  Satu formulir, <span className="text-accent-fg">lima menit.</span>
                </>
              ) : (
                <>
                  Gelombang ini <span className="text-accent-fg">sudah tutup.</span>
                </>
              )}
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-7 text-muted">
              {open
                ? 'Belum yakin? Coba dulu challenge minggu ini — terbuka untuk semua mahasiswa, anggota atau bukan.'
                : 'Sambil menunggu gelombang berikutnya, challenge mingguan tetap terbuka untuk semua mahasiswa UAJY — banyak anggota kami masuk lewat pintu itu dulu.'}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <RegisterButton registration={registration} />
            {open ? (
              <ButtonLink href="/challenge" variant="outline" size="lg">
                coba challenge
              </ButtonLink>
            ) : (
              <ButtonLink href="/berita?kategori=pengumuman" variant="outline" size="lg">
                pantau pengumuman
              </ButtonLink>
            )}
          </div>
        </Reveal>
      </SectionShell>
    </>
  )
}
