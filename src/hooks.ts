import { useCallback, useEffect, useState } from 'react'
import type { Settings } from './types'

/** State mirrored to localStorage. `revive` repairs or rejects whatever was stored. */
export function useLocalStorage<T>(key: string, init: () => T, revive?: (stored: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return init()
      const parsed: unknown = JSON.parse(raw)
      return revive ? revive(parsed) : (parsed as T)
    } catch {
      return init()
    }
  })

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // storage full or blocked: keep working in memory
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set] as const
}

/** Applies the chosen theme to <html data-theme>, following the system when set to "system". */
export function useTheme(theme: Settings['theme']) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1c1a17' : '#7a6f5d')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
