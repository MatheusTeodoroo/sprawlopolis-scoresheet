import type { Campaign, Draft, Game, Settings, Side, Zones } from '../types'

export const KEYS = {
  games: 'sprawl.v1.games',
  draft: 'sprawl.v1.draft',
  campaigns: 'sprawl.v1.campaigns',
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

export function isCampaign(v: unknown): v is Campaign {
  return (
    isObj(v) && typeof v.id === 'string' && typeof v.cityName === 'string' && typeof v.createdAt === 'string' &&
    Array.isArray(v.players) && isObj(v.draft) && Array.isArray(v.games) &&
    v.games.every((g) => isObj(g) && isNum(g.node) && isNum(g.stars) && isNums(g.drawn, 2) && isNums(g.cardPoints, 3) &&
      isZones(g.zones) && isNum(g.roads) && isObj(g.expansions) && typeof g.won === 'boolean')
  )
}

export function exportData(games: Game[], campaigns: Campaign[]): string {
  return JSON.stringify({ app: 'sprawlopolis-scoresheet', version: 1, games, campaigns }, null, 2)
}

/** Returns the valid games and campaigns found in an export file, or throws if the file is not one. */
export function parseImport(text: string): { games: Game[]; campaigns: Campaign[] } {
  const data: unknown = JSON.parse(text)
  const games = Array.isArray(data) ? data : isObj(data) && Array.isArray(data.games) ? data.games : null
  if (!games) throw new Error('invalid file')
  const campaigns = isObj(data) && Array.isArray(data.campaigns) ? data.campaigns : []
  return { games: games.filter(isGame), campaigns: campaigns.filter(isCampaign) }
}

/** Adds incoming items that are not already present (by id). */
function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): { items: T[]; added: number } {
  const ids = new Set(existing.map((x) => x.id))
  const fresh = incoming.filter((x) => !ids.has(x.id))
  return { items: [...existing, ...fresh], added: fresh.length }
}

/** Merged games come back newest first. */
export function mergeGames(existing: Game[], incoming: Game[]): { games: Game[]; added: number } {
  const { items, added } = mergeById(existing, incoming)
  return { games: items.sort((a, b) => b.date.localeCompare(a.date)), added }
}

export function mergeCampaigns(existing: Campaign[], incoming: Campaign[]): { campaigns: Campaign[]; added: number } {
  const { items, added } = mergeById(existing, incoming)
  return { campaigns: items, added }
}
