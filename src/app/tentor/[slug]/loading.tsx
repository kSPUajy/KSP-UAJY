import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** A profile's shape: the card on the left, quote and sections on the right. */
export default function TentorProfileLoading() {
  return (
    <div data-accent="cyan" role="status" aria-label="Memuat profil tentor" className="border-b-2 border-line bg-canvas dot-grid">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-6 h-3 w-56" />
        <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
          <div className="border-2 border-line-soft p-4 sm:p-6">
            <div className="flex gap-4 lg:block">
              <Skeleton className="aspect-[4/5] w-28 shrink-0 lg:w-full" />
              <div className="flex-1 space-y-3 lg:mt-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            </div>
            <SkeletonText lines={3} className="mt-6" />
          </div>
          <div className="space-y-12">
            <SkeletonText lines={3} />
            <SkeletonText lines={4} />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-28" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
