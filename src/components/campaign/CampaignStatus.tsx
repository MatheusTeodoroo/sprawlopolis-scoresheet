import { ABILITIES, BEACH_NAMES_PT, TRACK_MAX } from '../../data/campaign'
import { cardById } from '../../data/cards'
import { BEACH_CARDS } from '../../data/expansions'
import { plain, useT } from '../../i18n'
import type { CampaignState } from '../../lib/campaign'
import { ZONE_IDS } from '../../lib/scoring'
import type { Campaign } from '../../types'
import { ZONE_BG } from '../ZoneGrid'
import { Section } from '../ui'

type Props = { campaign: Campaign; state: CampaignState; onUndo: () => void; onDelete: () => void }

/** The record sheet: Beaches, evolution tracks, abilities and the results of every game. */
export function CampaignStatus({ campaign, state, onUndo, onDelete }: Props) {
  const { t, l, lang } = useT()
  const beachesLeft = BEACH_CARDS.length - state.beachesUsed.length

  return (
    <>
      <Section title={t('camp.beaches')} hint={t('camp.beachHint', { n: beachesLeft })}>
        <ul className="grid grid-cols-2 gap-2">
          {BEACH_CARDS.map((b) => {
            const used = state.beachesUsed.includes(b.id)
            const order = state.beachesUsed.indexOf(b.id) + 1
            return (
              <li key={b.id} className={`rounded-xl border border-line p-2 ${used ? 'opacity-50' : 'bg-bg'}`}>
                <div className={`caps text-base leading-tight ${used ? 'line-through' : ''}`}>{lang === 'pt' ? BEACH_NAMES_PT[b.id] : b.name}</div>
                <div className="text-xs text-muted">{used ? `#${order} · ${t('camp.used')}` : lang === 'pt' ? b.name : BEACH_NAMES_PT[b.id]}</div>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={t('camp.evolution')} hint={t('camp.evolutionHint')}>
        <div className="space-y-3">
          {ZONE_IDS.map((z) => {
            const marks = ABILITIES.filter((a) => a.zone === z)
            return (
              <div key={z}>
                <div className="flex items-baseline justify-between">
                  <span className="caps text-base">{t(`zone.${z}`)}</span>
                  <span className="caps text-lg tabular-nums">
                    {state.tracks[z]}/{TRACK_MAX}
                  </span>
                </div>
                <div className="relative mt-1 h-4 overflow-hidden rounded-full bg-surface-2">
                  <div className={`h-full ${ZONE_BG[z]}`} style={{ width: `${(state.tracks[z] / TRACK_MAX) * 100}%` }} />
                  {marks.map((a) => (
                    <span key={a.id} className="absolute inset-y-0 w-0.5 bg-ink/60" style={{ left: `calc(${(a.space / TRACK_MAX) * 100}% - 1px)` }} />
                  ))}
                </div>
                <div className="relative h-4 text-xs text-muted">
                  {marks.map((a) => (
                    <span
                      key={a.id}
                      className={`caps absolute -translate-x-full whitespace-nowrap pr-0.5 ${state.abilities[a.id] ? 'text-pos' : ''}`}
                      style={{ left: `${(a.space / TRACK_MAX) * 100}%` }}
                    >
                      {a.id} {state.abilities[a.id] ? '✓' : `· ${a.space}`}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title={t('camp.abilities')}>
        <ul className="space-y-2">
          {ABILITIES.map((a) => (
            <li key={a.id} className={`flex gap-3 rounded-xl border border-line p-2 ${state.abilities[a.id] ? 'bg-bg' : 'opacity-55'}`}>
              <span
                className={`caps flex size-10 shrink-0 items-center justify-center rounded-lg text-lg ${state.abilities[a.id] ? 'bg-goal text-goal-ink' : 'bg-surface-2 text-muted'}`}
              >
                {a.id}
              </span>
              <p className="text-sm leading-snug">{l(a.text)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('camp.results')}>
        {campaign.games.length === 0 ? (
          <p className="text-muted">{t('camp.noResults')}</p>
        ) : (
          <ol className="space-y-1">
            {campaign.games.map((g, i) => (
              <li key={i} className="flex items-baseline gap-2 border-b border-line pb-1 last:border-b-0">
                <span className="w-6 shrink-0 text-right text-sm text-muted">{i + 1}.</span>
                <span className={`w-4 shrink-0 font-bold ${g.won ? 'text-pos' : 'text-neg'}`}>{g.won ? '✓' : '✕'}</span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  <strong>{t('camp.scenario', { n: g.node })}</strong> · {'★'.repeat(g.stars)} · {g.node} + {g.drawn.join(' + ')}
                  <span className="text-muted"> ({[g.node, ...g.drawn].map((id) => cardById(id)?.name).join(', ')})</span>
                </span>
                <span className="caps shrink-0 text-lg tabular-nums">
                  {plain(g.total)}/{g.target}
                </span>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={campaign.games.length === 0} className="h-11 rounded-lg bg-surface-2 px-4 text-sm font-semibold disabled:opacity-40" onClick={onUndo}>
            {t('camp.undo')}
          </button>
          <button type="button" className="h-11 rounded-lg border border-neg px-4 text-sm font-semibold text-neg" onClick={onDelete}>
            {t('camp.delete')}
          </button>
        </div>
      </Section>
    </>
  )
}
