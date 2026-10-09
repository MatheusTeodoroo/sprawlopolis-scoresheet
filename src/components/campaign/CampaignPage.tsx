import { useState } from 'react'
import { ABILITIES, DIFFICULTIES, EXPANSION_NAMES_PT, START_SCENARIO, scenarioById } from '../../data/campaign'
import { cardById } from '../../data/cards'
import { EXPANSIONS } from '../../data/expansions'
import { plain, useT } from '../../i18n'
import { campaignState, emptyCampaignDraft, newCampaign, undoLastGame, type CampaignState } from '../../lib/campaign'
import { ZONE_IDS } from '../../lib/scoring'
import type { Campaign, CampaignGame } from '../../types'
import { useConfirm } from '../confirm'
import { Segmented } from '../ui'
import { CampaignBoard } from './CampaignBoard'
import { CampaignRules } from './CampaignRules'
import { CampaignSheet } from './CampaignSheet'
import { CampaignStatus } from './CampaignStatus'

const field = 'h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 text-base text-ink placeholder:text-muted/70'
type View = 'map' | 'game' | 'sheet' | 'rules'

type Props = { campaigns: Campaign[]; onChange: (next: Campaign[] | ((prev: Campaign[]) => Campaign[])) => void }

export function CampaignPage({ campaigns, onChange }: Props) {
  const { t } = useT()
  const [openId, setOpenId] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [cityName, setCityName] = useState('')
  const [players, setPlayers] = useState('')
  const open = campaigns.find((c) => c.id === openId)

  if (open) {
    return (
      <CampaignView
        key={open.id}
        campaign={open}
        onBack={() => setOpenId(null)}
        onUpdate={(next) => onChange((list) => list.map((c) => (c.id === next.id ? next : c)))}
        onDelete={() => {
          onChange((list) => list.filter((c) => c.id !== open.id))
          setOpenId(null)
        }}
      />
    )
  }

  const create = () => {
    const c = newCampaign(cityName.trim(), players.split(',').map((p) => p.trim()).filter(Boolean))
    onChange((list) => [c, ...list])
    setCityName('')
    setPlayers('')
    setOpenId(c.id)
  }

  const withState = campaigns.map((c) => ({ c, s: campaignState(c.games) }))
  const groups = [
    { title: t('camp.active'), items: withState.filter((x) => x.s.status === 'playing') },
    { title: t('camp.finished'), items: withState.filter((x) => x.s.status !== 'playing') },
  ]

  return (
    <>
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="caps text-2xl">{t('camp.title')}</h2>
        <div className="mt-3 grid gap-2">
          <input className={field} aria-label={t('meta.city')} placeholder={t('meta.city')} value={cityName} onChange={(e) => setCityName(e.target.value)} />
          <input className={field} aria-label={t('meta.players')} placeholder={t('camp.playersPh')} value={players} onChange={(e) => setPlayers(e.target.value)} />
          <button type="button" className="caps h-12 rounded-xl bg-accent text-lg text-accent-ink" onClick={create}>
            {t('camp.create')}
          </button>
          <button type="button" className="h-11 rounded-xl bg-surface-2 text-sm font-semibold" aria-expanded={showRules} onClick={() => setShowRules((v) => !v)}>
            {t('camp.howTo')}
          </button>
        </div>
      </section>

      {showRules && <CampaignRules />}

      {campaigns.length === 0 && !showRules && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{t('camp.empty')}</p>}

      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.title}>
            <h3 className="caps mb-2 text-lg text-muted">{g.title}</h3>
            <ul className="space-y-2">
              {g.items.map(({ c, s }) => (
                <li key={c.id}>
                  <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left" onClick={() => setOpenId(c.id)}>
                    <div className="min-w-0 flex-1">
                      <div className="caps truncate text-lg leading-tight">{c.cityName || t('camp.unnamed')}</div>
                      <div className="truncate text-sm text-muted">{[c.players.join(', '), t('camp.defeats', { n: s.defeats })].filter(Boolean).join(' · ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="caps text-2xl leading-none">{statusLabel(s, t)}</div>
                      {s.status === 'playing' && <div className="text-xs text-muted">{t('camp.stage', { n: scenarioById(s.node).stage })}</div>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </>
  )
}

function statusLabel(s: CampaignState, t: ReturnType<typeof useT>['t']): string {
  if (s.status === 'won') return t('camp.rank', { rank: s.rank ?? '' })
  if (s.status === 'lost') return '✕'
  return `#${s.node}`
}

type ViewProps = { campaign: Campaign; onBack: () => void; onUpdate: (c: Campaign) => void; onDelete: () => void }

function CampaignView({ campaign, onBack, onUpdate, onDelete }: ViewProps) {
  const { t, l, lang } = useT()
  const ask = useConfirm()
  const state = campaignState(campaign.games)
  const [view, setView] = useState<View>('map')
  const [selected, setSelected] = useState(state.node)
  const last = campaign.games.at(-1)
  const canPlay = state.status === 'playing' && !state.awaitingNext

  const chooseNext = (next: number) => {
    onUpdate({ ...campaign, games: campaign.games.map((g, i) => (i === campaign.games.length - 1 ? { ...g, next } : g)) })
    setSelected(next)
  }
  const saveGame = (game: CampaignGame) => {
    const games = [...campaign.games, game]
    onUpdate({ ...campaign, games, draft: emptyCampaignDraft() })
    setSelected(campaignState(games).node)
    setView('map')
    window.scrollTo({ top: 0 })
  }
  const undo = async () => {
    if (!(await ask(t('camp.confirmUndo')))) return
    const undone = undoLastGame(campaign)
    onUpdate(undone)
    setSelected(campaignState(undone.games).node)
    setView('game')
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="h-10 rounded-lg bg-surface-2 px-3 text-sm font-semibold" onClick={onBack}>
          {t('camp.back')}
        </button>
        <div className="min-w-0 text-right">
          <div className="caps truncate text-xl leading-tight">{campaign.cityName || t('camp.unnamed')}</div>
          <div className="truncate text-xs text-muted">{[campaign.players.join(', '), t('camp.defeats', { n: state.defeats })].filter(Boolean).join(' · ')}</div>
        </div>
      </div>

      <Segmented
        label={t('camp.title')}
        value={view}
        onChange={setView}
        dense
        options={[
          { value: 'map', label: t('camp.view.map') },
          { value: 'game', label: t('camp.view.game') },
          { value: 'sheet', label: t('camp.view.sheet') },
          { value: 'rules', label: t('camp.view.rules') },
        ]}
      />

      {view === 'map' && (
        <>
          <Banner campaign={campaign} state={state} last={last} onChoose={chooseNext} />
          <section className="rounded-2xl border border-line bg-surface p-3">
            <CampaignBoard state={state} selected={selected} onSelect={setSelected} />
          </section>
          <ScenarioCard id={selected} />
          {canPlay && (
            <button type="button" className="caps h-12 w-full rounded-xl bg-accent text-lg text-accent-ink" onClick={() => setView('game')}>
              {t('camp.play', { n: state.node })}
            </button>
          )}
        </>
      )}

      {view === 'game' &&
        (canPlay ? (
          <>
            <ScenarioCard id={state.node} compact />
            <CampaignSheet
              draft={campaign.draft}
              state={state}
              onChange={(patch) => onUpdate({ ...campaign, draft: { ...campaign.draft, ...patch } })}
              onSave={saveGame}
            />
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
            {state.status === 'playing' ? t('camp.chooseFirst') : t('camp.over')}
          </p>
        ))}

      {view === 'sheet' && (
        <CampaignStatus
          campaign={campaign}
          state={state}
          onUndo={() => void undo()}
          onDelete={async () => (await ask(t('camp.confirmDelete'))) && onDelete()}
        />
      )}

      {view === 'rules' && <CampaignRules />}
    </>
  )

  /** What the scenario asks for: mandatory card, difficulty, forbidden cards, expansions and where it leads. */
  function ScenarioCard({ id, compact = false }: { id: number; compact?: boolean }) {
    const s = scenarioById(id)
    const card = cardById(id)
    const expansionName = (e: string) => {
      const def = EXPANSIONS.find((x) => x.id === e)
      const ptName = EXPANSION_NAMES_PT[e as keyof typeof EXPANSION_NAMES_PT]
      return lang === 'pt' && ptName ? `${ptName} (${def?.name})` : (def?.name ?? e)
    }
    return (
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="caps text-2xl leading-tight">{t('camp.scenario', { n: id })}</h2>
          <span className="shrink-0 text-sm text-muted">{t('camp.stage', { n: s.stage })}</span>
        </div>
        <p className="text-sm">
          {'★'.repeat(s.stars)}
          {'☆'.repeat(3 - s.stars)} {l(DIFFICULTIES[s.stars].name)}
          {s.expansions.length > 0 && ` · ${t('camp.adds', { list: s.expansions.map(expansionName).join(', ') })}`}
        </p>
        {!compact && card && (
          <div className="mt-3 rounded-xl border border-line bg-bg p-3">
            <div className="caps text-sm text-muted">{t('camp.mandatory')}</div>
            <div className="caps text-xl leading-tight">
              {card.id} · {card.name}
            </div>
            <p className="mt-1 text-sm leading-snug">{l(card.rule)}</p>
          </div>
        )}
        {!compact && (
          <ul className="mt-3 space-y-1 text-sm leading-snug">
            <li>{s.forbidden.length ? t('camp.forbidden', { list: s.forbidden.join(', ') }) : t('camp.noForbidden')}</li>
            <li>{s.next.length === 0 ? t('camp.final') : id === START_SCENARIO ? t('camp.nextFrom4') : t('camp.next', { list: s.next.join(', ') })}</li>
          </ul>
        )}
      </section>
    )
  }
}

type BannerProps = { campaign: Campaign; state: CampaignState; last: CampaignGame | undefined; onChoose: (next: number) => void }

/** Outcome of the last game: what advanced, what unlocked, and the choice of where to go next. */
function Banner({ campaign, state, last, onChoose }: BannerProps) {
  const { t } = useT()
  if (!last) return null
  const before = campaignState(campaign.games.slice(0, -1))
  const gains = ZONE_IDS.filter((z) => state.tracks[z] > before.tracks[z]).map((z) => `${t(`zone.${z}`)} +${state.tracks[z] - before.tracks[z]}`)
  const unlocked = ABILITIES.filter((a) => state.abilities[a.id] && !before.abilities[a.id]).map((a) => a.id)
  const numbers = { n: last.node, total: plain(last.total), target: last.target }

  return (
    <section className={`rounded-2xl p-4 ${last.won ? 'bg-park text-zone-ink' : 'bg-surface-2'}`} role="status">
      {state.status === 'won' && <h2 className="caps text-2xl">{t('camp.won', { rank: state.rank ?? '' })}</h2>}
      {state.status === 'lost' && <h2 className="caps text-2xl text-neg">{t('camp.lost')}</h2>}
      <p className="font-semibold">{t(last.won ? 'camp.lastWin' : 'camp.lastLoss', numbers)}</p>
      {gains.length > 0 && (
        <p className="text-sm">
          {t('camp.gain')}: {gains.join(' · ')}
        </p>
      )}
      {unlocked.length > 0 && <p className="text-sm font-semibold">{t('camp.unlocked', { list: unlocked.join(', ') })}</p>}
      {state.needsBeach && <p className="mt-1 text-sm">{t('camp.rematchShort')}</p>}
      {state.awaitingNext && (
        <div className="mt-3">
          <p className="caps text-lg">{t('camp.chooseNext')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.awaitingNext.map((n) => (
              <button key={n} type="button" className="caps h-11 rounded-xl bg-accent px-4 text-base text-accent-ink" onClick={() => onChoose(n)}>
                {t('camp.goTo', { n })} · {cardById(n)?.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
