import type { CoopDraft, Difficulty, ExpansionId, Expansions, ZoneId, Zones } from '../types'

export const ZONE_IDS: ZoneId[] = ['residential', 'commercial', 'industrial', 'park']
export const ROADWORK_PENALTIES = [-1, -2, -2, -3]

const neg = (n: number) => (n === 0 ? 0 : -n)

export function targetScore(cards: (number | null)[]): number {
  return cards.reduce<number>((sum, c) => sum + (c ?? 0), 0)
}

/** Zone scored in Hard mode: the largest group (first one wins ties). */
export function hardZone(zones: Zones): ZoneId {
  return ZONE_IDS.reduce((best, z) => (zones[z] > zones[best] ? z : best), ZONE_IDS[0])
}

export function blockScore(zones: Zones, difficulty: Difficulty): number {
  if (difficulty === 'hard') return zones[hardZone(zones)]
  return ZONE_IDS.reduce((sum, z) => sum + zones[z], 0)
}

export function scenicRoute(expansions: Expansions): boolean {
  return expansions.beaches?.card === 'scenic' && expansions.beaches.yes
}

export function roadTax(roads: number, difficulty: Difficulty, expansions: Expansions): number {
  return difficulty === 'easy' || scenicRoute(expansions) ? 0 : neg(roads)
}

export function businessPenalty(largestCommercial: number): number {
  if (largestCommercial <= 0) return 0
  if (largestCommercial === 1) return -2
  if (largestCommercial === 2) return -3
  return -4
}

export function expansionScores(expansions: Expansions, zones: Zones): Partial<Record<ExpansionId, number>> {
  const out: Partial<Record<ExpansionId, number>> = {}
  const { wrecktar, poi, beaches, construction, roadwork } = expansions
  if (wrecktar) out.wrecktar = wrecktar.commercial === 0 ? 3 : -2 * wrecktar.commercial
  if (poi) out.poi = poi.matches
  if (beaches) {
    out.beaches =
      beaches.card === 'lookout'
        ? beaches.yes ? 5 : 0
        : beaches.card === 'waterfront'
          ? beaches.count
          : beaches.card === 'peninsula'
            ? 10 - beaches.count
            : 0
  }
  if (construction) {
    out.construction =
      construction.card === 'business'
        ? construction.yes ? businessPenalty(zones.commercial) : 0
        : construction.card === 'noisy'
          ? neg(2 * construction.count)
          : construction.card === 'bulldozed'
            ? neg(construction.count)
            : construction.card === 'sudden'
              ? neg(2 * construction.count)
              : 0
  }
  if (roadwork) out.roadwork = roadwork.unplaced.reduce((sum, i) => sum + (ROADWORK_PENALTIES[i] ?? 0), 0)
  return out
}

export type CoopResult = {
  target: number
  blocks: number
  roads: number
  cards: number
  expansions: Partial<Record<ExpansionId, number>>
  expansionsTotal: number
  total: number
  won: boolean
}

export function coopResult(d: CoopDraft): CoopResult {
  const target = targetScore(d.cards)
  const blocks = blockScore(d.zones, d.difficulty)
  const roads = roadTax(d.roads, d.difficulty, d.expansions)
  const cards = d.cardPoints.reduce((a, b) => a + b, 0)
  const expansions = expansionScores(d.expansions, d.zones)
  const expansionsTotal = Object.values(expansions).reduce((a, b) => a + b, 0)
  const total = blocks + roads + cards + expansionsTotal + d.modifier
  return { target, blocks, roads, cards, expansions, expansionsTotal, total, won: total >= target }
}
