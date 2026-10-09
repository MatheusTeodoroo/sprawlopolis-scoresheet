import type { BeachCard, ConstructionCard, ExpansionId, L } from '../types'

export type InputKind = 'count' | 'boolean' | 'none'
export type Variant<C extends string> = {
  id: C
  name: string
  rule: L
  /** Construction Zones: how the card must be placed */
  job?: L
  input: InputKind
  prompt?: L
}

export type ExpansionDef = {
  id: ExpansionId
  name: string
  summary: L
  input?: InputKind | 'checklist'
  prompt?: L
}

export const EXPANSIONS: ExpansionDef[] = [
  {
    id: 'wrecktar',
    name: 'Wrecktar',
    summary: {
      en: '−2 pts / Commercial block in Wrecktar’s row and column (not counting Wrecktar’s space). If there are none, gain 3 pts.',
      pt: '−2 pts / bloco Comercial na linha e na coluna do Wrecktar (sem contar o espaço dele). Se não houver nenhum, ganhe 3 pts.',
    },
    input: 'count',
    prompt: {
      en: 'Commercial blocks in Wrecktar’s row and column',
      pt: 'Blocos Comerciais na linha e coluna do Wrecktar',
    },
  },
  {
    id: 'poi',
    name: 'Points of Interest',
    summary: {
      en: '1 pt / matching block orthogonally adjacent to the Point of Interest (diagonals do not count).',
      pt: '1 pt / bloco do mesmo tipo ortogonalmente adjacente ao Ponto de Interesse (diagonais não contam).',
    },
    input: 'count',
    prompt: { en: 'Matching adjacent blocks', pt: 'Blocos iguais adjacentes' },
  },
  {
    id: 'beaches',
    name: 'Beaches',
    summary: {
      en: 'One Beach card joins your scoring conditions. Pick the one in play.',
      pt: 'Uma carta de Praia se junta aos objetivos. Escolha a que está em jogo.',
    },
  },
  {
    id: 'construction',
    name: 'Construction Zones',
    summary: {
      en: 'One Construction Zone card sets the job details and the penalty for zones not completed. Pick the one in play.',
      pt: 'Uma carta de Obra define como colocar as obras e a penalidade pelas não concluídas. Escolha a que está em jogo.',
    },
  },
  {
    id: 'roadwork',
    name: 'Roadwork',
    summary: {
      en: 'Each Roadwork card not placed on the map by the end of the game costs its printed penalty.',
      pt: 'Cada carta de Obras Rodoviárias não colocada no mapa até o fim do jogo custa a penalidade impressa.',
    },
    input: 'checklist',
    prompt: { en: 'Cards NOT placed', pt: 'Cartas NÃO colocadas' },
  },
  {
    id: 'interstate',
    name: 'Interstate',
    summary: {
      en: 'Co-op/solo: normal scoring. Each player’s part of the Interstate counts as one road. The Interstate is not an edge of the city, and blocks on opposite sides are not adjacent.',
      pt: 'Cooperativo/solo: pontuação normal. A parte da rodovia de cada lado conta como uma rua. A rodovia não é borda da cidade, e blocos de lados opostos não são adjacentes.',
    },
    input: 'none',
  },
]

export const BEACH_CARDS: Variant<BeachCard>[] = [
  {
    id: 'lookout',
    name: 'Lookout Point',
    rule: {
      en: '+5 pts if your largest Park is adjacent to the Beach.',
      pt: '+5 pts se o seu maior Parque for adjacente à Praia.',
    },
    input: 'boolean',
    prompt: { en: 'Largest Park touches the Beach', pt: 'Maior Parque encosta na Praia' },
  },
  {
    id: 'waterfront',
    name: 'Waterfront',
    rule: {
      en: '+1 pt / Residential block adjacent to the Beach.',
      pt: '+1 pt / bloco Residencial adjacente à Praia.',
    },
    input: 'count',
    prompt: { en: 'Residential blocks next to the Beach', pt: 'Blocos Residenciais junto à Praia' },
  },
  {
    id: 'peninsula',
    name: 'Peninsula',
    rule: {
      en: '+10 pts, −1 pt / row between the North and South Beaches.',
      pt: '+10 pts, −1 pt / linha entre as Praias Norte e Sul.',
    },
    input: 'count',
    prompt: { en: 'Rows between North and South Beaches', pt: 'Linhas entre as Praias Norte e Sul' },
  },
  {
    id: 'scenic',
    name: 'Scenic Route',
    rule: {
      en: 'If all blocks adjacent to the Beach are connected by a single Road, you will not receive a Road Tax.',
      pt: 'Se todos os blocos adjacentes à Praia estiverem ligados por uma única Rua, você não paga o Imposto de Ruas.',
    },
    input: 'boolean',
    prompt: { en: 'A single Road connects all Beach blocks', pt: 'Uma única Rua liga todos os blocos da Praia' },
  },
]

export const CONSTRUCTION_CARDS: Variant<ConstructionCard>[] = [
  {
    id: 'business',
    name: 'Business is Closed',
    job: {
      en: 'Must place Construction block so that no roads on it connect with existing roads.',
      pt: 'Coloque o bloco de Obra de modo que nenhuma rua dele se conecte a ruas existentes.',
    },
    rule: {
      en: 'If not completed: lose points based on your largest Commercial group (1 → −2, 2 → −3, 3+ → −4).',
      pt: 'Se não concluída: perca pontos conforme o seu maior grupo Comercial (1 → −2, 2 → −3, 3+ → −4).',
    },
    input: 'boolean',
    prompt: { en: 'A Construction Zone was left uncompleted', pt: 'Sobrou Obra não concluída' },
  },
  {
    id: 'noisy',
    name: 'Noisy Neighbors',
    job: {
      en: 'Must place Construction block on an outer edge of the city.',
      pt: 'Coloque o bloco de Obra em uma borda externa da cidade.',
    },
    rule: {
      en: 'If not completed: −2 pts / Residential block adjacent and/or diagonally adjacent to a Construction block.',
      pt: 'Se não concluída: −2 pts / bloco Residencial adjacente e/ou diagonal a um bloco de Obra.',
    },
    input: 'count',
    prompt: { en: 'Residential blocks around Construction', pt: 'Blocos Residenciais em volta de Obra' },
  },
  {
    id: 'bulldozed',
    name: 'Bulldozed',
    job: {
      en: 'Must place Construction card on top of 4 existing blocks.',
      pt: 'Coloque a carta de Obra em cima de 4 blocos existentes.',
    },
    rule: {
      en: 'If not completed: −1 pt / each row and column with a Construction block.',
      pt: 'Se não concluída: −1 pt / cada linha e coluna com um bloco de Obra.',
    },
    input: 'count',
    prompt: { en: 'Rows and columns with Construction', pt: 'Linhas e colunas com Obra' },
  },
  {
    id: 'sudden',
    name: 'Sudden Demolition',
    job: {
      en: 'Must place Construction block on your turn if it’s in your hand.',
      pt: 'Coloque o bloco de Obra no seu turno se ele estiver na sua mão.',
    },
    rule: {
      en: 'If not completed: −2 pts / Construction block.',
      pt: 'Se não concluída: −2 pts / bloco de Obra.',
    },
    input: 'count',
    prompt: { en: 'Construction blocks left', pt: 'Blocos de Obra restantes' },
  },
]
