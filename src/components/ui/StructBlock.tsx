import { cn } from '@/lib/utils'

export type StructField = {
  key: string
  value: string | number
  /** How the value is coloured and quoted. Strings get quotes, the rest do not. */
  kind?: 'string' | 'number' | 'ident'
}

type StructBlockProps = {
  /** The struct tag, e.g. `challenge` in `struct challenge minggu_12`. */
  type: string
  /** The variable name. */
  name: string
  fields: readonly StructField[]
  /** Names the list for assistive tech, e.g. "Detail challenge minggu 12". */
  label: string
  className?: string
}

const VALUE_CLASS: Record<NonNullable<StructField['kind']>, string> = {
  string: 'text-syn-string',
  number: 'text-syn-number',
  ident: 'text-syn-ident',
}

/**
 * Metadata written as a C designated initializer:
 *
 *     struct challenge minggu_12 = {
 *         .rilis   = "Senin, 21 Sep 2026",
 *         .peserta = 14,
 *     };
 *
 * Underneath it is an ordinary `<dl>`. Every piece of C punctuation — the
 * braces, the dots, the `=`, the quotes, the trailing commas — is hidden from
 * assistive tech, so a screen reader hears "rilis, Senin, 21 Sep 2026" and
 * never "dot rilis equals quote".
 */
export function StructBlock({ type, name, fields, label, className }: StructBlockProps) {
  // Pad every key to the longest so the `=` signs line up, as they would in
  // a hand-formatted initializer.
  const keyWidth = `${Math.max(...fields.map((field) => field.key.length)) + 1}ch`

  return (
    <div className={cn('border-2 border-line-soft bg-code-bg px-4 py-3 text-[12px] leading-6', className)}>
      <p aria-hidden className="truncate">
        <span className="text-syn-keyword">struct</span>{' '}
        <span className="text-syn-type">{type}</span>{' '}
        <span className="text-syn-ident">{name}</span>{' '}
        <span className="text-syn-punct">= {'{'}</span>
      </p>

      <dl aria-label={label} className="pl-4">
        {fields.map((field) => {
          const kind = field.kind ?? (typeof field.value === 'number' ? 'number' : 'string')
          const quote = kind === 'string' ? '"' : ''

          return (
            <div key={field.key} className="flex gap-2">
              <dt className="shrink-0 text-syn-ident" style={{ minWidth: keyWidth }}>
                <span aria-hidden className="text-syn-punct">
                  .
                </span>
                {field.key}
              </dt>
              <dd className="min-w-0 break-words">
                <span aria-hidden className="text-syn-punct">
                  ={' '}
                </span>
                <span className={VALUE_CLASS[kind]}>
                  <span aria-hidden>{quote}</span>
                  {field.value}
                  <span aria-hidden>{quote}</span>
                </span>
                <span aria-hidden className="text-syn-punct">
                  ,
                </span>
              </dd>
            </div>
          )
        })}
      </dl>

      <p aria-hidden className="text-syn-punct">
        {'};'}
      </p>
    </div>
  )
}
