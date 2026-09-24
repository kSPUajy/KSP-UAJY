'use client'

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'ksp-theme'
const DEFAULT_THEME: Theme = 'dark'

/**
 * Runs before first paint, inlined in <head>. Keep it in sync with
 * `writeTheme` below — this is the only reason the site never flashes.
 *
 * No stored preference means dark: the spec asks for a dark default rather
 * than following `prefers-color-scheme`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t='${DEFAULT_THEME}'}var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-palette',t)}catch(_){}})()`

function writeTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  // The page-level palette. Sections can override it locally to invert a
  // band; `color-scheme` rides along with the palette in CSS.
  root.setAttribute('data-palette', theme)
}

/**
 * `<html data-theme>` is the source of truth, not React state — the inline
 * head script has already set it before React exists. React subscribes to the
 * attribute instead of trying to own it, which also makes cross-tab sync fall
 * out for free.
 */
function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  const handleStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return
    // Writing the attribute trips the observer, which notifies React.
    writeTheme(event.newValue === 'light' ? 'light' : DEFAULT_THEME)
  }
  window.addEventListener('storage', handleStorage)

  return () => {
    observer.disconnect()
    window.removeEventListener('storage', handleStorage)
  }
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : DEFAULT_THEME
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next: Theme) => {
    writeTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode or blocked storage: the switch still works this session.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme harus dipakai di dalam <ThemeProvider>')
  return context
}
