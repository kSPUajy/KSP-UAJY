import { modulPath, modulRange } from '@/components/sections/modul/modul-format'
import { ButtonAnchor } from '@/components/ui/Button'
import { MeterBar } from '@/components/ui/MeterBar'
import { StructBlock } from '@/components/ui/StructBlock'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { ModulWithStatus } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type CurrentModulProps = {
  modul: ModulWithStatus
  total: number
}

/**
 * This week's module, opened like a file: what it covers, who teaches it,
 * and the file itself once it has been uploaded. The gauge under it is the
 * semester so far.
 */
export function CurrentModul({ modul, total }: CurrentModulProps) {
  return (
    <TerminalWindow
      title={modulPath(modul)}
      bodyClassName="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-12"
    >
      <div className="min-w-0">
        <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
          {`// minggu ${pad2(modul.minggu)} dari ${pad2(total)}`}
        </p>
        <h3 className="mt-4 text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-bold tracking-tight text-fg">
          {modul.judul}
        </h3>
        <p className="mt-4 max-w-prose text-sm leading-7 text-muted">{modul.ringkasan}</p>

        <div className="mt-8">
          {modul.berkasUrl ? (
            <ButtonAnchor href={modul.berkasUrl} size="lg">
              buka modul
              <span aria-hidden>↗</span>
              <span className="sr-only">(membuka tab baru)</span>
            </ButtonAnchor>
          ) : (
            <p className="border-l-2 border-accent-fg pl-4 text-[12px] leading-6 text-muted">
              Berkas modul dibagikan di kelas, lalu diunggah di sini setelahnya.
            </p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <StructBlock
          type="modul"
          name={`minggu_${pad2(modul.minggu)}`}
          label={`Detail modul minggu ${modul.minggu}`}
          fields={[
            { key: 'periode', value: modulRange(modul) },
            { key: 'tentor_pj', value: modul.tentorPj.join(', ') },
            { key: 'koordinator', value: modul.koordinator },
          ]}
        />
        <div>
          <p className="flex justify-between text-[11px] leading-5 text-dim">
            <span>progres semester</span>
            <span className="text-accent-fg tabular-nums">
              {pad2(modul.minggu)}/{pad2(total)}
            </span>
          </p>
          <MeterBar
            value={modul.minggu}
            max={total}
            label={`Minggu ${modul.minggu} dari ${total}`}
            striped
            thick
            className="mt-2"
          />
        </div>
      </div>
    </TerminalWindow>
  )
}
