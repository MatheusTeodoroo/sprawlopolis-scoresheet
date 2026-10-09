import type { ReactNode } from 'react'
import { ABILITIES, DIFFICULTIES, scenarioById } from '../../data/campaign'
import { BEACH_CARDS } from '../../data/expansions'
import { plain, useT } from '../../i18n'
import { alignExpansions, campaignResult, nextOptions, scenarioExpansions, type CampaignState } from '../../lib/campaign'
import { scenicRoute } from '../../lib/scoring'
import { today } from '../../lib/storage'
import type { CampaignDraft, CampaignGame, Stars } from '../../types'
import { CardSlot } from '../CardSlot'
import { ExpansionsSection } from '../ExpansionsSection'
import { NotesField } from '../MetaSection'
import { TotalBar } from '../TotalBar'
import { NumberStepper, Points, Section } from '../ui'
import { ZoneGrid } from '../ZoneGrid'

type Props = {
  draft: CampaignDraft
  state: CampaignState
  onChange: (patch: Partial<CampaignDraft>) => void
  onSave: (game: CampaignGame) => void
}

/** Scoresheet for the scenario being played, with the campaign's own road tax, abilities and forced expansions. */
export function CampaignSheet({ draft, state, onChange, onSave }: Props) {
  const { t, l } = useT()
  const scenario = scenarioById(state.node)
  const stars = Math.max(draft.stars ?? scenario.stars, scenario.stars) as Stars
  const { forced, optional } = scenarioExpansions(state)
  const expansions = alignExpansions(draft.expansions, forced, optional)
  const ab = state.abilities
  const r = campaignResult({ ...draft, node: scenario.id, stars, expansions }, ab)
  const noTax = stars === 1 || scenicRoute(expansions)
  const active = ABILITIES.filter((a) => ab[a.id] && !(a.id === 'I1' && ab.I2) && !(a.id === 'P1' && ab.P2))

  const missing = !draft.drawn.every((c) => c !== null)
    ? t('camp.needCards')
    : forced.includes('beaches') && !expansions.beaches?.card
      ? t('camp.needBeach')
      : forced.includes('construction') && !expansions.construction?.card
        ? t('camp.needConstruction')
        : null

  const save = () => {
    const options = nextOptions(scenario.id, draft.zones)
    onSave({
      date: today(),
      node: scenario.id,
      stars,
      drawn: draft.drawn as [number, number],
      cardPoints: draft.cardPoints,
      zones: draft.zones,
      roads: draft.roads,
      expansions,
      parkSets: ab.P1 ? draft.parkSets : 0,
      industrialRoads: ab.I1 ? Math.min(3, draft.industrialRoads) : 0,
      notes: draft.notes.trim(),
      total: r.total,
      target: r.target,
      won: r.won,
      ...(r.won && options.length === 1 ? { next: options[0] } : {}),
    })
  }

  const setPoints = (i: number, n: number) => onChange({ cardPoints: draft.cardPoints.map((p, j) => (j === i ? n : p)) as CampaignDraft['cardPoints'] })

  return (
    <>
      {state.needsBeach && <p className="rounded-2xl bg-goal p-3 text-sm font-semibold leading-snug text-goal-ink">{t('camp.rematch')}</p>}

      <Section title={t('camp.difficulty')} hint={t('camp.raise')}>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={s < scenario.stars}
              aria-pressed={s === stars}
              onClick={() => onChange({ stars: s })}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold disabled:opacity-35 ${
                s === stars ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'
              }`}
            >
              {'★'.repeat(s)} {l(DIFFICULTIES[s].name)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm">{l(DIFFICULTIES[stars].rule)}</p>
      </Section>

      {active.length > 0 && (
        <Section title={t('camp.abilitiesActive')}>
          <ul className="space-y-1.5 text-sm leading-snug">
            {active.map((a) => (
              <li key={a.id}>
                <strong className="caps mr-1 text-base">{a.id}</strong>
                {l(a.text)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title={t('cards.title')}
        aside={
          <div className="flex items-center gap-2">
            <span className="caps text-sm text-muted">{t('goal')}</span>
            <span className="caps flex size-14 items-center justify-center rounded-full border-2 border-muted bg-goal text-3xl text-goal-ink tabular-nums">{r.target}</span>
          </div>
        }
        hint={scenario.forbidden.length ? t('camp.forbidden', { list: scenario.forbidden.join(', ') }) : t('camp.noForbidden')}
      >
        <div className="space-y-2">
          <CardSlot index={0} value={scenario.id} fixed taken={[]} onChange={() => {}} points={draft.cardPoints[0]} onPoints={(n) => setPoints(0, n)} />
          {draft.drawn.map((card, i) => (
            <CardSlot
              key={i}
              index={i + 1}
              value={card}
              forbidden={scenario.forbidden}
              taken={[scenario.id, ...draft.drawn.filter((c, j): c is number => c !== null && j !== i)]}
              onChange={(next) => onChange({ drawn: draft.drawn.map((c, j) => (j === i ? next : c)) as CampaignDraft['drawn'] })}
              points={draft.cardPoints[i + 1]}
              onPoints={(n) => setPoints(i + 1, n)}
            />
          ))}
        </div>
      </Section>

      <Section title={t('zones.title')} aside={<Points value={r.blocks} className="text-2xl" />}>
        <ZoneGrid zones={draft.zones} onChange={(zones) => onChange({ zones })} />
        {ab.P1 && (
          <Row label={t(ab.P2 ? 'camp.parkSets2' : 'camp.parkSets3')}>
            <NumberStepper min={0} value={draft.parkSets} label={t(ab.P2 ? 'camp.parkSets2' : 'camp.parkSets3')} onChange={(parkSets) => onChange({ parkSets })} />
          </Row>
        )}
      </Section>

      <Section
        title={t('roads.title')}
        hint={l(DIFFICULTIES[stars].rule)}
        aside={noTax ? <span className="caps text-lg text-pos">{t('roads.free')}</span> : <Points value={r.roads} className="text-2xl" />}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">{t('roads.count')}</span>
          <NumberStepper min={0} value={draft.roads} label={t('roads.count')} onChange={(roads) => onChange({ roads })} />
        </div>
        {ab.I1 && (
          <Row label={t('camp.industrialRoads')}>
            <NumberStepper
              min={0}
              value={Math.min(3, draft.industrialRoads)}
              label={t('camp.industrialRoads')}
              onChange={(n) => onChange({ industrialRoads: Math.min(3, n) })}
            />
          </Row>
        )}
      </Section>

      {(forced.length > 0 || optional.length > 0) && (
        <ExpansionsSection
          value={expansions}
          scores={r.expansions}
          forced={forced}
          optional={optional}
          beachChoices={BEACH_CARDS.map((b) => b.id).filter((id) => !state.beachesUsed.includes(id))}
          hint={forced.length ? t('camp.expHint') : undefined}
          onChange={(next) => onChange({ expansions: next })}
        />
      )}

      <Section title={t('sum.title')}>
        <dl className="space-y-1 text-base">
          {(
            [
              [t('sum.blocks'), r.blocks, true],
              [t('sum.roads'), r.roads, true],
              [t('sum.cards'), r.cards, true],
              [t('sum.expansions'), r.expansionsTotal, forced.length > 0 || optional.length > 0],
              [t('camp.bonusPark'), r.parkBonus, ab.P1],
              [t('camp.bonusIndustrial'), r.industrialBonus, ab.I2],
            ] as const
          )
            .filter(([, , show]) => show)
            .map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-muted">{label}</dt>
                <dd>
                  <Points value={value} className="text-lg" />
                </dd>
              </div>
            ))}
          <div className="flex justify-between border-t border-line pt-1">
            <dt className="caps text-lg">{t('sum.total')}</dt>
            <dd className={`caps text-2xl tabular-nums ${r.total < 0 ? 'text-neg' : ''}`}>{plain(r.total)}</dd>
          </div>
        </dl>
        <NotesField value={draft.notes} onChange={(notes) => onChange({ notes })} />
      </Section>

      <TotalBar
        status={missing ?? (r.won ? t('result.win') : t('result.lose'))}
        tone={missing ? 'neutral' : r.won ? 'win' : 'lose'}
        canSave={!missing}
        onSave={save}
      >
        <span className={`caps text-4xl leading-none tabular-nums ${r.total < 0 ? 'text-neg' : ''}`}>{plain(r.total)}</span>
        <span className="caps text-lg text-muted">
          / {t('goal')} {r.target}
        </span>
      </TotalBar>
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
      <span className="text-sm font-semibold text-muted">{label}</span>
      {children}
    </div>
  )
}
