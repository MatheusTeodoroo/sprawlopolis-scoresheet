export type Lang = 'pt' | 'en'
export type L = Record<Lang, string>

export type ZoneId = 'residential' | 'commercial' | 'industrial' | 'park'
export type Zones = Record<ZoneId, number>
export type Difficulty = 'normal' | 'easy' | 'hard'

export type BeachCard = 'lookout' | 'waterfront' | 'peninsula' | 'scenic'
export type ConstructionCard = 'business' | 'noisy' | 'bulldozed' | 'sudden'
export type VariantState<C extends string> = { card: C | null; count: number; yes: boolean }

export type Expansions = {
  wrecktar?: { commercial: number }
  poi?: { matches: number }
  beaches?: VariantState<BeachCard>
  construction?: VariantState<ConstructionCard>
  /** indexes into ROADWORK_PENALTIES of the cards that were NOT placed */
  roadwork?: { unplaced: number[] }
  interstate?: true
}
export type ExpansionId = keyof Expansions

export type InterstateCard = 'central' | 'main' | 'mountainside' | 'valley'
export type Side = {
  zones: Zones
  roads: number
  cardPoints: [number, number]
  modifier: number
  tiebreak: number
}

type GameBase = { id: string; date: string; cityName: string; players: string[]; notes: string }

export type CoopGame = GameBase & {
  mode: 'coop'
  difficulty: Difficulty
  cards: [number, number, number]
  cardPoints: [number, number, number]
  zones: Zones
  roads: number
  expansions: Expansions
  modifier: number
  total: number
  target: number
  won: boolean
  achievements: string[]
}

export type VsGame = GameBase & {
  mode: 'competitive'
  interstateCard: InterstateCard
  cards: [number, number]
  sides: [Side, Side]
  scores: [number, number]
  winner: 0 | 1 | null
}

export type Game = CoopGame | VsGame

export type CoopDraft = {
  difficulty: Difficulty
  cards: [number | null, number | null, number | null]
  cardPoints: [number, number, number]
  zones: Zones
  roads: number
  expansions: Expansions
  modifier: number
}

export type VsDraft = {
  interstateCard: InterstateCard | null
  cards: [number | null, number | null]
  sides: [Side, Side]
}

export type Draft = {
  mode: 'coop' | 'competitive'
  date: string
  cityName: string
  players: string[]
  notes: string
  coop: CoopDraft
  vs: VsDraft
}

export type Settings = { lang: Lang; theme: 'system' | 'light' | 'dark' }
