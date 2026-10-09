import type { Game, Zones } from '../types'
import { ZONE_IDS } from './scoring'

/** Achievements that can be detected from the numbers alone; the rest are ticked by hand. */
export function suggestAchievements(g: { won: boolean; total: number; target: number; roads: number; zones: Zones }): string[] {
  if (!g.won) return []
  const out: string[] = []
  if (g.target > 0 && g.total >= 2 * g.target) out.push('twice')
  if (g.roads >= 20) out.push('nowhere')
  if (ZONE_IDS.every((z) => g.zones[z] <= 2)) out.push('patch')
  if (g.roads <= 5) out.push('street')
  if (g.total === g.target) out.push('budget')
  return out
}

/** How many saved games earned each achievement. */
export function achievementCounts(games: Game[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const g of games) {
    if (g.mode !== 'coop') continue
    for (const id of g.achievements) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}
