import { CopyButton } from '@/components/ui/CopyButton'
import type { SampleIO } from '@/lib/types'

type SampleTranscriptProps = {
  sample: SampleIO
  index: number
}

/**
 * One sample as the shell session that would produce it — input fed in as a
 * here-document, output printed after:
 *
 *     $ ./solusi <<EOF
 *     5
 *     21 24 23 27 20
 *     EOF
 *     rata-rata: 23.00
 *
 * The shell syntax is decoration and hidden from assistive tech, which hears
 * "Masukan: …" and "Keluaran: …" instead. The copy button takes the input
 * alone, ready to paste into a terminal or a file.
 */
export function SampleTranscript({ sample, index }: SampleTranscriptProps) {
  const number = index + 1

  return (
    <figure className="border-2 border-line bg-code-bg">
      <figcaption className="flex items-center justify-between gap-3 border-b-2 border-line-soft px-3 py-1.5">
        <span className="text-[11px] leading-5 text-dim">contoh {number}</span>
        <CopyButton
          text={sample.input}
          label={`Salin masukan contoh ${number}`}
          doneMessage={`Masukan contoh ${number} tersalin`}
        />
      </figcaption>

      <pre className="overflow-x-auto px-3 py-3 font-mono text-[12px] leading-5" tabIndex={0}>
        <code>
          <span aria-hidden className="text-syn-punct">
            {'$ '}
          </span>
          <span aria-hidden className="text-muted">
            {'./solusi <<EOF\n'}
          </span>
          <span className="sr-only">Masukan: </span>
          <span className="text-syn-string">{`${sample.input}\n`}</span>
          <span aria-hidden className="text-muted">
            {'EOF\n'}
          </span>
          <span className="sr-only">Keluaran: </span>
          <span className="text-fg">{sample.output}</span>
        </code>
      </pre>

      <p className="border-t-2 border-line-soft px-3 py-2 text-[12px] leading-5 text-syn-comment">
        <span aria-hidden>{'# '}</span>
        {sample.penjelasan}
      </p>
    </figure>
  )
}
