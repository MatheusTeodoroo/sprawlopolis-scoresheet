import { BOARD, SCENARIOS, scenarioById, type ScenarioDef } from '../../data/campaign'
import { useT } from '../../i18n'
import type { CampaignState } from '../../lib/campaign'

const W = 56
const H = 68

type Props = {
  state: CampaignState
  selected: number
  onSelect: (id: number) => void
}

/** Every scenario still reachable from the given ones, following the lines upwards. */
function reachableFrom(ids: number[]): Set<number> {
  const seen = new Set<number>()
  const visit = (id: number) => {
    if (seen.has(id)) return
    seen.add(id)
    scenarioById(id).next.forEach(visit)
  }
  ids.forEach(visit)
  return seen
}

/** The campaign map: 18 scenarios in 7 stages, read from the bottom (start) to the top (final). */
export function CampaignBoard({ state, selected, onSelect }: Props) {
  const { t } = useT()
  const done = new Set(state.path)
  const choosable = new Set(state.awaitingNext ?? [])
  const current = state.status === 'playing' && !state.awaitingNext ? state.node : null
  const open = reachableFrom(state.awaitingNext ?? [state.node])
  const walked = (a: number, b: number) => done.has(a) && (done.has(b) || b === current) && state.path[state.path.indexOf(a) + 1] === b
  const lastStep = (a: number, b: number) => state.path.at(-1) === a && b === current

  const look = (s: ScenarioDef) => {
    if (done.has(s.id)) return { fill: 'var(--park)', ink: 'var(--zone-ink)', stroke: 'var(--muted)', dash: undefined, dim: false }
    if (s.id === current) return { fill: 'var(--goal)', ink: 'var(--goal-ink)', stroke: 'var(--ink)', dash: undefined, dim: false }
    if (choosable.has(s.id)) return { fill: 'var(--surface)', ink: 'var(--ink)', stroke: 'var(--accent)', dash: '5 3', dim: false }
    return { fill: 'var(--surface)', ink: 'var(--ink)', stroke: 'var(--line)', dash: undefined, dim: state.status !== 'playing' || !open.has(s.id) }
  }

  return (
    <div>
      <svg viewBox={`0 0 ${BOARD.width} ${BOARD.height}`} className="mx-auto block w-full max-w-md" role="group" aria-label={t('camp.view.map')}>
        {SCENARIOS.flatMap((s) =>
          s.next.map((n) => {
            const to = scenarioById(n)
            const on = walked(s.id, n) || lastStep(s.id, n)
            return (
              <line
                key={`${s.id}-${n}`}
                x1={s.x} y1={s.y} x2={to.x} y2={to.y}
                stroke={on ? 'var(--accent)' : 'var(--line)'}
                strokeWidth={on ? 5 : 3}
                strokeLinecap="round"
              />
            )
          }),
        )}
        {SCENARIOS.map((s) => {
          const v = look(s)
          return (
            <g
              key={s.id}
              role="button"
              tabIndex={0}
              aria-label={t('camp.scenario', { n: s.id })}
              aria-pressed={s.id === selected}
              onClick={() => onSelect(s.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(s.id))}
              opacity={v.dim ? 0.4 : 1}
              className="cursor-pointer"
            >
              <rect
                x={s.x - W / 2} y={s.y - H / 2} width={W} height={H} rx={9}
                fill={v.fill} stroke={s.id === selected ? 'var(--accent)' : v.stroke}
                strokeWidth={s.id === selected ? 4 : 2} strokeDasharray={s.id === selected ? undefined : v.dash}
              />
              <text x={s.x} y={s.y - 19} textAnchor="middle" fontSize={11} fill={v.ink}>
                {'★'.repeat(s.stars) + '☆'.repeat(3 - s.stars)}
              </text>
              <text x={s.x} y={s.y + 9} textAnchor="middle" fontSize={25} className="caps" fill={v.ink}>
                {s.id}
              </text>
              <text x={s.x} y={s.y + 26} textAnchor="middle" fontSize={8.5} fill={v.ink}>
                {done.has(s.id) ? '✓' : s.forbidden.length ? `⊘ ${s.forbidden.join('/')}` : ''}
              </text>
              {s.expansions.includes('construction') && <ConstructionIcon x={s.x - W / 2} y={s.y - H / 2} />}
              {s.expansions.includes('wrecktar') && <WrecktarIcon x={s.x + W / 2} y={s.y - H / 2} />}
            </g>
          )
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1">
          <svg viewBox="-10 -10 20 20" className="size-4"><ConstructionIcon x={0} y={0} /></svg>
          {t('camp.legendConstruction')}
        </li>
        <li className="flex items-center gap-1">
          <svg viewBox="-10 -10 20 20" className="size-4"><WrecktarIcon x={0} y={0} /></svg>
          {t('camp.legendWrecktar')}
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-goal" /> {t('camp.legendCurrent')}
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-park" /> {t('camp.legendDone')}
        </li>
      </ul>
    </div>
  )
}

/** Yellow roadwork diamond: the scenario adds Construction Zones. */
export function ConstructionIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-6.5} y={-6.5} width={13} height={13} rx={2} transform="rotate(45)" fill="#f2b632" stroke="#4a3a12" strokeWidth={1.2} />
      <path d="M-3 3 L0 -3 L3 3 Z" fill="#4a3a12" />
    </g>
  )
}

/** Red warning triangle: the scenario adds Wrecktar. */
export function WrecktarIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -8 L8.5 7 L-8.5 7 Z" fill="#fff" stroke="#c0392b" strokeWidth={2.4} strokeLinejoin="round" />
      <rect x={-1} y={-3} width={2} height={5} fill="#2c261e" />
      <rect x={-1} y={3.2} width={2} height={2} fill="#2c261e" />
    </g>
  )
}
