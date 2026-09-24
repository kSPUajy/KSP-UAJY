import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** The card on the left, a win and its code on the right. */
export default function WinnerCardLoading() {
  return (
    <div data-accent="orange" role="status" aria-label="Memuat kartu juara" className="border-b-2 border-line bg-canvas dot-grid">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-6 h-3 w-64" />
        <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14">
          <div className="space-y-4 border-2 border-line-soft p-4 sm:p-6">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-24" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-2/3" />
            <SkeletonText lines={2} />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    </div>
  )
}
