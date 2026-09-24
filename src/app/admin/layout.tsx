import { AdminNav } from '@/components/admin/AdminNav'
import { SignOutButton } from '@/components/sections/akun/SignOutButton'
import { Prompt } from '@/components/ui/Prompt'
import { requireProfile } from '@/lib/auth/session'

/**
 * The admin frame. The role is checked here for the whole section, and again
 * by every page and every Server Action — a layout does not re-run on
 * client navigation, and an action is reachable without the page at all.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile('/admin', ['admin'])

  return (
    <div data-accent="magenta" className="border-b-2 border-line bg-canvas">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Prompt>sudo -i</Prompt>
          <p className="mt-3 mb-6 text-[11px] leading-5 text-dim">
            admin: <span className="text-fg">{profile.nama}</span>
          </p>
          <AdminNav />
          <div className="mt-6 hidden lg:block">
            <SignOutButton />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
