import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

import type { AccentName } from '@/lib/accent'
import { siteConfig } from '@/site.config'

/**
 * Share cards. Every route's `opengraph-image.tsx` calls `renderOgCard`, so
 * a link pasted into a chat always arrives as the same object: a terminal
 * window on the dot grid, with the path of the page in its title bar, the
 * command that opens it, and the page's title.
 *
 * Satori, the renderer behind `ImageResponse`, reads TTF rather than the
 * woff2 that `next/font` serves, so the two faces are kept as files in
 * `src/assets/fonts` (both SIL Open Font License; the licences sit beside
 * them). They are read once, at module scope, and every card is generated
 * at build time.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

/** The dark palette, literal — Satori resolves no CSS variables. */
const INK = {
  canvas: '#0b0d12',
  surface: '#141926',
  surface2: '#1b2233',
  fg: '#e8e4d6',
  muted: '#9a9c93',
  dim: '#8d919b',
  dot: '#232a3a',
  accentInk: '#10121a',
} as const

/** Same values as the `[data-accent]` blocks in globals.css. */
const ACCENT_HEX: Record<AccentName, string> = {
  magenta: '#ff3d8b',
  amber: '#ffb020',
  cyan: '#2fd8e0',
  lime: '#67e06a',
  violet: '#a98bff',
  orange: '#ff6b35',
}

const FONT_DIR = path.join(process.cwd(), 'src', 'assets', 'fonts')

/** The wordmark, inlined as a data URL: Satori renders images from data, not paths. */
const logo = readFile(path.join(process.cwd(), 'src', 'assets', 'img', 'ksp-logo.png')).then(
  (bytes) => `data:image/png;base64,${bytes.toString('base64')}`,
)

const fonts = Promise.all([
  readFile(path.join(FONT_DIR, 'Silkscreen-Regular.ttf')),
  readFile(path.join(FONT_DIR, 'JetBrainsMono-Regular.ttf')),
  readFile(path.join(FONT_DIR, 'JetBrainsMono-Bold.ttf')),
]).then(([silkscreen, monoRegular, monoBold]) => [
  { name: 'Silkscreen', data: silkscreen, weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: monoRegular, weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: monoBold, weight: 700 as const, style: 'normal' as const },
])

export type OgCard = {
  accent: AccentName
  /** Window title: the page's path, e.g. `~/berita/2026-04/tiga-kesalahan-malloc.md`. */
  file: string
  /** The command that "opened" the page, after the `$`. */
  command: string
  /** Section label, printed as `// BERITA`. */
  eyebrow: string
  title: string
  subtitle?: string
}

/** Cuts at the last whole word that fits, with an ellipsis. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${cut.slice(0, space > max * 0.6 ? space : max).replace(/[,.;:—–-]+$/, '')}…`
}

/** Long titles step down so the card never needs more than three lines. */
function titleSize(title: string): number {
  if (title.length <= 28) return 72
  if (title.length <= 48) return 58
  if (title.length <= 72) return 50
  return 42
}

export async function renderOgCard({ accent, file, command, eyebrow, title, subtitle }: OgCard): Promise<ImageResponse> {
  const color = ACCENT_HEX[accent]
  const heading = clip(title, 96)
  const host = siteConfig.url.replace(/^https?:\/\//, '')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '40px 56px 56px 40px',
          backgroundColor: INK.canvas,
          backgroundImage: `radial-gradient(circle, ${INK.dot} 2px, transparent 2px)`,
          backgroundSize: '24px 24px',
          fontFamily: 'JetBrains Mono',
          color: INK.fg,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: `3px solid ${INK.fg}`,
            backgroundColor: INK.surface,
            boxShadow: `14px 14px 0 0 ${color}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 56,
              padding: '0 24px',
              borderBottom: `3px solid ${INK.fg}`,
              backgroundColor: INK.surface2,
              fontSize: 22,
              color: INK.dim,
            }}
          >
            <span style={{ color }}>[■]</span>
            <span>[□][✕]</span>
            <span style={{ marginLeft: 20 }}>{clip(file, 70)}</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 48px 32px' }}>
            <div style={{ display: 'flex', fontSize: 24, color: INK.muted }}>
              <span style={{ color, marginRight: 14 }}>$</span>
              <span>{clip(command, 64)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 30,
                fontFamily: 'Silkscreen',
                fontSize: 24,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color,
              }}
            >
              {`// ${eyebrow}`}
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: titleSize(heading),
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              {heading}
            </div>

            {subtitle ? (
              <div style={{ display: 'flex', marginTop: 16, fontSize: 24, lineHeight: 1.45, color: INK.muted }}>
                {clip(subtitle, 120)}
              </div>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 24, fontSize: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
              <img src={await logo} width={98} height={40} alt="" style={{ marginRight: 20 }} />
              <span style={{ color: INK.muted }}>
                {siteConfig.name} · {siteConfig.campus.short}
              </span>
              <span style={{ marginLeft: 'auto', color: INK.dim }}>{host}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts },
  )
}

/** Instagram's portrait feed size; Stories show it whole on a blurred band. */
export const IG_SIZE = { width: 1080, height: 1350 } as const

export type IgCard = {
  /** A data URL or fetchable JPEG/PNG; null draws a plain panel instead. */
  cover: string | null
  /** e.g. `berita · fakta`. */
  eyebrow: string
  title: string
  excerpt: string
  /** Site-relative path of the article, printed as where to read the rest. */
  path: string
}

/** Headline size for the portrait card: fewer, bigger lines than the OG card. */
function igTitleSize(title: string): number {
  if (title.length <= 30) return 76
  if (title.length <= 50) return 64
  return 54
}

/**
 * The same object as the share card, stood upright for an Instagram post:
 * the terminal window, the article's cover across the top, then the kicker,
 * the headline, the standfirst, and where to read the rest. Satori fetches
 * the cover itself.
 */
export async function renderIgCard({ cover, eyebrow, title, excerpt, path: articlePath }: IgCard): Promise<ImageResponse> {
  const color = ACCENT_HEX.amber
  const host = siteConfig.url.replace(/^https?:\/\//, '')
  const heading = clip(title, 80)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '56px 72px 76px 56px',
          backgroundColor: INK.canvas,
          backgroundImage: `radial-gradient(circle, ${INK.dot} 2px, transparent 2px)`,
          backgroundSize: '24px 24px',
          fontFamily: 'JetBrains Mono',
          color: INK.fg,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: `4px solid ${INK.fg}`,
            backgroundColor: INK.surface,
            boxShadow: `18px 18px 0 0 ${color}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 64,
              padding: '0 28px',
              borderBottom: `4px solid ${INK.fg}`,
              backgroundColor: INK.surface2,
              fontSize: 24,
              color: INK.dim,
            }}
          >
            <span style={{ color }}>[■]</span>
            <span>[□][✕]</span>
            <span style={{ marginLeft: 22 }}>{`~${clip(articlePath, 40)}`}</span>
          </div>

          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only
            <img src={cover} width={944} height={531} alt="" style={{ objectFit: 'cover', borderBottom: `4px solid ${INK.fg}` }} />
          ) : (
            <div
              style={{
                width: 944,
                height: 531,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: `4px solid ${INK.fg}`,
                backgroundColor: INK.canvas,
                backgroundImage: `radial-gradient(circle, ${INK.dot} 3px, transparent 3px)`,
                backgroundSize: '28px 28px',
                fontFamily: 'Silkscreen',
                fontSize: 64,
                letterSpacing: 6,
                color,
              }}
            >
              KABAR KSP
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 48px 40px' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Silkscreen',
                fontSize: 26,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color,
              }}
            >
              {`// ${eyebrow}`}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: igTitleSize(heading),
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: -1,
              }}
            >
              {heading}
            </div>
            <div style={{ display: 'flex', marginTop: 22, fontSize: 28, lineHeight: 1.45, color: INK.muted }}>
              {clip(excerpt, 170)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 28, fontSize: 24 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
              <img src={await logo} width={108} height={44} alt="" style={{ marginRight: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: INK.muted, fontSize: 22 }}>baca selengkapnya di</span>
                <span style={{ color, fontSize: 28, fontWeight: 700 }}>{`${host}/berita`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...IG_SIZE, fonts: await fonts },
  )
}
