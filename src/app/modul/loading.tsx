import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** This week's card, then the rail. */
export default function ModulLoading() {
  return (
    <div data-accent="cyan" role="status" aria-label="Memuat modul">
      <PageHeaderSkeleton />
      <div className="tint-bg">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-24" />
          <div className="mt-10 grid grid-cols-1 gap-8 border-2 border-line-soft p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <div className="space-y-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-2/3" />
              <SkeletonText lines={2} />
            </div>
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-6 border-l-2 border-line-soft pl-8">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
