import type { BeachCard, ExpansionId, L, Stars, ZoneId } from '../types'

/**
 * Campaign Mode — fan variant by Oficina de Variantes (2024).
 * Each scenario is named after its mandatory scoring card.
 */
export type ScenarioDef = {
  /** scenario number = mandatory scoring card */
  id: number
  stage: number
  /** minimum difficulty; players may raise it, never lower it */
  stars: Stars
  /** cards that cannot be drawn as the two extra objectives */
  forbidden: number[]
  expansions: ExpansionId[]
  next: number[]
  /** centre of the node on the board (viewBox units) */
  x: number
  y: number
}

export const START_SCENARIO = 4
export const FINAL_SCENARIO = 18
export const BOARD = { width: 420, height: 700 }

export const SCENARIOS: ScenarioDef[] = [
  { id: 4, stage: 1, stars: 1, forbidden: [5, 2], expansions: [], next: [2, 5], x: 244, y: 650 },
  { id: 2, stage: 2, stars: 1, forbidden: [3, 4], expansions: ['construction'], next: [3], x: 140, y: 550 },
  { id: 5, stage: 2, stars: 1, forbidden: [4, 9, 10], expansions: ['construction'], next: [9, 10], x: 348, y: 550 },
  { id: 3, stage: 3, stars: 2, forbidden: [6, 2, 7], expansions: [], next: [6, 7], x: 140, y: 450 },
  { id: 9, stage: 3, stars: 2, forbidden: [5, 11], expansions: [], next: [11], x: 315, y: 450 },
  { id: 10, stage: 3, stars: 2, forbidden: [5, 11], expansions: [], next: [11], x: 381, y: 450 },
  { id: 6, stage: 4, stars: 2, forbidden: [3, 8], expansions: [], next: [8], x: 100, y: 350 },
  { id: 7, stage: 4, stars: 2, forbidden: [3, 16], expansions: [], next: [16], x: 180, y: 350 },
  { id: 11, stage: 4, stars: 2, forbidden: [9, 10, 16], expansions: [], next: [16], x: 348, y: 350 },
  { id: 8, stage: 5, stars: 2, forbidden: [6, 12, 13, 14, 15], expansions: ['construction'], next: [12, 13, 14, 15], x: 136, y: 250 },
  { id: 16, stage: 5, stars: 2, forbidden: [1, 7, 11, 17], expansions: ['construction'], next: [1, 17], x: 348, y: 250 },
  { id: 12, stage: 6, stars: 2, forbidden: [8, 18], expansions: ['wrecktar'], next: [18], x: 37, y: 150 },
  { id: 13, stage: 6, stars: 2, forbidden: [8, 18], expansions: ['wrecktar'], next: [18], x: 103, y: 150 },
  { id: 14, stage: 6, stars: 2, forbidden: [8, 18], expansions: ['wrecktar'], next: [18], x: 169, y: 150 },
  { id: 15, stage: 6, stars: 2, forbidden: [8, 18], expansions: ['wrecktar'], next: [18], x: 235, y: 150 },
  { id: 1, stage: 6, stars: 2, forbidden: [18, 16], expansions: ['wrecktar'], next: [18], x: 315, y: 150 },
  { id: 17, stage: 6, stars: 2, forbidden: [18, 16], expansions: ['wrecktar'], next: [18], x: 381, y: 150 },
  { id: 18, stage: 7, stars: 3, forbidden: [], expansions: ['construction', 'wrecktar'], next: [], x: 275, y: 50 },
]

export const scenarioById = (id: number) => SCENARIOS.find((s) => s.id === id)!

export const DIFFICULTIES: Record<Stars, { name: L; rule: L }> = {
  1: {
    name: { pt: 'Ajudante', en: 'Helper' },
    rule: { pt: 'Ruas não descontam pontos.', en: 'Roads do not cost points.' },
  },
  2: {
    name: { pt: 'Pedreiro', en: 'Builder' },
    rule: {
      pt: 'Ruas descontam metade do total, arredondado para cima (11 ruas = −6).',
      en: 'Roads cost half their count, rounded up (11 roads = −6).',
    },
  },
  3: {
    name: { pt: 'Mestre de Obras', en: 'Foreman' },
    rule: { pt: 'Cada rua desconta 1 ponto (11 ruas = −11).', en: 'Each road costs 1 point (11 roads = −11).' },
  },
}

export type AbilityId = 'R1' | 'R2' | 'P1' | 'P2' | 'I1' | 'I2' | 'C1' | 'C2' | 'PT'
export type AbilityDef = {
  id: AbilityId
  /** track that unlocks it; PT needs all four tracks full */
  zone: ZoneId | null
  space: number
  /** "table" abilities change how you play; "score" abilities change the final score */
  kind: 'table' | 'score'
  text: L
}

export const TRACK_MAX = 25

export const ABILITIES: AbilityDef[] = [
  {
    id: 'R1', zone: 'residential', space: 10, kind: 'table',
    text: { pt: 'O jogador inicial começa com 4 cartas na mão em vez de 3.', en: 'The start player begins with 4 cards in hand instead of 3.' },
  },
  {
    id: 'R2', zone: 'residential', space: 25, kind: 'table',
    text: {
      pt: 'Além da R1: ao final da partida, o grupo pode devolver à mão até 2 cartas que não tenham nenhuma carta por cima (ou tenham no máximo uma) e jogá-las de novo em seguida. Não vale para cartas de expansões.',
      en: 'On top of R1: at the end of the game, the team may take back up to 2 cards that have no card on top of them (or at most one) and play them again right away. Not valid for expansion cards.',
    },
  },
  {
    id: 'P1', zone: 'park', space: 10, kind: 'score',
    text: {
      pt: 'Ao final, ganhe 1 ponto para cada 3 parques juntos, estejam eles na sua maior área ou não.',
      en: 'At the end, gain 1 point for every 3 parks together, whether or not they are in your largest area.',
    },
  },
  {
    id: 'P2', zone: 'park', space: 25, kind: 'score',
    text: {
      pt: 'Em vez de 3, ganhe 1 ponto para cada 2 parques juntos, estejam eles na sua maior área ou não.',
      en: 'Instead of 3, gain 1 point for every 2 parks together, whether or not they are in your largest area.',
    },
  },
  {
    id: 'I1', zone: 'industrial', space: 15, kind: 'score',
    text: {
      pt: 'Ao final, você pode desconsiderar até 3 ruas que passem pela sua maior área industrial.',
      en: 'At the end, you may ignore up to 3 roads that pass through your largest industrial area.',
    },
  },
  {
    id: 'I2', zone: 'industrial', space: 25, kind: 'score',
    text: {
      pt: 'Em vez de desconsiderar, ganhe 1 ponto por rua (até 3) que passe pela sua maior área industrial.',
      en: 'Instead of ignoring them, gain 1 point per road (up to 3) that passes through your largest industrial area.',
    },
  },
  {
    id: 'C1', zone: 'commercial', space: 15, kind: 'table',
    text: {
      pt: 'Você pode jogar a carta do topo do baralho como se fosse uma carta da mão.',
      en: 'You may play the top card of the deck as if it were a card in your hand.',
    },
  },
  {
    id: 'C2', zone: 'commercial', space: 25, kind: 'table',
    text: {
      pt: 'Além da C1: uma vez por partida, cada jogador pode colocar quantas cartas quiser da mão no fundo do baralho e comprar a mesma quantidade do topo.',
      en: 'On top of C1: once per game, each player may put any number of cards from their hand on the bottom of the deck and draw the same number from the top.',
    },
  },
  {
    id: 'PT', zone: null, space: 26, kind: 'table',
    text: {
      pt: 'Liberada quando as quatro trilhas chegam ao 25º espaço: a partida pode começar com a expansão Pontos de Interesse.',
      en: 'Unlocked when all four tracks reach space 25: the game may start with the Points of Interest expansion.',
    },
  },
]

export const RANKS = ['A', 'B', 'C', 'D', 'E'] as const
export const MAX_DEFEATS = 5

/** Names used by the Brazilian edition, shown next to the original ones. */
export const BEACH_NAMES_PT: Record<BeachCard, string> = {
  scenic: 'Rota Cênica',
  waterfront: 'Beira Mar',
  lookout: 'Mirante',
  peninsula: 'Península',
}

export const EXPANSION_NAMES_PT: Partial<Record<ExpansionId, string>> = {
  construction: 'Quadras de Construção',
  wrecktar: 'O Destruidor',
  beaches: 'Praias',
  poi: 'Pontos de Interesse',
}
