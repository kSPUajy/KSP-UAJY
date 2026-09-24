import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** An article's shape: header, wide cover, then the body beside its aside. */
export default function BeritaDetailLoading() {
  return (
    <div data-accent="amber" role="status" aria-label="Memuat berita">
      <div className="border-b-2 border-line bg-canvas dot-grid">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-12 sm:px-6 sm:pt-10 lg:px-8">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-6 h-3 w-64" />
          <Skeleton className="mt-8 h-5 w-40" />
          <Skeleton className="mt-5 h-10 w-full max-w-3xl" />
          <SkeletonText lines={2} className="mt-6 max-w-prose" />
        </div>
      </div>
      <div className="tint-bg">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Skeleton className="aspect-video w-full sm:aspect-[21/9]" />
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div className="measure space-y-8">
              <SkeletonText lines={4} />
              <SkeletonText lines={5} />
              <SkeletonText lines={3} />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-3 w-24" />
              <SkeletonText lines={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
