import type { ReactNode } from 'react'
import { cardById } from '../data/cards'
import { INTERSTATE_CARDS, interstateById } from '../data/interstate'
import { plain, useT } from '../i18n'
import { competitiveResult } from '../lib/competitive'
import { ZONE_IDS } from '../lib/scoring'
import type { Draft, Side, VsDraft, VsGame } from '../types'
import { CardSlot } from './CardSlot'
import { ZONE_BG } from './CoopSheet'
import { NotesField } from './MetaSection'
import { TotalBar } from './TotalBar'
import { NumberStepper, Pill, Section } from './ui'

type Props = {
  draft: Draft
  onChange: (patch: Partial<VsDraft>) => void
  onNotes: (notes: string) => void
  onSave: (game: VsGame) => void
}

export function CompetitiveSheet({ draft, onChange, onNotes, onSave }: Props) {
  const { t, l } = useT()
  const d = draft.vs
  const interstate = interstateById(d.interstateCard)
  const result = competitiveResult(interstate?.scoring ?? 'standard', d.sides)
  const names = [draft.players[0]?.trim() || t('vs.playerA'), draft.players[1]?.trim() || t('vs.playerB')]
  const hasNames = Boolean(draft.players[0]?.trim() && draft.players[1]?.trim()) && draft.players[0].trim() !== draft.players[1].trim()
  const hasCards = interstate !== undefined && d.cards.every((c) => c !== null)

  const setSide = (i: 0 | 1, patch: Partial<Side>) =>
    onChange({ sides: d.sides.map((s, j) => (j === i ? { ...s, ...patch } : s)) as [Side, Side] })

  const row = (label: ReactNode, key: string, render: (side: Side, i: 0 | 1) => ReactNode) => (
    <div key={key} className="border-t border-line py-2 first:border-t-0">
      <div className="mb-1 text-center text-sm font-semibold text-muted">{label}</div>
      <div className="grid grid-cols-2 justify-items-center gap-2">{([0, 1] as const).map((i) => <div key={i}>{render(d.sides[i], i)}</div>)}</div>
    </div>
  )

  const status = !hasCards
    ? t('vs.need')
    : !hasNames
      ? t('vs.needNames')
      : result.winner === null
        ? t('vs.tie')
        : t('vs.wins', { name: names[result.winner] })

  return (
    <>
      <Section title={t('vs.interstate')} hint={interstate ? undefined : t('vs.pickInterstate')}>
        <div className="flex flex-wrap gap-2">
          {INTERSTATE_CARDS.map((c) => (
            <Pill key={c.id} on={c.id === d.interstateCard} onClick={() =>
                // each card has its own tiebreaker, so a value typed for another card no longer applies
                onChange({ interstateCard: c.id, sides: d.sides.map((s) => ({ ...s, tiebreak: 0 })) as [Side, Side] })
              }
            >
              {c.name}
            </Pill>
          ))}
        </div>
        {interstate && (
          <dl className="mt-3 space-y-1 rounded-xl border border-line bg-bg p-3 text-sm leading-snug">
            {(
              [
                ['vs.placement', interstate.placement],
                ['vs.scoring', interstate.rule],
                ['vs.tiebreak', interstate.tiebreak],
              ] as const
            ).map(([key, text]) => (
              <div key={key}>
                <dt className="caps inline text-muted">{t(key)}: </dt>
                <dd className="inline">{l(text)}</dd>
              </div>
            ))}
          </dl>
        )}
      </Section>

      <Section title={t('cards.title')}>
        <div className="space-y-2">
          {d.cards.map((card, i) => (
            <CardSlot
              key={i}
              index={i}
              value={card}
              taken={d.cards.filter((c, j): c is number => c !== null && j !== i)}
              onChange={(next) => onChange({ cards: d.cards.map((c, j) => (j === i ? next : c)) as VsDraft['cards'] })}
            />
          ))}
        </div>
      </Section>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="grid grid-cols-2 gap-2 pb-2">
          {names.map((name, i) => (
            <h2 key={i} className="caps truncate text-center text-xl">
              {name}
            </h2>
          ))}
        </div>
        {ZONE_IDS.map((z) =>
          row(
            <span className="inline-flex items-center gap-1.5">
              <span className={`inline-block size-3 rounded-sm ${ZONE_BG[z]}`} />
              {t(`zone.${z}`)}
            </span>,
            z,
            (side, i) => (
              <NumberStepper compact min={0} value={side.zones[z]} label={`${t(`zone.${z}`)} · ${names[i]}`} onChange={(n) => setSide(i, { zones: { ...side.zones, [z]: n } })} />
            ),
          ),
        )}
        {row(t('roads.count'), 'roads', (side, i) => (
          <NumberStepper compact min={0} value={side.roads} label={`${t('roads.count')} · ${names[i]}`} onChange={(roads) => setSide(i, { roads })} />
        ))}
        {([0, 1] as const).map((c) => {
          const label = t('vs.cardPts', { name: cardById(d.cards[c])?.name ?? t('cards.slot', { n: c + 1 }) })
          return row(label, `card${c}`, (side, i) => (
            <NumberStepper
              compact
              value={side.cardPoints[c]}
              label={`${label} · ${names[i]}`}
              onChange={(n) => setSide(i, { cardPoints: side.cardPoints.map((p, j) => (j === c ? n : p)) as [number, number] })}
            />
          ))
        })}
        {row(t('vs.modifier'), 'modifier', (side, i) => (
          <NumberStepper compact value={side.modifier} label={`${t('vs.modifier')} · ${names[i]}`} onChange={(modifier) => setSide(i, { modifier })} />
        ))}

        {hasCards && result.tied && interstate && (
          <div className="mt-2 rounded-xl bg-goal p-3 text-goal-ink">
            <p className="mb-2 text-center text-sm font-semibold" role="status">
              {t('vs.tied', { crit: l(interstate.tiebreak) })}
            </p>
            <div className="grid grid-cols-2 justify-items-center gap-2">
              {([0, 1] as const).map((i) => (
                <NumberStepper key={i} compact min={0} value={d.sides[i].tiebreak} label={`${l(interstate.tiebreak)} · ${names[i]}`} onChange={(tiebreak) => setSide(i, { tiebreak })} />
              ))}
            </div>
          </div>
        )}

        <NotesField value={draft.notes} onChange={onNotes} />
      </section>

      <TotalBar
        status={status}
        tone={hasCards && hasNames && result.winner !== null ? 'win' : 'neutral'}
        canSave={hasCards && hasNames}
        onSave={() =>
          interstate &&
          onSave({
            id: crypto.randomUUID(),
            date: draft.date,
            cityName: draft.cityName.trim(),
            players: [draft.players[0].trim(), draft.players[1].trim()],
            notes: draft.notes.trim(),
            mode: 'competitive',
            interstateCard: interstate.id,
            cards: d.cards as [number, number],
            sides: d.sides,
            scores: result.scores,
            winner: result.winner,
          })
        }
      >
        <span className="caps text-4xl leading-none tabular-nums">
          {plain(result.scores[0])} × {plain(result.scores[1])}
        </span>
      </TotalBar>
    </>
  )
}
