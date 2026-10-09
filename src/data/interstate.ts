import type { InterstateCard, L } from '../types'

export type InterstateScoring = 'standard' | 'choice' | 'majority'
export type InterstateDef = {
  id: InterstateCard
  name: string
  scoring: InterstateScoring
  placement: L
  rule: L
  tiebreak: L
}

const ownSide: L = { en: 'Play on your side only', pt: 'Jogue apenas no seu lado' }
const standardRule: L = {
  en: 'Standard — each player scores, then compare totals: largest group of each block type, both scoring cards, Road Tax.',
  pt: 'Padrão — cada jogador pontua e os totais são comparados: maior grupo de cada tipo de bloco, as duas cartas de objetivo, Imposto de Ruas.',
}

export const INTERSTATE_CARDS: InterstateDef[] = [
  {
    id: 'central',
    name: 'Central Highway',
    scoring: 'majority',
    placement: ownSide,
    rule: {
      en: 'Majority — compare each item; the higher player gains 1 pt for: largest group of each block type and each scoring card (scored individually). The player with the most roads loses 2 pts.',
      pt: 'Maioria — compare item a item; quem tiver mais ganha 1 pt em: maior grupo de cada tipo de bloco e cada carta de objetivo (pontuados individualmente). Quem tiver mais ruas perde 2 pts.',
    },
    tiebreak: { en: 'Longest road', pt: 'Rua mais longa' },
  },
  {
    id: 'main',
    name: 'Main Boulevard',
    scoring: 'choice',
    placement: ownSide,
    rule: {
      en: 'Choice — each player scores, then compare totals: largest group of 2 block types of their choice, one scoring card of their choice, Road Tax.',
      pt: 'Escolha — cada jogador pontua e os totais são comparados: maior grupo de 2 tipos de bloco à escolha, uma carta de objetivo à escolha, Imposto de Ruas.',
    },
    tiebreak: { en: 'Most total blocks', pt: 'Mais blocos no total' },
  },
  {
    id: 'mountainside',
    name: 'Mountainside Drive',
    scoring: 'standard',
    placement: ownSide,
    rule: standardRule,
    tiebreak: { en: 'Most Park and Industrial blocks', pt: 'Mais blocos de Parque e Industriais' },
  },
  {
    id: 'valley',
    name: 'Great Valley Road',
    scoring: 'standard',
    placement: { en: 'Play on either side', pt: 'Jogue em qualquer lado' },
    rule: standardRule,
    tiebreak: { en: 'Most roads', pt: 'Mais ruas' },
  },
]

export const interstateById = (id: InterstateCard | null) => INTERSTATE_CARDS.find((c) => c.id === id)
