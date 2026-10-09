import { describe, expect, it } from 'vitest'
import type { CoopDraft, CoopGame, Game, Side, VsGame } from '../types'
import { suggestAchievements, achievementCounts } from './achievements'
import { competitiveResult, competitiveScores } from './competitive'
import { blockScore, businessPenalty, coopResult, expansionScores, hardZone, roadTax, targetScore } from './scoring'
import { coopStats, vsStats } from './stats'
import { newCampaign } from './campaign'
import { emptyDraft, emptySide, emptyZones, exportData, mergeCampaigns, mergeGames, parseImport } from './storage'

const zones = { residential: 3, commercial: 2, industrial: 4, park: 2 }
const draft = (over: Partial<CoopDraft> = {}): CoopDraft => ({ ...emptyDraft().coop, ...over })

describe('base scoring', () => {
  it('sums the three card numbers into the target (rulebook example)', () => {
    expect(targetScore([2, 7, 14])).toBe(23)
    expect(targetScore([2, null, null])).toBe(2)
  })

  it('matches the rulebook example: 11 block points, 7 roads, base 4', () => {
    const r = coopResult(draft({ zones, roads: 7 }))
    expect(r.blocks).toBe(11)
    expect(r.roads).toBe(-7)
    expect(r.total).toBe(4)
  })

  it('easy does not tax roads', () => {
    expect(coopResult(draft({ zones, roads: 7, difficulty: 'easy' })).total).toBe(11)
  })

  it('hard scores only the largest group', () => {
    expect(hardZone(zones)).toBe('industrial')
    expect(blockScore(zones, 'hard')).toBe(4)
    expect(coopResult(draft({ zones, roads: 7, difficulty: 'hard' })).total).toBe(-3)
  })

  it('adds card points and modifier, and wins on a tie with the target', () => {
    const r = coopResult(draft({ zones, roads: 7, cards: [3, 5, 1], cardPoints: [6, -2, 0], modifier: 1 }))
    expect(r.target).toBe(9)
    expect(r.total).toBe(9)
    expect(r.won).toBe(true)
    expect(coopResult(draft({ cards: [3, 5, 1] })).won).toBe(false)
  })

  it('zero roads is zero tax', () => {
    expect(roadTax(0, 'normal', {})).toBe(0)
  })
})

describe('expansions', () => {
  it('Wrecktar: +3 with no commercial blocks, otherwise -2 each', () => {
    expect(expansionScores({ wrecktar: { commercial: 0 } }, zones).wrecktar).toBe(3)
    expect(expansionScores({ wrecktar: { commercial: 2 } }, zones).wrecktar).toBe(-4)
  })

  it('Points of Interest: +1 per matching block', () => {
    expect(expansionScores({ poi: { matches: 4 } }, zones).poi).toBe(4)
  })

  it('Beaches cards', () => {
    const b = (card: 'lookout' | 'waterfront' | 'peninsula' | 'scenic', count = 0, yes = false) =>
      expansionScores({ beaches: { card, count, yes } }, zones).beaches
    expect(b('lookout', 0, true)).toBe(5)
    expect(b('lookout')).toBe(0)
    expect(b('waterfront', 3)).toBe(3)
    expect(b('peninsula', 3)).toBe(7) // example printed on the card
    expect(b('scenic', 0, true)).toBe(0)
  })

  it('Scenic Route removes the road tax', () => {
    const r = coopResult(draft({ zones, roads: 7, expansions: { beaches: { card: 'scenic', count: 0, yes: true } } }))
    expect(r.roads).toBe(0)
    expect(r.total).toBe(11)
  })

  it('Construction Zones cards', () => {
    const c = (card: 'business' | 'noisy' | 'bulldozed' | 'sudden', count = 0, yes = false, z = zones) =>
      expansionScores({ construction: { card, count, yes } }, z).construction
    expect(businessPenalty(0)).toBe(0)
    expect(c('business', 0, true)).toBe(-3) // largest commercial group is 2
    expect(c('business', 0, true, { ...zones, commercial: 5 })).toBe(-4)
    expect(c('business', 0, false)).toBe(0)
    expect(c('noisy', 4)).toBe(-8)
    expect(c('bulldozed', 3)).toBe(-3)
    expect(c('sudden', 2)).toBe(-4)
    expect(c('sudden', 0)).toBe(0)
  })

  it('Roadwork: sum of the unplaced cards', () => {
    expect(expansionScores({ roadwork: { unplaced: [1, 3] } }, zones).roadwork).toBe(-5)
    expect(expansionScores({ roadwork: { unplaced: [] } }, zones).roadwork).toBe(0)
  })

  it('expansions are added to the total and never to the target', () => {
    const r = coopResult(
      draft({ zones, roads: 7, cards: [1, 2, 3], expansions: { wrecktar: { commercial: 0 }, poi: { matches: 2 }, interstate: true } }),
    )
    expect(r.expansionsTotal).toBe(5)
    expect(r.total).toBe(9)
    expect(r.target).toBe(6)
  })
})

describe('competitive (Interstate)', () => {
  const side = (over: Partial<Side> = {}): Side => ({ ...emptySide(), ...over })
  const a = side({ zones: { residential: 5, commercial: 4, industrial: 3, park: 1 }, roads: 6, cardPoints: [4, 1] })
  const b = side({ zones: { residential: 2, commercial: 1, industrial: 2, park: 4 }, roads: 4, cardPoints: [2, 3] })

  it('standard: groups + both cards - roads', () => {
    expect(competitiveScores('standard', [a, b])).toEqual([12, 10])
    expect(competitiveResult('standard', [a, b]).winner).toBe(0)
  })

  it('choice: best two groups + best card - roads', () => {
    expect(competitiveScores('choice', [a, b])).toEqual([7, 5])
  })

  it('majority: 1 point per item won, most roads loses 2', () => {
    // A wins residential, commercial, industrial and card 1 (4); B wins park and card 2 (2); A has most roads (-2)
    expect(competitiveScores('majority', [a, b])).toEqual([2, 2])
  })

  it('ties are broken by the higher tiebreak value, else stay tied', () => {
    expect(competitiveResult('majority', [a, b])).toEqual({ scores: [2, 2], tied: true, winner: null })
    expect(competitiveResult('majority', [a, { ...b, tiebreak: 3 }]).winner).toBe(1)
  })

  it('applies the manual modifier in every scoring type', () => {
    expect(competitiveScores('standard', [{ ...a, modifier: -3 }, b])).toEqual([9, 10])
    expect(competitiveScores('majority', [a, { ...b, modifier: 1 }])).toEqual([2, 3])
  })
})

const coopGame = (over: Partial<CoopGame> = {}): CoopGame => ({
  id: 'c1', date: '2026-10-01', cityName: '', players: ['Ana'], notes: '', mode: 'coop', difficulty: 'normal',
  cards: [1, 2, 3], cardPoints: [0, 0, 0], zones: emptyZones(), roads: 0, expansions: {}, modifier: 0,
  total: 10, target: 6, won: true, achievements: [], ...over,
})
const vsGame = (over: Partial<VsGame> = {}): VsGame => ({
  id: 'v1', date: '2026-10-02', cityName: '', players: ['Ana', 'Bia'], notes: '', mode: 'competitive',
  interstateCard: 'valley', cards: [1, 2], sides: [emptySide(), emptySide()], scores: [5, 3], winner: 0, ...over,
})

describe('achievements', () => {
  it('suggests only on a win', () => {
    expect(suggestAchievements({ won: false, total: 0, target: 6, roads: 0, zones: emptyZones() })).toEqual([])
  })
  it('detects the numeric ones', () => {
    const z = { residential: 2, commercial: 2, industrial: 1, park: 2 }
    expect(suggestAchievements({ won: true, total: 12, target: 6, roads: 3, zones: z })).toEqual(['twice', 'patch', 'street'])
    expect(suggestAchievements({ won: true, total: 23, target: 23, roads: 20, zones })).toEqual(['nowhere', 'budget'])
  })
  it('counts unlocked achievements across games', () => {
    const games: Game[] = [coopGame({ achievements: ['budget'] }), coopGame({ id: 'c2', achievements: ['budget', 'street'] }), vsGame()]
    expect(achievementCounts(games)).toEqual({ budget: 2, street: 1 })
  })
})

describe('stats', () => {
  const games: Game[] = [
    coopGame(),
    coopGame({ id: 'c2', total: 20, target: 30, won: false }),
    vsGame(),
    vsGame({ id: 'v2', winner: 1 }),
    vsGame({ id: 'v3', winner: 0 }),
    vsGame({ id: 'v4', winner: null }),
  ]
  it('co-op stats ignore competitive games', () => {
    expect(coopStats(games)).toEqual({ played: 2, wins: 1, winRate: 50, best: 20, bestMargin: 4 })
    expect(coopStats([])).toEqual({ played: 0, wins: 0, winRate: 0, best: null, bestMargin: null })
  })
  it('competitive stats count wins per player', () => {
    expect(vsStats(games)).toEqual({ played: 4, ties: 1, wins: [{ name: 'Ana', wins: 2 }, { name: 'Bia', wins: 1 }] })
  })
})

describe('import / export', () => {
  it('round-trips and drops invalid entries', () => {
    const games: Game[] = [coopGame(), vsGame()]
    const campaigns = [newCampaign('Teste', ['Ana'])]
    expect(parseImport(exportData(games, campaigns))).toEqual({ games, campaigns })
    expect(parseImport(JSON.stringify([coopGame(), { id: 'x' }, 42])).games).toHaveLength(1)
    expect(parseImport(JSON.stringify({ games: [], campaigns: [{ id: 'x' }] })).campaigns).toEqual([])
    expect(mergeCampaigns(campaigns, [...campaigns, newCampaign('Outra', [])]).added).toBe(1)
    expect(() => parseImport('{"foo":1}')).toThrow()
    expect(() => parseImport('not json')).toThrow()
  })
  it('merges by id without duplicating', () => {
    const { games, added } = mergeGames([coopGame()], [coopGame(), vsGame()])
    expect(added).toBe(1)
    expect(games.map((g) => g.id)).toEqual(['v1', 'c1'])
  })
})
