import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** A statement's shape: title band, prose on the left, the sidebar on the right. */
export default function ChallengeDetailLoading() {
  return (
    <div data-accent="magenta" role="status" aria-label="Memuat soal">
      <div className="border-b-2 border-line bg-canvas dot-grid">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-12 sm:px-6 sm:pt-10 lg:px-8">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-6 h-3 w-64" />
          <Skeleton className="mt-8 h-3 w-24" />
          <Skeleton className="mt-4 h-10 w-full max-w-xl" />
          <Skeleton className="mt-6 h-6 w-72" />
        </div>
      </div>
      <div className="tint-bg border-b-2 border-line">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:px-8">
          <div className="max-w-[68ch] space-y-8">
            <SkeletonText lines={4} />
            <Skeleton className="h-5 w-48" />
            <SkeletonText lines={3} />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-36" />
            <Skeleton className="h-40" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
