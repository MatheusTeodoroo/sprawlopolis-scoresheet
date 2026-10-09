import type { InterstateScoring } from '../data/interstate'
import type { Side } from '../types'
import { ZONE_IDS } from './scoring'

export type CompetitiveResult = { scores: [number, number]; tied: boolean; winner: 0 | 1 | null }

const zoneValues = (s: Side) => ZONE_IDS.map((z) => s.zones[z])

function standard(s: Side): number {
  return zoneValues(s).reduce((a, b) => a + b, 0) + s.cardPoints[0] + s.cardPoints[1] - s.roads + s.modifier
}

function choice(s: Side): number {
  const [a, b] = zoneValues(s).sort((x, y) => y - x)
  return a + b + Math.max(...s.cardPoints) - s.roads + s.modifier
}

function majority(sides: [Side, Side]): [number, number] {
  const scores: [number, number] = [sides[0].modifier, sides[1].modifier]
  const award = (a: number, b: number, points: number) => {
    if (a > b) scores[0] += points
    else if (b > a) scores[1] += points
  }
  for (const z of ZONE_IDS) award(sides[0].zones[z], sides[1].zones[z], 1)
  for (const i of [0, 1] as const) award(sides[0].cardPoints[i], sides[1].cardPoints[i], 1)
  award(sides[0].roads, sides[1].roads, -2)
  return scores
}

export function competitiveScores(scoring: InterstateScoring, sides: [Side, Side]): [number, number] {
  if (scoring === 'majority') return majority(sides)
  const fn = scoring === 'choice' ? choice : standard
  return [fn(sides[0]), fn(sides[1])]
}

/** Every Interstate tiebreaker is "most of X", so the higher tiebreak value wins. */
export function competitiveResult(scoring: InterstateScoring, sides: [Side, Side]): CompetitiveResult {
  const scores = competitiveScores(scoring, sides)
  if (scores[0] !== scores[1]) return { scores, tied: false, winner: scores[0] > scores[1] ? 0 : 1 }
  const [a, b] = [sides[0].tiebreak, sides[1].tiebreak]
  return { scores, tied: true, winner: a === b ? null : a > b ? 0 : 1 }
}
