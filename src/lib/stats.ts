import type { Game } from '../types'

export type CoopStats = { played: number; wins: number; winRate: number; best: number | null; bestMargin: number | null }
export type VsStats = { played: number; ties: number; wins: { name: string; wins: number }[] }

export function coopStats(games: Game[]): CoopStats {
  const coop = games.filter((g) => g.mode === 'coop')
  const wins = coop.filter((g) => g.won).length
  return {
    played: coop.length,
    wins,
    winRate: coop.length ? Math.round((wins / coop.length) * 100) : 0,
    best: coop.length ? Math.max(...coop.map((g) => g.total)) : null,
    bestMargin: coop.length ? Math.max(...coop.map((g) => g.total - g.target)) : null,
  }
}

export function vsStats(games: Game[]): VsStats {
  const vs = games.filter((g) => g.mode === 'competitive')
  const wins = new Map<string, number>()
  for (const g of vs) {
    for (const p of g.players) if (!wins.has(p)) wins.set(p, 0)
    if (g.winner !== null) wins.set(g.players[g.winner], (wins.get(g.players[g.winner]) ?? 0) + 1)
  }
  return {
    played: vs.length,
    ties: vs.filter((g) => g.winner === null).length,
    wins: [...wins].map(([name, w]) => ({ name, wins: w })).sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name)),
  }
}
