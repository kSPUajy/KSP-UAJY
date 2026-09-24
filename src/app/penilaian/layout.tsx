import { requireProfile } from '@/lib/auth/session'

/** Tentors and admins only; each page and action checks again, per module. */
export default async function PenilaianLayout({ children }: { children: React.ReactNode }) {
  await requireProfile('/penilaian', ['tentor', 'admin'])
  return (
    <div data-accent="cyan" className="border-b-2 border-line bg-canvas">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</div>
    </div>
  )
}
