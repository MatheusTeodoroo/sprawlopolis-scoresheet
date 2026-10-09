import { BEACH_CARDS, CONSTRUCTION_CARDS, EXPANSIONS, type Variant } from '../data/expansions'
import { useT } from '../i18n'
import { ROADWORK_PENALTIES } from '../lib/scoring'
import { defaultExpansion } from '../lib/campaign'
import type { BeachCard, ExpansionId, Expansions, VariantState } from '../types'
import { NumberStepper, Pill, Points, Section } from './ui'

type Props = {
  value: Expansions
  scores: Partial<Record<ExpansionId, number>>
  onChange: (next: Expansions) => void
  /** expansions the players may turn on and off; defaults to all of them */
  optional?: ExpansionId[]
  /** expansions that are always on (campaign scenarios) */
  forced?: ExpansionId[]
  /** Beach cards still available (campaign: each can be used once) */
  beachChoices?: BeachCard[]
  hint?: string
}

export function ExpansionsSection({ value, scores, onChange, optional, forced = [], beachChoices, hint }: Props) {
  const { t, l } = useT()

  const toggle = (id: ExpansionId) => {
    const next = { ...value }
    if (id in next) delete next[id]
    else Object.assign(next, { [id]: defaultExpansion(id) })
    onChange(next)
  }

  return (
    <Section title={t('exp.title')} hint={hint ?? t('exp.hint')}>
      <div className="flex flex-wrap gap-2 empty:hidden">
        {EXPANSIONS.filter((e) => (optional ? optional.includes(e.id) : !forced.includes(e.id))).map((e) => (
          <Pill key={e.id} on={e.id in value} onClick={() => toggle(e.id)}>
            {e.name}
          </Pill>
        ))}
      </div>

      {EXPANSIONS.filter((e) => e.id in value).map((e) => (
        <div key={e.id} className="mt-3 rounded-xl border border-line bg-bg p-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="caps text-xl leading-tight">{e.name}</h3>
            {e.id !== 'interstate' && <Points value={scores[e.id] ?? 0} className="text-2xl" />}
          </div>
          <p className="mt-1 text-sm leading-snug">{l(e.summary)}</p>

          {e.id === 'wrecktar' && value.wrecktar && (
            <CountRow label={l(e.prompt!)} value={value.wrecktar.commercial} onChange={(commercial) => onChange({ ...value, wrecktar: { commercial } })} />
          )}
          {e.id === 'poi' && value.poi && (
            <CountRow label={l(e.prompt!)} value={value.poi.matches} onChange={(matches) => onChange({ ...value, poi: { matches } })} />
          )}
          {e.id === 'beaches' && value.beaches && (
            <VariantPicker cards={BEACH_CARDS.filter((c) => !beachChoices || beachChoices.includes(c.id))} state={value.beaches} onChange={(beaches) => onChange({ ...value, beaches })} />
          )}
          {e.id === 'construction' && value.construction && (
            <VariantPicker cards={CONSTRUCTION_CARDS} state={value.construction} onChange={(construction) => onChange({ ...value, construction })} />
          )}
          {e.id === 'roadwork' && value.roadwork && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="mb-2 text-sm font-semibold text-muted">{l(e.prompt!)}</p>
              <div className="flex flex-wrap gap-2">
                {ROADWORK_PENALTIES.map((penalty, i) => {
                  const unplaced = value.roadwork!.unplaced
                  const on = unplaced.includes(i)
                  return (
                    <Pill key={i} on={on} onClick={() => onChange({ ...value, roadwork: { unplaced: on ? unplaced.filter((x) => x !== i) : [...unplaced, i] } })}>
                      {`−${Math.abs(penalty)} ${Math.abs(penalty) === 1 ? 'pt' : 'pts'}`}
                    </Pill>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </Section>
  )
}

function CountRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
      <span className="text-sm font-semibold text-muted">{label}</span>
      <NumberStepper value={value} min={0} onChange={onChange} label={label} />
    </div>
  )
}

function VariantPicker<C extends string>({
  cards,
  state,
  onChange,
}: {
  cards: Variant<C>[]
  state: VariantState<C>
  onChange: (next: VariantState<C>) => void
}) {
  const { t, l } = useT()
  const card = cards.find((c) => c.id === state.card)
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="mb-2 text-sm font-semibold text-muted">{t('exp.pickCard')}</p>
      <div className="flex flex-wrap gap-2">
        {cards.map((c) => (
          <Pill key={c.id} on={c.id === state.card} onClick={() => onChange({ card: c.id, count: 0, yes: false })}>
            {c.name}
          </Pill>
        ))}
      </div>
      {card && (
        <>
          {card.job && (
            <p className="mt-3 text-sm leading-snug">
              <strong className="caps text-muted">{t('exp.job')}: </strong>
              {l(card.job)}
            </p>
          )}
          <p className="mt-2 text-sm leading-snug">{l(card.rule)}</p>
          {card.input === 'count' && card.prompt && (
            <CountRow label={l(card.prompt)} value={state.count} onChange={(count) => onChange({ ...state, count })} />
          )}
          {card.input === 'boolean' && card.prompt && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-sm font-semibold text-muted">{l(card.prompt)}</span>
              <Pill on={state.yes} onClick={() => onChange({ ...state, yes: !state.yes })}>
                {state.yes ? t('yes') : t('no')}
              </Pill>
            </div>
          )}
        </>
      )}
    </div>
  )
}
