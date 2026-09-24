const STORAGE_KEY = 'ksp-crt'

/**
 * Decides, before first paint, whether this page load gets the power-on.
 *
 * Inlined in <head> next to the theme script. It marks the session the moment
 * it decides, so a reload mid-flicker does not play it twice; reduced motion
 * is left to the stylesheet, which strips the animation entirely.
 */
export const CRT_INIT_SCRIPT = `(function(){try{if(sessionStorage.getItem('${STORAGE_KEY}'))return;sessionStorage.setItem('${STORAGE_KEY}','1');document.documentElement.setAttribute('data-crt','on')}catch(_){}})()`

/**
 * CRT power-on: a beam draws across the middle of a blank screen, blooms, and
 * the page settles in through one soft flicker. ~600ms, once per session.
 *
 * Pure CSS on purpose — it has to start on the first frame, long before React
 * hydrates, and it must never run again on a client-side navigation. See the
 * keyframes in globals.css. Inert and hidden from assistive tech throughout.
 */
export function CrtPowerOn() {
  return (
    <div aria-hidden className="crt-flicker pointer-events-none fixed inset-0 z-70 bg-canvas">
      <span className="crt-flicker-beam absolute inset-x-0 top-1/2 -mt-px block h-[2px] bg-fg" />
    </div>
  )
}
