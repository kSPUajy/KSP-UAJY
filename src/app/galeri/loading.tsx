import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

/** Frame heights of a plausible contact sheet, so the columns look ragged. */
const HEIGHTS = ['h-40', 'h-56', 'h-44', 'h-64', 'h-36', 'h-52', 'h-48', 'h-60']

export default function GaleriLoading() {
  return (
    <div data-accent="magenta" role="status" aria-label="Memuat galeri">
      <PageHeaderSkeleton />
      <div className="bg-canvas-alt">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-16" />
          <div className="mt-8 columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
            {HEIGHTS.map((height, index) => (
              <Skeleton key={index} className={`mb-3 break-inside-avoid sm:mb-4 ${height}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
