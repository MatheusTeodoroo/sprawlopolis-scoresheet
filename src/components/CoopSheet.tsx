import { useState } from 'react'
import { plain, useT } from '../i18n'
import { suggestAchievements } from '../lib/achievements'
import { ZONE_IDS, coopResult, hardZone, scenicRoute } from '../lib/scoring'
import type { CoopDraft, CoopGame, Draft, ZoneId } from '../types'
import { AchievementPicker } from './AchievementPicker'
import { CardSlot } from './CardSlot'
import { ExpansionsSection } from './ExpansionsSection'
import { NotesField } from './MetaSection'
import { TotalBar } from './TotalBar'
import { NumberStepper, Points, Section, Segmented } from './ui'

export const ZONE_BG: Record<ZoneId, string> = {
  residential: 'bg-res',
  commercial: 'bg-com',
  industrial: 'bg-ind',
  park: 'bg-park',
}

type Props = {
  draft: Draft
  onChange: (patch: Partial<CoopDraft>) => void
  onNotes: (notes: string) => void
  onSave: (game: CoopGame) => void
}

export function CoopSheet({ draft, onChange, onNotes, onSave }: Props) {
  const { t } = useT()
  const d = draft.coop
  const r = coopResult(d)
  const ready = d.cards.every((c) => c !== null)
  const noTax = d.difficulty === 'easy' || scenicRoute(d.expansions)
  const scoredZone = d.difficulty === 'hard' ? hardZone(d.zones) : null
  const [picking, setPicking] = useState(false)

  const save = (achievements: string[]) => {
    setPicking(false)
    onSave({
      id: crypto.randomUUID(),
      date: draft.date,
      cityName: draft.cityName.trim(),
      players: draft.players,
      notes: draft.notes.trim(),
      mode: 'coop',
      difficulty: d.difficulty,
      cards: d.cards as [number, number, number],
      cardPoints: d.cardPoints,
      zones: d.zones,
      roads: d.roads,
      expansions: d.expansions,
      modifier: d.modifier,
      total: r.total,
      target: r.target,
      won: r.won,
      achievements,
    })
  }

  return (
    <>
      <Section
        title={t('cards.title')}
        aside={
          <div className="flex items-center gap-2">
            <span className="caps text-sm text-muted">{t('goal')}</span>
            <span className="caps flex size-14 items-center justify-center rounded-full border-2 border-muted bg-goal text-3xl text-goal-ink tabular-nums">
              {r.target}
            </span>
          </div>
        }
      >
        <div className="space-y-2">
          {d.cards.map((card, i) => (
            <CardSlot
              key={i}
              index={i}
              value={card}
              taken={d.cards.filter((c, j): c is number => c !== null && j !== i)}
              onChange={(next) => onChange({ cards: d.cards.map((c, j) => (j === i ? next : c)) as CoopDraft['cards'] })}
              points={d.cardPoints[i]}
              onPoints={(n) => onChange({ cardPoints: d.cardPoints.map((p, j) => (j === i ? n : p)) as CoopDraft['cardPoints'] })}
            />
          ))}
        </div>
      </Section>

      <Section title={t('zones.title')} aside={<Points value={r.blocks} className="text-2xl" />}>
        <div className="grid grid-cols-2 gap-2">
          {ZONE_IDS.map((z) => (
            <div
              key={z}
              className={`rounded-xl p-2 transition-opacity ${ZONE_BG[z]} ${scoredZone && scoredZone !== z ? 'opacity-45' : ''}`}
            >
              <div className="caps mb-1 text-center text-base text-zone-ink">{t(`zone.${z}`)}</div>
              <div className="flex justify-center">
                <NumberStepper compact min={0} value={d.zones[z]} label={t(`zone.${z}`)} onChange={(n) => onChange({ zones: { ...d.zones, [z]: n } })} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Segmented
            label={t('diff.title')}
            value={d.difficulty}
            onChange={(difficulty) => onChange({ difficulty })}
            options={[
              { value: 'normal', label: t('diff.normal') },
              { value: 'easy', label: t('diff.easy') },
              { value: 'hard', label: t('diff.hard') },
            ]}
          />
          {d.difficulty !== 'normal' && <p className="mt-2 text-sm text-muted">{t(d.difficulty === 'easy' ? 'diff.easyHint' : 'diff.hardHint')}</p>}
        </div>
      </Section>

      <Section
        title={t('roads.title')}
        hint={t('roads.hint')}
        aside={noTax ? <span className="caps text-lg text-pos">{t('roads.free')}</span> : <Points value={r.roads} className="text-2xl" />}
      >
        <div className={`flex items-center justify-between ${noTax ? 'opacity-60' : ''}`}>
          <span className="text-sm font-semibold text-muted">{t('roads.count')}</span>
          <NumberStepper min={0} value={d.roads} label={t('roads.count')} onChange={(roads) => onChange({ roads })} />
        </div>
      </Section>

      <ExpansionsSection value={d.expansions} scores={r.expansions} onChange={(expansions) => onChange({ expansions })} />

      <Section title={t('mod.title')} hint={t('mod.hint')}>
        <div className="flex justify-end">
          <NumberStepper value={d.modifier} label={t('mod.title')} onChange={(modifier) => onChange({ modifier })} />
        </div>
        <NotesField value={draft.notes} onChange={onNotes} />
      </Section>

      <Section title={t('sum.title')}>
        <dl className="space-y-1 text-base">
          {(
            [
              ['sum.blocks', r.blocks],
              ['sum.roads', r.roads],
              ['sum.cards', r.cards],
              ['sum.expansions', r.expansionsTotal],
              ['sum.modifier', d.modifier],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <dt className="text-muted">{t(key)}</dt>
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
      </Section>

      <TotalBar
        status={!ready ? t('result.need') : r.won ? t('result.win') : t('result.lose')}
        tone={!ready ? 'neutral' : r.won ? 'win' : 'lose'}
        canSave={ready}
        onSave={() => (r.won ? setPicking(true) : save([]))}
      >
        <span className={`caps text-4xl leading-none tabular-nums ${r.total < 0 ? 'text-neg' : ''}`}>{plain(r.total)}</span>
        <span className="caps text-lg text-muted">
          / {t('goal')} {r.target}
        </span>
      </TotalBar>

      {picking && (
        <AchievementPicker
          suggested={suggestAchievements({ won: r.won, total: r.total, target: r.target, roads: d.roads, zones: d.zones })}
          onConfirm={save}
          onCancel={() => setPicking(false)}
        />
      )}
    </>
  )
}
