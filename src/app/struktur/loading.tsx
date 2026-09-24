import { PageHeaderSkeleton } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'

/** Shaped like the chart it stands in for: one card on top, four columns below. */
export default function StrukturLoading() {
  return (
    <div data-accent="violet" role="status" aria-label="Memuat struktur organisasi">
      <PageHeaderSkeleton />
      <div className="tint-bg border-b-2 border-line">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-10 h-48 max-w-xl lg:mx-auto lg:max-w-sm" />
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex flex-col gap-6 pl-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-48" />
                <Skeleton className="ml-6 h-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
