import type { L } from '../types'

export type ScoringCard = { id: number; name: string; rule: L }

// Names stay in English so they match the physical cards on the table.
export const CARDS: ScoringCard[] = [
  {
    id: 1,
    name: 'The Outskirts',
    rule: {
      en: '1 pt / Road that does not end at the edge of the city. −1 pt / Road that ends at the edge of the city.',
      pt: '1 pt / rua que não termina na borda da cidade. −1 pt / rua que termina na borda da cidade.',
    },
  },
  {
    id: 2,
    name: 'Bloom Boom',
    rule: {
      en: '1 pt / Each row & column with exactly 3 Park blocks in it. −1 pt / Each row & column with exactly 0 Park blocks in it.',
      pt: '1 pt / cada linha e coluna com exatamente 3 blocos de Parque. −1 pt / cada linha e coluna com exatamente 0 blocos de Parque.',
    },
  },
  {
    id: 3,
    name: 'Go Green',
    rule: {
      en: '1 pt / Park block in your city. −3 pts / Industrial block in your city.',
      pt: '1 pt / bloco de Parque na cidade. −3 pts / bloco Industrial na cidade.',
    },
  },
  {
    id: 4,
    name: 'Block Party',
    rule: {
      en: 'Score points per group of 4 “corner to corner” blocks of the same type. You may score multiple groups of the same type and a block may apply to more than one group. Groups → points: 0 → −8, 1 → −5, 2 → −2, 3 → −1, 4 → 4, 5+ → 7.',
      pt: 'Pontue por grupo de 4 blocos “canto a canto” (2×2) do mesmo tipo. Vários grupos do mesmo tipo contam, e um bloco pode fazer parte de mais de um grupo. Grupos → pontos: 0 → −8, 1 → −5, 2 → −2, 3 → −1, 4 → 4, 5+ → 7.',
    },
  },
  {
    id: 5,
    name: 'Stacks and Scrapers',
    rule: {
      en: '2 pts / Industrial block adjacent to only Commercial or Industrial blocks.',
      pt: '2 pts / bloco Industrial adjacente somente a blocos Comerciais ou Industriais.',
    },
  },
  {
    id: 6,
    name: 'Master Planned',
    rule: {
      en: 'Subtract the number of blocks in your largest Industrial group from the number of blocks in your largest Residential group. Score that many points.',
      pt: 'Subtraia o número de blocos do seu maior grupo Industrial do número de blocos do seu maior grupo Residencial. Marque essa quantidade de pontos.',
    },
  },
  {
    id: 7,
    name: 'Central Perks',
    rule: {
      en: '1 pt / Park block located on the interior of the city. −2 pts / Park block on the edge of the city.',
      pt: '1 pt / bloco de Parque no interior da cidade. −2 pts / bloco de Parque na borda da cidade.',
    },
  },
  {
    id: 8,
    name: 'The ‘Burbs',
    rule: {
      en: '1 pt / Park block adjacent to your largest group of Residential blocks. −2 pts / Industrial block adjacent to your largest group of Residential blocks.',
      pt: '1 pt / bloco de Parque adjacente ao seu maior grupo de blocos Residenciais. −2 pts / bloco Industrial adjacente ao seu maior grupo de blocos Residenciais.',
    },
  },
  {
    id: 9,
    name: 'Concrete Jungle',
    rule: {
      en: '1 pt / Industrial block that shares a corner with at least 1 other Industrial block.',
      pt: '1 pt / bloco Industrial que compartilha um canto com pelo menos 1 outro bloco Industrial.',
    },
  },
  {
    id: 10,
    name: 'The Strip',
    rule: {
      en: '1 pt / Commercial block in any 1 Row or Column of your choice. You may only score for 1 Row or Column.',
      pt: '1 pt / bloco Comercial em 1 linha ou coluna à sua escolha. Só é possível pontuar 1 linha ou coluna.',
    },
  },
  {
    id: 11,
    name: 'Mini Marts',
    rule: {
      en: '2 pts / Commercial blocks directly between two Residential blocks with the same road connecting all three blocks. Blocks may be a straight line or in a “stepped” pattern.',
      pt: '2 pts / bloco Comercial diretamente entre dois blocos Residenciais, com a mesma rua ligando os três. Os blocos podem estar em linha reta ou em “degrau”.',
    },
  },
  {
    id: 12,
    name: 'Superhighway',
    rule: {
      en: '1 pt / every 2 Road sections (rounded down) that are part of your longest road.',
      pt: '1 pt / a cada 2 seções de rua (arredondado para baixo) da sua rua mais longa.',
    },
  },
  {
    id: 13,
    name: 'Park Hopping',
    rule: {
      en: '3 pts / Road that begins at one Park and ends at a different Park.',
      pt: '3 pts / rua que começa em um Parque e termina em outro Parque.',
    },
  },
  {
    id: 14,
    name: 'Looping Lanes',
    rule: {
      en: '1 pt / Road section in a completed loop. You may score multiple loops in your city.',
      pt: '1 pt / seção de rua em um circuito fechado. Vários circuitos na cidade contam.',
    },
  },
  {
    id: 15,
    name: 'Skid Row',
    rule: {
      en: '2 pts / Residential block adjacent to 2 or more Industrial blocks.',
      pt: '2 pts / bloco Residencial adjacente a 2 ou mais blocos Industriais.',
    },
  },
  {
    id: 16,
    name: 'Morning Commute',
    rule: {
      en: '2 pts / Road that passes through both a Residential block and a Commercial block.',
      pt: '2 pts / rua que passa por um bloco Residencial e por um bloco Comercial.',
    },
  },
  {
    id: 17,
    name: 'Tourist Traps',
    rule: {
      en: '1 pt / Commercial block on the edge of the city. Additional 1 pt / Commercial block on a corner edge.',
      pt: '1 pt / bloco Comercial na borda da cidade. 1 pt adicional / bloco Comercial em um canto da borda.',
    },
  },
  {
    id: 18,
    name: 'Sprawlopolis',
    rule: {
      en: 'Add the number of blocks in your longest Row to the number of blocks in your longest Column (skipping any gaps). Score that many points.',
      pt: 'Some o número de blocos da sua linha mais longa ao número de blocos da sua coluna mais longa (pulando os buracos). Marque essa quantidade de pontos.',
    },
  },
]

export const cardById = (id: number | null | undefined) => CARDS.find((c) => c.id === id)
