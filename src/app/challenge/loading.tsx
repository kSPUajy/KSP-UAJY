import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

/** The archive's shape: the flag bar, then a column of rows. */
export default function ChallengeLoading() {
  return (
    <div data-accent="magenta" role="status" aria-label="Memuat arsip challenge">
      <PageHeaderSkeleton />
      <div className="border-b-2 border-line bg-canvas">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-16" />
          <div className="mt-8 flex flex-col gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-2 border-line-soft p-4 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
                <Skeleton className="h-6" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
