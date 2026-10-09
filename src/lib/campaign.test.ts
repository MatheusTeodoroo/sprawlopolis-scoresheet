import { describe, expect, it } from 'vitest'
import { SCENARIOS, scenarioById } from '../data/campaign'
import type { BeachCard, CampaignGame, Zones } from '../types'
import {
  abilitiesFor, alignExpansions, campaignResult, campaignRoadTax, campaignState, newCampaign, nextOptions,
  scenarioExpansions, undoLastGame,
} from './campaign'
import { emptyZones } from './storage'

const none = abilitiesFor(emptyZones())
const z = (residential = 0, commercial = 0, industrial = 0, park = 0): Zones => ({ residential, commercial, industrial, park })

const game = (over: Partial<CampaignGame> = {}): CampaignGame => ({
  date: '2026-10-09', node: 4, stars: 1, drawn: [1, 3], cardPoints: [0, 0, 0], zones: z(5, 2, 2, 3), roads: 6,
  expansions: {}, parkSets: 0, industrialRoads: 0, notes: '', total: 12, target: 8, won: true, ...over,
})
const loss = (node: number, beach?: BeachCard): CampaignGame =>
  game({ node, won: false, expansions: beach ? { beaches: { card: beach, count: 0, yes: false } } : {} })

describe('campaign board', () => {
  it('has 18 scenarios in 7 stages, each forbidding exactly its neighbours', () => {
    expect(SCENARIOS).toHaveLength(18)
    expect(new Set(SCENARIOS.map((s) => s.stage)).size).toBe(7)
    for (const s of SCENARIOS) {
      if (s.id === 18) continue
      const neighbours = [...s.next, ...SCENARIOS.filter((o) => o.next.includes(s.id)).map((o) => o.id)]
      expect([...s.forbidden].sort()).toEqual(neighbours.sort())
    }
  })

  it('every path from 4 reaches 18 in 7 scenarios', () => {
    const walk = (id: number): number[] => (id === 18 ? [1] : scenarioById(id).next.flatMap((n) => walk(n).map((d) => d + 1)))
    expect(new Set(walk(4))).toEqual(new Set([7]))
  })

  it('the first scenario forks by largest group; ties let the players choose', () => {
    expect(nextOptions(4, z(5, 2, 2, 3))).toEqual([2])
    expect(nextOptions(4, z(1, 2, 2, 6))).toEqual([2])
    expect(nextOptions(4, z(1, 6, 2, 3))).toEqual([5])
    expect(nextOptions(4, z(4, 4, 1, 1))).toEqual([2, 5])
    expect(nextOptions(3, z(9, 0, 0, 0))).toEqual([6, 7])
  })
})

describe('campaign scoring', () => {
  it('taxes roads by difficulty (PDF example: 11 roads)', () => {
    expect(campaignRoadTax(11, 1, none, 0, false)).toBe(0)
    expect(campaignRoadTax(11, 2, none, 0, false)).toBe(-6)
    expect(campaignRoadTax(11, 3, none, 0, false)).toBe(-11)
    expect(campaignRoadTax(0, 3, none, 0, false)).toBe(0)
    expect(campaignRoadTax(11, 3, none, 0, true)).toBe(0)
  })

  it('I1 ignores up to 3 roads before the tax; I2 scores them instead', () => {
    const i1 = abilitiesFor(z(0, 0, 15, 0))
    const i2 = abilitiesFor(z(0, 0, 25, 0))
    expect(campaignRoadTax(11, 2, i1, 3, false)).toBe(-4)
    expect(campaignRoadTax(11, 3, i1, 5, false)).toBe(-8)
    expect(campaignRoadTax(11, 3, i2, 3, false)).toBe(-11)
    const g = game({ node: 3, stars: 3, zones: z(3, 2, 4, 2), roads: 11, industrialRoads: 2 })
    expect(campaignResult(g, i1).roads).toBe(-9)
    expect(campaignResult(g, i1).industrialBonus).toBe(0)
    expect(campaignResult(g, i2).industrialBonus).toBe(2)
  })

  it('P1/P2 add the park sets only once unlocked', () => {
    const g = game({ parkSets: 3 })
    expect(campaignResult(g, none).parkBonus).toBe(0)
    expect(campaignResult(g, abilitiesFor(z(0, 0, 0, 10))).parkBonus).toBe(3)
  })

  it('target is the mandatory card plus the two drawn; ties win', () => {
    const g = game({ node: 9, stars: 2, drawn: [4, 11], zones: z(3, 2, 4, 2), roads: 7, cardPoints: [10, 5, 2] })
    const r = campaignResult(g, none)
    expect(r.target).toBe(24)
    expect(r.total).toBe(11 - 4 + 17)
    expect(r.won).toBe(true)
  })

  it('adds the scenario expansions and the Beach', () => {
    const g = game({
      node: 18, stars: 3, zones: z(3, 2, 4, 2), roads: 7,
      expansions: {
        wrecktar: { commercial: 0 },
        construction: { card: 'sudden', count: 2, yes: false },
        beaches: { card: 'peninsula', count: 3, yes: false },
      },
    })
    expect(campaignResult(g, none).expansionsTotal).toBe(3 - 4 + 7)
  })
})

describe('campaign progression', () => {
  it('starts at 4 and follows wins', () => {
    expect(campaignState([]).node).toBe(4)
    const s = campaignState([game(), game({ node: 2 }), game({ node: 3, next: 7 })])
    expect(s.path).toEqual([4, 2, 3])
    expect(s.node).toBe(7)
    expect(s.awaitingNext).toBeNull()
  })

  it('waits for a choice at a fork', () => {
    const s = campaignState([game(), game({ node: 2 }), game({ node: 3 })])
    expect(s.awaitingNext).toEqual([6, 7])
    expect(s.node).toBe(3)
  })

  it('advances the tracks only on wins, capped at 25, and unlocks abilities', () => {
    const s = campaignState([game({ zones: z(9, 2, 2, 3) }), loss(2), game({ node: 2, zones: z(20, 0, 15, 7) })])
    expect(s.tracks).toEqual(z(25, 2, 17, 10))
    expect(s.abilities).toMatchObject({ R1: true, R2: true, P1: true, P2: false, I1: true, I2: false, C1: false, PT: false })
    expect(abilitiesFor(z(25, 25, 25, 25)).PT).toBe(true)
  })

  it('a defeat keeps the scenario and requires a Beach', () => {
    const s = campaignState([game(), loss(2)])
    expect(s).toMatchObject({ node: 2, defeats: 1, needsBeach: true, status: 'playing' })
    expect(scenarioExpansions(s).forced).toEqual(['construction', 'beaches'])
    const after = campaignState([game(), loss(2), game({ node: 2, expansions: { beaches: { card: 'scenic', count: 0, yes: true } } })])
    expect(after).toMatchObject({ node: 3, needsBeach: false, beachesUsed: ['scenic'] })
  })

  it('the fifth defeat ends the campaign', () => {
    const games = [loss(4), loss(4, 'scenic'), loss(4, 'lookout'), loss(4, 'waterfront')]
    expect(campaignState(games).status).toBe('playing')
    expect(campaignState([...games, loss(4, 'peninsula')])).toMatchObject({ status: 'lost', defeats: 5, rank: null })
  })

  it('winning scenario 18 ranks by defeats', () => {
    const run = [game(), game({ node: 5, next: 9 }), game({ node: 9 }), game({ node: 11 }), game({ node: 16, next: 1 }), game({ node: 1 })]
    expect(campaignState([...run, game({ node: 18 })])).toMatchObject({ status: 'won', rank: 'A' })
    expect(campaignState([...run, loss(18), loss(18, 'scenic'), game({ node: 18 })])).toMatchObject({ status: 'won', rank: 'C' })
  })

  it('Points of Interest becomes optional once PT is unlocked', () => {
    const s = campaignState([game({ zones: z(25, 25, 25, 25) })])
    expect(scenarioExpansions(s).optional).toEqual(['poi'])
    expect(alignExpansions({ poi: { matches: 2 }, roadwork: { unplaced: [] } }, ['construction'], ['poi'])).toEqual({
      construction: { card: null, count: 0, yes: false },
      poi: { matches: 2 },
    })
  })

  it('undo drops the last game and returns its numbers to the draft', () => {
    const c = { ...newCampaign('Teste', ['Ana']), games: [game(), game({ node: 2, roads: 9, drawn: [7, 8] })] }
    const undone = undoLastGame(c)
    expect(undone.games).toHaveLength(1)
    expect(undone.draft).toMatchObject({ roads: 9, drawn: [7, 8], stars: 1 })
    expect(campaignState(undone.games).node).toBe(2)
  })
})
