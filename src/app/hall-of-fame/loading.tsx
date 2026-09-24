import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

/** The podium's three steps, then the table's rows. */
export default function HallOfFameLoading() {
  return (
    <div data-accent="orange" role="status" aria-label="Memuat hall of fame">
      <PageHeaderSkeleton />
      <div className="tint-bg border-b-2 border-line">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-3 items-end gap-2 px-4 py-16 sm:gap-6">
          {['h-24 sm:h-32', 'h-32 sm:h-44', 'h-16 sm:h-24'].map((height) => (
            <div key={height} className="space-y-4">
              <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[12rem]" />
              <Skeleton className={height} />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] space-y-3 px-4 py-16 sm:px-6 lg:px-8">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    </div>
  )
}
