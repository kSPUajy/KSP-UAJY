/**
 * 16 × 16 pixel icons for the tracks, drawn here rather than borrowed:
 * C has no official logo and Java's belongs to Oracle, so each is an
 * original pixel drawing of the idea — the hexagon C, a coffee cup, data
 * points with a fitted line, linked blocks. Rendered as crisp SVG squares in
 * `currentColor`.
 */
export type PixelIconName = 'c' | 'java' | 'ml' | 'blockchain'

/** `#` is ink, anything else is empty. */
function fromRows(rows: readonly string[]): Set<string> {
  const on = new Set<string>()
  rows.forEach((row, y) => [...row].forEach((cell, x) => cell === '#' && on.add(`${x},${y}`)))
  return on
}

const C_ICON = (() => {
  // A hexagon…
  const spans: Array<[number, number]> = [
    [6, 9], [4, 11], [2, 13], [1, 14],
    [0, 15], [0, 15], [0, 15], [0, 15], [0, 15], [0, 15], [0, 15], [0, 15],
    [1, 14], [2, 13], [4, 11], [6, 9],
  ]
  const on = new Set<string>()
  spans.forEach(([from, to], y) => {
    for (let x = from; x <= to; x += 1) on.add(`${x},${y}`)
  })
  // …with a C cut out of it.
  const cut = [
    [4, [6, 7, 8, 9, 10]], [5, [5, 6]], [6, [4, 5]], [7, [4, 5]],
    [8, [4, 5]], [9, [4, 5]], [10, [5, 6]], [11, [6, 7, 8, 9, 10]],
  ] as const
  for (const [y, xs] of cut) for (const x of xs) on.delete(`${x},${y}`)
  return on
})()

const JAVA_ICON = fromRows([
  '....#..#..#.....',
  '...#..#..#......',
  '....#..#..#.....',
  '...#..#..#......',
  '................',
  '.############...',
  '.##############.',
  '.############..#',
  '.############..#',
  '.##############.',
  '..##########....',
  '...########.....',
  '................',
  '##############..',
  '.############...',
  '................',
])

const BLOCKCHAIN_ICON = fromRows([
  '................',
  '................',
  '................',
  '................',
  '................',
  '####..####..####',
  '#..#..#..#..#..#',
  '#..####..####..#',
  '#..####..####..#',
  '#..#..#..#..#..#',
  '####..####..####',
  '................',
  '................',
  '................',
  '................',
  '................',
])

/** Learning from data: points on a chart, and the line fitted through them. */
const ML_ICON = (() => {
  const on = new Set<string>()
  // Axes.
  for (let y = 0; y <= 15; y += 1) on.add(`0,${y}`)
  for (let x = 0; x <= 15; x += 1) on.add(`${x},15`)
  // The fitted line, Bresenham from bottom-left to top-right.
  let [x, y] = [2, 13]
  const [x1, y1] = [15, 1]
  const dx = Math.abs(x1 - x)
  const dy = -Math.abs(y1 - y)
  let err = dx + dy
  for (;;) {
    on.add(`${x},${y}`)
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += 1
    }
    if (e2 <= dx) {
      err += dx
      y -= 1
    }
  }
  // The data points it was fitted to, a little off the line either side.
  for (const [px, py] of [[3, 9], [6, 12], [8, 5], [11, 8], [13, 1]] as const) {
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) on.add(`${px + ox},${py + oy}`)
  }
  return on
})()

const ICONS: Record<PixelIconName, Set<string>> = {
  c: C_ICON,
  java: JAVA_ICON,
  ml: ML_ICON,
  blockchain: BLOCKCHAIN_ICON,
}

export function PixelIcon({ name, className }: { name: PixelIconName; className?: string }) {
  const pixels = [...ICONS[name]].map((key) => key.split(',').map(Number) as [number, number])
  // Frame the drawing itself, not the whole 16 × 16 grid, so a short icon
  // (the chain is six rows tall) fills its space like a square one does.
  const xs = pixels.map(([x]) => x)
  const ys = pixels.map(([, y]) => y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const width = Math.max(...xs) - minX + 1
  const height = Math.max(...ys) - minY + 1
  return (
    <svg
      aria-hidden
      viewBox={`${minX} ${minY} ${width} ${height}`}
      shapeRendering="crispEdges"
      className={className}
      fill="currentColor"
    >
      {pixels.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  )
}
