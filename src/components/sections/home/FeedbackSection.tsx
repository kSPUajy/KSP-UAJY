import { Reveal } from '@/components/motion/Reveal'
import { FeedbackChat } from '@/components/sections/home/FeedbackChat'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'

/**
 * Kritik dan saran, straight to the pengurus. One centred column — a
 * conversation, not the text-left / form-right split the rest of the page
 * uses. Admins read them at `/admin/masukan`.
 */
export function FeedbackSection({ index }: { index: number }) {
  return (
    <SectionShell accent="violet" tone="tint" labelledBy="masukan-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="kritik & saran"
          title="Ada yang bisa lebih baik?"
          headingId="masukan-title"
          align="center"
          description="Ngobrol langsung dengan pengurus. Tanpa login, dan boleh tanpa nama."
        />
      </Reveal>
      <Reveal delay={0.1} className="relative mx-auto mt-10 max-w-2xl sm:mt-12">
        <FeedbackChat />
      </Reveal>
    </SectionShell>
  )
}
