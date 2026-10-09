import { createContext, useContext, type ReactNode } from 'react'
import type { L, Lang } from '../types'
import { en } from './en'
import { pt, type Key } from './pt'

const DICTS: Record<Lang, Record<Key, string>> = { pt, en }

export type T = {
  lang: Lang
  t: (key: Key, vars?: Record<string, string | number>) => string
  /** picks the current language out of a bilingual text */
  l: (text: L) => string
}

function makeT(lang: Lang): T {
  return {
    lang,
    t: (key, vars) => DICTS[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? '')),
    l: (text) => text[lang],
  }
}

const I18nContext = createContext<T>(makeT('pt'))

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <I18nContext.Provider value={makeT(lang)}>{children}</I18nContext.Provider>
}

export const useT = () => useContext(I18nContext)

/** "+3", "−2", "0": typographic minus so negatives line up with the card text */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
export const plain = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n))
