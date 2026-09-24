/**
 * The hero's entrance, as one timeline in seconds.
 *
 * Shared by the server component that renders the stats strip (its count-up
 * has to wait for its own beat) and the client component that orchestrates
 * the rest, so the two can never drift out of step.
 *
 *   start     the prompt begins typing. Long enough that on a first visit the
 *             CRT power-on (~620ms from first paint) has finished by the time
 *             hydration is done and this clock starts.
 *   raster    the wordmark renders in, band by band, top to bottom
 *   name …    everything after follows on fixed offsets
 */

export const HERO_START = 0.35
export const HERO_CHAR_DELAY = 0.022
export const HERO_RASTER_BANDS = 6
export const HERO_RASTER_STAGGER = 0.05

export type HeroTimeline = {
  typed: number
  raster: number
  name: number
  tagline: number
  actions: number
  /** The short schedule printout under the buttons. */
  status: number
  /** The module panel in the right-hand column, after the buttons. */
  aside: number
  footer: number
  countUp: number
}

export function heroTimeline(command: string): HeroTimeline {
  const typed = HERO_START + Array.from(command).length * HERO_CHAR_DELAY
  const raster = typed + 0.14

  return {
    typed,
    raster,
    name: raster + 0.38,
    tagline: raster + 0.5,
    actions: raster + 0.62,
    status: raster + 0.68,
    aside: raster + 0.7,
    footer: raster + 0.78,
    countUp: raster + 0.9,
  }
}
