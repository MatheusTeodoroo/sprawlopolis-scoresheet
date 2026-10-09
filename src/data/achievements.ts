import type { L } from '../types'

export type Achievement = { id: string; name: string; goal: L }

// All of them also require winning the game.
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'supersprawl', name: 'Supersprawl', goal: { en: 'Did not overlap any cards', pt: 'Não sobrepôs nenhuma carta' } },
  {
    id: 'edge',
    name: 'Livin’ on the Edge',
    goal: {
      en: 'City went past the edge of the table (must start in center)',
      pt: 'A cidade passou da borda da mesa (começando no centro)',
    },
  },
  { id: 'barren', name: 'Barren Park', goal: { en: 'Fewer Parks than any other zone type', pt: 'Menos Parques do que qualquer outro tipo de zona' } },
  { id: 'twice', name: 'Twice the Town', goal: { en: 'Doubled my scoring goal', pt: 'Dobrou a meta de pontuação' } },
  { id: 'symm', name: 'Symm City', goal: { en: 'Made a symmetrical shaped city', pt: 'Fez uma cidade de formato simétrico' } },
  { id: 'baby', name: 'Baby Boom', goal: { en: 'City 34 total blocks or smaller', pt: 'Cidade com 34 blocos ou menos no total' } },
  { id: 'undeveloped', name: 'Undeveloped', goal: { en: 'Two separate gaps left in city', pt: 'Dois buracos separados deixados na cidade' } },
  { id: 'nowhere', name: 'Roads to Nowhere', goal: { en: '20 or more roads', pt: '20 ruas ou mais' } },
  { id: 'patch', name: 'Patchapalooza', goal: { en: 'No zone groups larger than 2 blocks', pt: 'Nenhum grupo de zona maior que 2 blocos' } },
  {
    id: 'metro',
    name: 'Metro Miracle',
    goal: {
      en: 'Did not reach any of the 3 scoring goals, but still won',
      pt: 'Não atingiu nenhum dos 3 objetivos, mas venceu mesmo assim',
    },
  },
  { id: 'smog', name: 'Smog and Mirrors', goal: { en: 'More Industrial than any other zone type', pt: 'Mais Industrial do que qualquer outro tipo de zona' } },
  { id: 'street', name: 'Street Smarts', goal: { en: '5 or fewer roads', pt: '5 ruas ou menos' } },
  { id: 'budget', name: 'Right on Budget', goal: { en: 'Hit the target score exactly', pt: 'Acertou a meta exatamente' } },
]
