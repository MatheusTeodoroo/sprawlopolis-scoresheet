import type { Draft, Game, Settings, Side, Zones } from '../types'

export const KEYS = {
  games: 'sprawl.v1.games',
  draft: 'sprawl.v1.draft',
  settings: 'sprawl.v1.settings',
} as const

export const emptyZones = (): Zones => ({ residential: 0, commercial: 0, industrial: 0, park: 0 })
export const emptySide = (): Side => ({ zones: emptyZones(), roads: 0, cardPoints: [0, 0], modifier: 0, tiebreak: 0 })

export function today(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function emptyDraft(keep?: Pick<Draft, 'mode' | 'players'>): Draft {
  return {
    mode: keep?.mode ?? 'coop',
    date: today(),
    cityName: '',
    players: keep?.players ?? [],
    notes: '',
    coop: {
      difficulty: 'normal',
      cards: [null, null, null],
      cardPoints: [0, 0, 0],
      zones: emptyZones(),
      roads: 0,
      expansions: {},
      modifier: 0,
    },
    vs: { interstateCard: null, cards: [null, null], sides: [emptySide(), emptySide()] },
  }
}

export const defaultSettings = (): Settings => ({
  lang: typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en',
  theme: 'system',
})

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNums = (v: unknown, len: number) => Array.isArray(v) && v.length === len && v.every(isNum)
const isZones = (v: unknown) => isObj(v) && ['residential', 'commercial', 'industrial', 'park'].every((z) => isNum(v[z]))

export function isGame(v: unknown): v is Game {
  if (!isObj(v)) return false
  if (typeof v.id !== 'string' || typeof v.date !== 'string') return false
  if (!Array.isArray(v.players) || !v.players.every((p) => typeof p === 'string')) return false
  if (v.mode === 'coop') {
    return (
      isNums(v.cards, 3) && isNums(v.cardPoints, 3) && isZones(v.zones) && isNum(v.roads) && isNum(v.modifier) &&
      isNum(v.total) && isNum(v.target) && typeof v.won === 'boolean' && isObj(v.expansions) && Array.isArray(v.achievements)
    )
  }
  if (v.mode === 'competitive') {
    return (
      typeof v.interstateCard === 'string' && isNums(v.cards, 2) && isNums(v.scores, 2) && v.players.length === 2 &&
      (v.winner === null || v.winner === 0 || v.winner === 1) &&
      Array.isArray(v.sides) && v.sides.length === 2 &&
      v.sides.every((s) => isObj(s) && isZones(s.zones) && isNum(s.roads) && isNums(s.cardPoints, 2) && isNum(s.modifier))
    )
  }
  return false
}

export function exportGames(games: Game[]): string {
  return JSON.stringify({ app: 'sprawlopolis-scoresheet', version: 1, games }, null, 2)
}

/** Returns the valid games found in an export file, or throws if the file is not one. */
export function parseImport(text: string): Game[] {
  const data: unknown = JSON.parse(text)
  const list = Array.isArray(data) ? data : isObj(data) && Array.isArray(data.games) ? data.games : null
  if (!list) throw new Error('invalid file')
  return list.filter(isGame)
}

/** Adds incoming games that are not already present (by id), newest first. */
export function mergeGames(existing: Game[], incoming: Game[]): { games: Game[]; added: number } {
  const ids = new Set(existing.map((g) => g.id))
  const fresh = incoming.filter((g) => !ids.has(g.id))
  const games = [...existing, ...fresh].sort((a, b) => b.date.localeCompare(a.date))
  return { games, added: fresh.length }
}
