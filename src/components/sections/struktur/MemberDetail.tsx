'use client'

import Link from 'next/link'

import { DitherImage } from '@/components/ui/DitherImage'
import type { OrgEntry } from '@/lib/org'
import type { Socials } from '@/lib/types'
import { PORTRAIT } from '@/lib/types'

type MemberDetailProps = {
  entry: OrgEntry
  onOpen: (slug: string) => void
  /** The dialog is labelled by this heading. */
  headingId: string
}

const SOCIAL_ORDER: ReadonlyArray<keyof Socials> = ['github', 'linkedin', 'instagram']

/**
 * Stable callback ref: React calls it once per heading element it attaches.
 * (`autoFocus` would not do: React only honours it on form controls.)
 *
 * It only claims focus that is already lost to <body> — the pointer button
 * just pressed was removed with the old content — or already inside the
 * dialog. On first open focus is still on whatever opened the panel, and the
 * focus trap has to record that element before anything moves it.
 */
const focusOnMount = (element: HTMLHeadingElement | null): void => {
  if (!element) return
  const active = document.activeElement
  const dialog = element.closest('[role="dialog"]')
  if (active === null || active === document.body || dialog?.contains(active)) element.focus()
}

function PointerButton({ label, detail, onClick }: { label: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left text-fg decoration-accent-fg decoration-2 underline-offset-4 hover:underline"
    >
      {label}
      <span className="ml-2 text-[11px] text-dim no-underline group-hover:text-muted">{detail}</span>
    </button>
  )
}

/**
 * One member, opened. Their place in the structure is written as pointers —
 * `atasan -> …`, and for the one person at the top, `atasan -> NULL` — and
 * every pointer can be followed: it swaps the panel to that person.
 *
 * The heading is keyed by member, so following a pointer mounts a new one
 * and `focusOnMount` moves focus onto it — a screen reader announces the new
 * person, and the next Tab continues from the top of their panel. Without it
 * the button just pressed would vanish with the old content and drop focus
 * out of the dialog. On first open the focus trap then settles focus on the
 * close button, as it would for any dialog.
 */
export function MemberDetail({ entry, onOpen, headingId }: MemberDetailProps) {
  const { node, parent } = entry
  const socials = SOCIAL_ORDER.flatMap((network) => {
    const href = node.socials[network]
    return href ? [{ network, href }] : []
  })

  return (
    <article>
      <div className="flex items-start gap-4 sm:gap-5">
        <DitherImage
          src={node.foto}
          alt={`Potret ${node.nama}`}
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          sizes="112px"
          className="aspect-[4/5] w-24 shrink-0 sm:w-28"
        />

        <div className="min-w-0">
          <p className="font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">
            {`// ${node.jabatan}`}
          </p>
          <h2
            key={node.id}
            ref={focusOnMount}
            id={headingId}
            tabIndex={-1}
            className="mt-3 text-lg leading-snug font-bold text-fg"
          >
            {node.nama}
          </h2>
          <p className="mt-2 text-[11px] leading-5 text-dim">
            divisi {node.divisi} · angkatan {node.angkatan}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm leading-7 text-muted">{node.bio}</p>

      <dl className="mt-6 space-y-3 border-y-2 border-line-soft py-4 text-sm leading-6">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-2">
          <dt className="text-dim">
            atasan <span aria-hidden className="text-accent-fg">-&gt;</span>
          </dt>
          <dd>
            {parent ? (
              <PointerButton
                label={parent.nama}
                detail={parent.jabatan.toLowerCase()}
                onClick={() => onOpen(parent.slug)}
              />
            ) : (
              <span className="text-syn-number">
                NULL <span className="text-[11px] text-dim">— puncak struktur</span>
              </span>
            )}
          </dd>
        </div>

        {node.children.length > 0 ? (
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-2">
            <dt className="text-dim">
              bawahan <span aria-hidden className="text-accent-fg">-&gt;</span>
            </dt>
            <dd>
              <ul className="space-y-2">
                {node.children.map((child) => (
                  <li key={child.id}>
                    <PointerButton
                      label={child.nama}
                      detail={child.jabatan.toLowerCase()}
                      onClick={() => onOpen(child.slug)}
                    />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      {socials.length > 0 ? (
        <ul aria-label="Kontak" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs">
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

      {node.tentorSlug || node.hallOfFameSlug ? (
        <div className="mt-6 flex flex-col gap-2 text-xs">
          {node.tentorSlug ? (
            <Link href={`/tentor/${node.tentorSlug}`} className="text-accent-fg hover:underline">
              juga tentor — lihat profilnya <span aria-hidden>-&gt;</span>
            </Link>
          ) : null}
          {node.hallOfFameSlug ? (
            <Link href={`/hall-of-fame/${node.hallOfFameSlug}`} className="text-accent-fg hover:underline">
              pernah menang challenge — lihat di hall of fame <span aria-hidden>-&gt;</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
