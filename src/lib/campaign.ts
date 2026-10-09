import { FINAL_SCENARIO, MAX_DEFEATS, RANKS, START_SCENARIO, TRACK_MAX, scenarioById, type AbilityId } from '../data/campaign'
import type { BeachCard, Campaign, CampaignDraft, CampaignGame, ExpansionId, Expansions, Stars, Zones } from '../types'
import { ZONE_IDS, expansionScores, scenicRoute } from './scoring'
import { emptyZones, today } from './storage'

export type Abilities = Record<AbilityId, boolean>

export function abilitiesFor(tracks: Zones): Abilities {
  return {
    R1: tracks.residential >= 10,
    R2: tracks.residential >= TRACK_MAX,
    P1: tracks.park >= 10,
    P2: tracks.park >= TRACK_MAX,
    I1: tracks.industrial >= 15,
    I2: tracks.industrial >= TRACK_MAX,
    C1: tracks.commercial >= 15,
    C2: tracks.commercial >= TRACK_MAX,
    PT: ZONE_IDS.every((z) => tracks[z] >= TRACK_MAX),
  }
}

/** After the first scenario the largest group picks the side; later forks are the players' choice. */
export function nextOptions(node: number, zones: Zones): number[] {
  const { next } = scenarioById(node)
  if (node !== START_SCENARIO) return next
  const left = Math.max(zones.residential, zones.park)
  const right = Math.max(zones.industrial, zones.commercial)
  return left > right ? [2] : right > left ? [5] : next
}

const industrialRoads = (n: number, roads: number) => Math.max(0, Math.min(3, n, roads))

export function campaignRoadTax(roads: number, stars: Stars, abilities: Abilities, throughIndustrial: number, scenic: boolean): number {
  if (stars === 1 || scenic) return 0
  // I2 replaces I1: the roads are no longer ignored, they score points instead
  const ignored = abilities.I1 && !abilities.I2 ? industrialRoads(throughIndustrial, roads) : 0
  const taxed = roads - ignored
  const tax = stars === 2 ? Math.ceil(taxed / 2) : taxed
  return tax === 0 ? 0 : -tax
}

export type CampaignResult = {
  target: number
  blocks: number
  roads: number
  cards: number
  expansions: Partial<Record<ExpansionId, number>>
  expansionsTotal: number
  parkBonus: number
  industrialBonus: number
  total: number
  won: boolean
}

type Scored = Pick<CampaignGame, 'node' | 'stars' | 'cardPoints' | 'zones' | 'roads' | 'expansions' | 'parkSets' | 'industrialRoads'> & {
  drawn: (number | null)[]
}

export function campaignResult(g: Scored, abilities: Abilities): CampaignResult {
  const target = g.node + g.drawn.reduce<number>((sum, c) => sum + (c ?? 0), 0)
  const blocks = ZONE_IDS.reduce((sum, z) => sum + g.zones[z], 0)
  const roads = campaignRoadTax(g.roads, g.stars, abilities, g.industrialRoads, scenicRoute(g.expansions))
  const cards = g.cardPoints.reduce((a, b) => a + b, 0)
  const expansions = expansionScores(g.expansions, g.zones)
  const expansionsTotal = Object.values(expansions).reduce((a, b) => a + b, 0)
  const parkBonus = abilities.P1 ? Math.max(0, g.parkSets) : 0
  const industrialBonus = abilities.I2 ? industrialRoads(g.industrialRoads, g.roads) : 0
  const total = blocks + roads + cards + expansionsTotal + parkBonus + industrialBonus
  return { target, blocks, roads, cards, expansions, expansionsTotal, parkBonus, industrialBonus, total, won: total >= target }
}

export type CampaignState = {
  status: 'playing' | 'won' | 'lost'
  /** scenario to play now (or the last one played, once the campaign is over) */
  node: number
  /** scenarios already beaten, in order */
  path: number[]
  defeats: number
  beachesUsed: BeachCard[]
  /** the last game was lost, so the next attempt must add a Beach */
  needsBeach: boolean
  /** a fork was reached and the players still have to pick where to go */
  awaitingNext: number[] | null
  tracks: Zones
  abilities: Abilities
  rank: (typeof RANKS)[number] | null
}

/** Replays the game log. Nothing else about a campaign is stored, so undoing is just dropping the last game. */
export function campaignState(games: CampaignGame[]): CampaignState {
  const tracks = emptyZones()
  const path: number[] = []
  const beachesUsed: BeachCard[] = []
  let node = START_SCENARIO
  let defeats = 0
  let status: CampaignState['status'] = 'playing'
  let awaitingNext: number[] | null = null

  for (const g of games) {
    if (g.expansions.beaches?.card) beachesUsed.push(g.expansions.beaches.card)
    if (!g.won) {
      defeats++
      if (defeats >= MAX_DEFEATS) status = 'lost'
      continue
    }
    for (const z of ZONE_IDS) tracks[z] = Math.min(TRACK_MAX, tracks[z] + g.zones[z])
    path.push(g.node)
    awaitingNext = null
    if (g.node === FINAL_SCENARIO) {
      status = 'won'
      continue
    }
    const options = nextOptions(g.node, g.zones)
    const next = g.next ?? (options.length === 1 ? options[0] : undefined)
    if (next === undefined) awaitingNext = options
    else node = next
  }

  const last = games.at(-1)
  return {
    status,
    node,
    path,
    defeats,
    beachesUsed,
    needsBeach: status === 'playing' && last !== undefined && !last.won,
    awaitingNext: status === 'playing' ? awaitingNext : null,
    tracks,
    abilities: abilitiesFor(tracks),
    rank: status === 'won' ? RANKS[defeats] : null,
  }
}

/** Expansions the current scenario forces on, and the ones the players may add. */
export function scenarioExpansions(state: CampaignState): { forced: ExpansionId[]; optional: ExpansionId[] } {
  const forced: ExpansionId[] = [...scenarioById(state.node).expansions]
  if (state.needsBeach) forced.push('beaches')
  return { forced, optional: state.abilities.PT ? ['poi'] : [] }
}

const EXPANSION_DEFAULTS: { [K in ExpansionId]-?: () => NonNullable<Expansions[K]> } = {
  wrecktar: () => ({ commercial: 0 }),
  poi: () => ({ matches: 0 }),
  beaches: () => ({ card: null, count: 0, yes: false }),
  construction: () => ({ card: null, count: 0, yes: false }),
  roadwork: () => ({ unplaced: [] }),
  interstate: () => true,
}
export const defaultExpansion = <K extends ExpansionId>(id: K) => EXPANSION_DEFAULTS[id]()

/** Keeps a draft's expansions in line with what the scenario allows. */
export function alignExpansions(expansions: Expansions, forced: ExpansionId[], optional: ExpansionId[]): Expansions {
  const out: Expansions = {}
  for (const id of forced) Object.assign(out, { [id]: expansions[id] ?? defaultExpansion(id) })
  for (const id of optional) if (expansions[id] !== undefined) Object.assign(out, { [id]: expansions[id] })
  return out
}

export const emptyCampaignDraft = (): CampaignDraft => ({
  stars: null,
  drawn: [null, null],
  cardPoints: [0, 0, 0],
  zones: emptyZones(),
  roads: 0,
  expansions: {},
  parkSets: 0,
  industrialRoads: 0,
  notes: '',
})

export function newCampaign(cityName: string, players: string[]): Campaign {
  return { id: crypto.randomUUID(), cityName, players, createdAt: today(), games: [], draft: emptyCampaignDraft() }
}

/** Removes the last game and puts its numbers back on the sheet so they can be fixed. */
export function undoLastGame(c: Campaign): Campaign {
  const last = c.games.at(-1)
  if (!last) return c
  const { date: _date, node: _node, total: _total, target: _target, won: _won, next: _next, ...typed } = last
  return { ...c, games: c.games.slice(0, -1), draft: typed }
}
