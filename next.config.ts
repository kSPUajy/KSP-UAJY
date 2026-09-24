import type { NextConfig } from 'next'

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname
  } catch {
    return ''
  }
})()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Seed imagery is served by picsum.photos, which 302s to its Fastly CDN.
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'fastly.picsum.photos', pathname: '/**' },
      // Images uploaded from the admin panel (public buckets only).
      ...(SUPABASE_HOST
        ? [{ protocol: 'https' as const, hostname: SUPABASE_HOST, pathname: '/storage/v1/object/public/**' }]
        : []),
    ],
  },
  // MDX bodies and the share-card fonts are read from disk at render time.
  // Keep them in the trace so they still resolve if a route ever stops being
  // fully static.
  outputFileTracingIncludes: {
    '/**': ['./src/content/**/*', './src/assets/fonts/*.ttf'],
  },
}

export default nextConfig
