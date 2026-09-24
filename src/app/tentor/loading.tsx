import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

/** The card grid's own shape: portrait, name, two tags — eight times. */
export default function TentorLoading() {
  return (
    <div data-accent="cyan" role="status" aria-label="Memuat daftar tentor">
      <PageHeaderSkeleton />
      <div className="border-b-2 border-line bg-canvas-alt">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-x-4 gap-y-6 px-4 py-16 sm:grid-cols-3 sm:gap-6 sm:px-6 lg:grid-cols-4 lg:px-8">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-8" />
              <Skeleton className="aspect-[4/5]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
