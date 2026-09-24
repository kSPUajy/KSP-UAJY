import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * Home-screen icon. iOS ignores SVG icons, so the placeholder mark from
 * `public/logo/ksp-mark.svg` is redrawn here as a PNG.
 *
 * TODO(brand): replace along with the real logo.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ff3d8b',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 16 16" fill="#10121a">
          <rect x="4" y="0" width="8" height="2" />
          <rect x="2" y="2" width="4" height="2" />
          <rect x="10" y="2" width="4" height="2" />
          <rect x="0" y="4" width="4" height="8" />
          <rect x="2" y="12" width="4" height="2" />
          <rect x="10" y="12" width="4" height="2" />
          <rect x="4" y="14" width="8" height="2" />
        </svg>
      </div>
    ),
    size,
  )
}
