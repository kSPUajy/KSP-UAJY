import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** The index's shape: the lead story split in two, then the log. */
export default function BeritaLoading() {
  return (
    <div data-accent="amber" role="status" aria-label="Memuat berita">
      <PageHeaderSkeleton />
      <div className="border-b-2 border-line tint-bg">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-24" />
          <div className="mt-10 grid grid-cols-1 border-2 border-line-soft lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Skeleton className="aspect-video border-0" />
            <div className="space-y-4 p-6 lg:p-10">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-full" />
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-16" />
        <div className="mt-8 flex max-w-4xl flex-col gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2 border-b-2 border-line-soft py-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
