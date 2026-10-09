import type { L } from '../types'

/** Campaign Mode explained in our own words, so the original PDF is not needed at the table. */
export type RuleSection = { title: L; body: L[]; list?: L[]; note?: L }

export const CAMPAIGN_INTRO: L = {
  pt: 'O Modo Campanha é uma variante não oficial, criada por fãs. Você atravessa 7 etapas de um mapa com 18 cenários, liberando habilidades pelo caminho, e tenta vencer o último cenário gastando o mínimo possível de Praias.',
  en: 'Campaign Mode is an unofficial, fan-made variant. You cross 7 stages of a map with 18 scenarios, unlocking abilities along the way, and try to beat the last scenario spending as few Beaches as possible.',
}

export const CAMPAIGN_RULES: RuleSection[] = [
  {
    title: { pt: 'O que você precisa', en: 'What you need' },
    body: [
      {
        pt: 'O jogo Sprawlopolis com as expansões Praias (Beaches), Pontos de Interesse (Points of Interest), Quadras de Construção (Construction Zones) e O Destruidor (Wrecktar). Este site substitui a Ficha de Registro e a caneta.',
        en: 'Sprawlopolis with the Beaches, Points of Interest, Construction Zones and Wrecktar expansions. This site replaces the record sheet and the pen.',
      },
      {
        pt: 'Qualquer número de jogadores. O ideal é que o mesmo grupo jogue a campanha inteira; cada campanha tem a sua própria ficha, então você pode manter várias.',
        en: 'Any number of players. Ideally the same group plays the whole campaign; each campaign has its own sheet, so you can keep several.',
      },
    ],
  },
  {
    title: { pt: 'Como é uma partida', en: 'How a game works' },
    body: [
      {
        pt: 'Cada partida segue todas as regras normais do Sprawlopolis. Só duas coisas mudam: como os objetivos são escolhidos e como as ruas descontam pontos.',
        en: 'Each game follows all the normal Sprawlopolis rules. Only two things change: how the objectives are chosen and how roads cost points.',
      },
    ],
    list: [
      {
        pt: 'Objetivo obrigatório: o número do cenário é a carta de objetivo que sempre entra. Separe-a antes de embaralhar.',
        en: 'Mandatory objective: the scenario number is the scoring card that is always in play. Set it aside before shuffling.',
      },
      {
        pt: 'Dois objetivos sorteados: embaralhe e revele mais duas cartas de objetivo. Se sair uma carta proibida no cenário, descarte-a e revele outra.',
        en: 'Two drawn objectives: shuffle and reveal two more scoring cards. If a card forbidden in the scenario comes up, discard it and reveal another.',
      },
      {
        pt: 'Meta: a soma dos três números. Você vence se a pontuação final for igual ou maior que a meta.',
        en: 'Goal: the sum of the three numbers. You win if your final score equals or beats the goal.',
      },
      {
        pt: 'Expansões do cenário: o ícone de obra pede Quadras de Construção (escolha no site a carta de obra em jogo); o ícone de alerta pede O Destruidor.',
        en: 'Scenario expansions: the roadwork icon calls for Construction Zones (pick the card in play on the site); the warning icon calls for Wrecktar.',
      },
    ],
  },
  {
    title: { pt: 'Dificuldade progressiva', en: 'Progressive difficulty' },
    body: [
      {
        pt: 'As estrelas do cenário definem quanto as ruas custam. São níveis próprios da campanha, diferentes do jogo padrão.',
        en: 'The scenario’s stars set how much roads cost. These levels belong to the campaign and differ from the standard game.',
      },
    ],
    list: [
      { pt: '★ Ajudante: ruas não descontam pontos.', en: '★ Helper: roads do not cost points.' },
      {
        pt: '★★ Pedreiro: ruas descontam metade do total, arredondado para cima (11 ruas = −6).',
        en: '★★ Builder: roads cost half their count, rounded up (11 roads = −6).',
      },
      { pt: '★★★ Mestre de Obras: cada rua desconta 1 ponto (11 ruas = −11).', en: '★★★ Foreman: each road costs 1 point (11 roads = −11).' },
    ],
    note: {
      pt: 'Se quiser um desafio maior, você pode aumentar a dificuldade de um cenário antes de jogá-lo. Diminuir não é permitido.',
      en: 'If you want a bigger challenge, you may raise a scenario’s difficulty before playing it. Lowering it is not allowed.',
    },
  },
  {
    title: { pt: 'Sequência das partidas', en: 'Order of the games' },
    body: [
      {
        pt: 'Todos começam no cenário 4. Depois dele, o seu maior grupo decide o lado do mapa: se for Residencial ou Parque, siga para o cenário 2; se for Industrial ou Comercial, siga para o 5. Em caso de empate entre os lados, você escolhe.',
        en: 'Everyone starts at scenario 4. After it, your largest group decides the side of the map: Residential or Park leads to scenario 2; Industrial or Commercial leads to 5. If the sides tie, you choose.',
      },
      {
        pt: 'Daí em diante, sempre que houver uma bifurcação, você decide o caminho seguindo as linhas do mapa. Só se avança para a etapa seguinte depois de uma vitória.',
        en: 'From then on, whenever the path forks, you decide where to go following the lines on the map. You only move to the next stage after a win.',
      },
    ],
  },
  {
    title: { pt: 'Derrota: usando uma Praia', en: 'Defeat: using a Beach' },
    body: [
      {
        pt: 'Perdeu (pontuação menor que a meta)? Escolha uma das quatro cartas de Praia para ajudar e jogue o mesmo cenário de novo, com um novo sorteio dos dois objetivos.',
        en: 'Lost (score below the goal)? Pick one of the four Beach cards to help and play the same scenario again, drawing the two objectives anew.',
      },
    ],
    list: [
      { pt: 'A Praia escolhida não pode ter sido usada antes nesta campanha.', en: 'The chosen Beach cannot have been used before in this campaign.' },
      {
        pt: 'Cada Praia é de uso único: é gasta mesmo que você perca de novo.',
        en: 'Each Beach is single use: it is spent even if you lose again.',
      },
      {
        pt: 'Você só avança quando vencer o cenário.',
        en: 'You only move on once you beat the scenario.',
      },
    ],
    note: {
      pt: 'Interpretação deste site: a revanche usa a expansão Praias completa. A Praia escolhida vira um 4º objetivo e as outras três entram embaralhadas no baralho, porque os objetivos de Praia pontuam em relação às praias no mapa. O documento original não detalha esse ponto.',
      en: 'This site’s reading: the rematch uses the full Beaches expansion. The chosen Beach becomes a 4th objective and the other three are shuffled into the deck, because Beach objectives score in relation to the beaches on the map. The original document does not spell this out.',
    },
  },
  {
    title: { pt: 'Evolução e habilidades', en: 'Evolution and abilities' },
    body: [
      {
        pt: 'Há quatro trilhas de melhoria, uma para cada tipo de terreno. Sempre que você vencer (e só quando vencer), cada trilha avança o número de quadras do seu maior grupo daquele tipo.',
        en: 'There are four upgrade tracks, one per zone type. Whenever you win (and only then), each track advances by the number of blocks in your largest group of that type.',
      },
      {
        pt: 'Ao alcançar um espaço marcado, a habilidade correspondente é liberada e vale a partir da partida seguinte. As habilidades estão descritas na ficha da campanha.',
        en: 'Reaching a marked space unlocks the matching ability, which applies from the next game on. The abilities are described on the campaign sheet.',
      },
    ],
    note: {
      pt: 'O documento original se contradiz sobre os Parques: o texto das regras diz 1 ponto a cada 3 parques (P1) e a cada 2 (P2); a ficha impressa diz 4 e 3. Este site segue o texto das regras. O mesmo vale para a C2 (quantas cartas quiser, em vez da mão toda).',
      en: 'The original document contradicts itself about Parks: the rules text says 1 point per 3 parks (P1) and per 2 (P2); the printed sheet says 4 and 3. This site follows the rules text. The same goes for C2 (any number of cards, rather than the whole hand).',
    },
  },
  {
    title: { pt: 'Fim da campanha e ranking', en: 'End of the campaign and ranking' },
    body: [
      {
        pt: 'A campanha termina quando você vence o cenário 18 ou quando perde sem ter mais Praias para usar. O ranking final depende de quantas derrotas você sofreu:',
        en: 'The campaign ends when you beat scenario 18 or when you lose with no Beaches left. The final ranking depends on how many defeats you suffered:',
      },
    ],
    list: [
      { pt: '0 derrotas: A', en: '0 defeats: A' },
      { pt: '1 derrota: B', en: '1 defeat: B' },
      { pt: '2 derrotas: C', en: '2 defeats: C' },
      { pt: '3 derrotas: D', en: '3 defeats: D' },
      { pt: '4 derrotas: E', en: '4 defeats: E' },
      { pt: '5 derrotas: campanha perdida', en: '5 defeats: campaign lost' },
    ],
  },
]

export const CREDITS: { title: L; lines: L[] }[] = [
  {
    title: { pt: 'Modo Campanha', en: 'Campaign Mode' },
    lines: [
      { pt: 'Oficina de Variantes, 2024', en: 'Oficina de Variantes, 2024' },
      { pt: 'Game design: Rafael Arruda e Raphael Gurian', en: 'Game design: Rafael Arruda and Raphael Gurian' },
      { pt: 'Revisão e playtest: Renan Rondon', en: 'Review and playtest: Renan Rondon' },
      { pt: 'Diagramação: Raphael Gurian', en: 'Layout: Raphael Gurian' },
    ],
  },
  {
    title: { pt: 'Sprawlopolis', en: 'Sprawlopolis' },
    lines: [
      { pt: 'Design: Steven Aramini, Danny Devine e Paul Kluka', en: 'Design: Steven Aramini, Danny Devine and Paul Kluka' },
      { pt: 'Arte: Danny Devine', en: 'Art: Danny Devine' },
      { pt: 'Expansões com design de Jason Tagmire', en: 'Expansions with design by Jason Tagmire' },
      { pt: 'Publicado pela Button Shy Games', en: 'Published by Button Shy Games' },
    ],
  },
]
