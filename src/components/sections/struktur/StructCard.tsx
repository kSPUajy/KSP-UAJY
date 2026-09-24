import { CodeSnippet } from '@/components/ui/CodeSnippet'
import { DitherImage } from '@/components/ui/DitherImage'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { OrgNode } from '@/lib/org'
import { PORTRAIT } from '@/lib/types'

type StructCardProps = {
  node: OrgNode
  onOpen: (slug: string) => void
}

/**
 * One member, drawn as the type their role declares:
 *
 *     typedef struct {
 *       char *nama, *jabatan;
 *       int angkatan;
 *     } KepalaDivisiAkademik;
 *
 * Valid C — the declaration is the role, the person sits above it.
 *
 * The whole card is one button laid over everything, so the focus ring
 * outlines the card rather than a word inside it. Its label says who and
 * what; the code underneath is hidden from assistive tech as decoration.
 */
export function StructCard({ node, onOpen }: StructCardProps) {
  const declaration = `typedef struct {\n  char *nama, *jabatan;\n  int angkatan;\n} ${node.typeName};`

  return (
    <TerminalWindow
      title={`~/struktur/${node.fileName}.h`}
      titleHover={`$ cat ${node.fileName}.h`}
      interactive
    >
      <div className="flex items-start gap-3">
        <DitherImage
          src={node.foto}
          alt={`Potret ${node.nama}`}
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          sizes="48px"
          className="aspect-[4/5] w-12 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm leading-5 font-bold text-fg">{node.nama}</p>
          <p className="mt-1 text-[11px] leading-4 text-dim">
            {node.jabatan} · {node.angkatan}
          </p>
        </div>
      </div>

      <div aria-hidden className="mt-4 border-t-2 border-line-soft pt-3">
        <CodeSnippet code={declaration} />
      </div>

      <button
        type="button"
        onClick={() => onOpen(node.slug)}
        aria-label={`${node.nama}, ${node.jabatan}. Buka detail.`}
        className="absolute inset-0 z-10 cursor-pointer"
      />
    </TerminalWindow>
  )
}
