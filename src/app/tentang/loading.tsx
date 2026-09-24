import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** Header, then a text column beside a panel — the first band of the page. */
export default function TentangLoading() {
  return (
    <div data-accent="violet" role="status" aria-label="Memuat tentang">
      <PageHeaderSkeleton />
      <div className="tint-bg">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-2/3" />
            <SkeletonText lines={4} />
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    </div>
  )
}
