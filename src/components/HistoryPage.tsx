import { useRef, useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import { cardById } from '../data/cards'
import { BEACH_CARDS, CONSTRUCTION_CARDS, EXPANSIONS } from '../data/expansions'
import { interstateById } from '../data/interstate'
import { plain, signed, useT } from '../i18n'
import { ZONE_IDS, blockScore, expansionScores, roadTax } from '../lib/scoring'
import { coopStats, vsStats } from '../lib/stats'
import { exportGames, mergeGames, parseImport, today } from '../lib/storage'
import type { CoopGame, ExpansionId, Game, VsGame } from '../types'

type Props = { games: Game[]; onChange: (games: Game[]) => void }

export function HistoryPage({ games, onChange }: Props) {
  const { t, lang } = useT()
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const coop = coopStats(games)
  const vs = vsStats(games)
  const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium' })

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportGames(games)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `sprawlopolis-${today()}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (file: File) => {
    try {
      const { games: merged, added } = mergeGames(games, parseImport(await file.text()))
      if (added === 0) return setMessage(t('hist.nothingNew'))
      if (!confirm(t('hist.confirmImport', { n: added }))) return
      onChange(merged)
      setMessage(t('hist.imported', { n: added }))
    } catch {
      setMessage(t('hist.importError'))
    }
  }

  return (
    <>
      {coop.played > 0 && (
        <StatRow
          title={t('hist.coop')}
          stats={[
            [t('stat.played'), String(coop.played)],
            [t('stat.winRate'), `${coop.winRate}%`],
            [t('stat.best'), plain(coop.best ?? 0)],
            [t('stat.margin'), signed(coop.bestMargin ?? 0)],
          ]}
        />
      )}
      {vs.played > 0 && (
        <StatRow
          title={t('hist.vs')}
          stats={[[t('stat.played'), String(vs.played)], ...vs.wins.map((w): [string, string] => [w.name, String(w.wins)]), [t('stat.ties'), String(vs.ties)]]}
        />
      )}

      {games.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{t('hist.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {games.map((g) => (
            <li key={g.id}>
              <details className="group rounded-2xl border border-line bg-surface">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <div className="caps truncate text-lg leading-tight">{g.cityName || formatDate(g.date)}</div>
                    <div className="truncate text-sm text-muted">
                      {[g.cityName ? formatDate(g.date) : null, g.players.join(g.mode === 'competitive' ? ' × ' : ', ')].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {g.mode === 'coop' ? (
                    <div className="text-right">
                      <div className={`caps text-2xl leading-none tabular-nums ${g.won ? 'text-pos' : 'text-neg'}`}>{plain(g.total)}</div>
                      <div className="text-xs text-muted">
                        {t(g.won ? 'hist.won' : 'hist.lost')} · {t('hist.target', { n: g.target })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="caps text-2xl leading-none tabular-nums">
                        {plain(g.scores[0])} × {plain(g.scores[1])}
                      </div>
                      <div className="text-xs text-muted">{g.winner === null ? t('vs.tie') : t('vs.wins', { name: g.players[g.winner] })}</div>
                    </div>
                  )}
                  <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>
                    ▾
                  </span>
                </summary>
                <div className="border-t border-line p-3 text-sm">
                  {g.mode === 'coop' ? <CoopDetail g={g} /> : <VsDetail g={g} />}
                  {g.notes && <p className="mt-2 whitespace-pre-wrap text-muted">{g.notes}</p>}
                  <button
                    type="button"
                    className="mt-3 h-10 rounded-lg border border-neg px-4 text-sm font-semibold text-neg"
                    onClick={() => confirm(t('hist.confirmDelete')) && onChange(games.filter((x) => x.id !== g.id))}
                  >
                    {t('hist.delete')}
                  </button>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-2xl border border-line bg-surface p-4">
        <p className="mb-3 text-sm text-muted">{t('hist.backupHint')}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-11 rounded-lg bg-surface-2 px-4 text-sm font-semibold disabled:opacity-40" disabled={games.length === 0} onClick={download}>
            {t('hist.export')}
          </button>
          <button type="button" className="h-11 rounded-lg bg-surface-2 px-4 text-sm font-semibold" onClick={() => fileRef.current?.click()}>
            {t('hist.import')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importFile(file)
              e.target.value = ''
            }}
          />
        </div>
        {message && (
          <p className="mt-2 text-sm font-semibold" role="status">
            {message}
          </p>
        )}
      </section>
    </>
  )
}

function StatRow({ title, stats }: { title: string; stats: [string, string][] }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="caps mb-2 text-lg text-muted">{title}</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dd className="caps text-3xl leading-none tabular-nums">{value}</dd>
            <dt className="truncate text-sm text-muted">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="shrink-0 font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

/** Name of the Beach / Construction Zone card that was in play, if that expansion has one. */
function variantName(g: CoopGame, id: ExpansionId): string | undefined {
  if (id === 'beaches') return BEACH_CARDS.find((c) => c.id === g.expansions.beaches?.card)?.name
  if (id === 'construction') return CONSTRUCTION_CARDS.find((c) => c.id === g.expansions.construction?.card)?.name
  return undefined
}

function CoopDetail({ g }: { g: CoopGame }) {
  const { t } = useT()
  const expansions = expansionScores(g.expansions, g.zones)
  const active = EXPANSIONS.filter((e) => e.id in g.expansions)
  return (
    <dl className="space-y-1">
      <Line label={t('diff.title')} value={t(`diff.${g.difficulty}`)} />
      {g.cards.map((id, i) => (
        <Line key={id} label={`${id} · ${cardById(id)?.name ?? '?'}`} value={signed(g.cardPoints[i])} />
      ))}
      <Line label={`${t('sum.blocks')} (${ZONE_IDS.map((z) => g.zones[z]).join(' / ')})`} value={signed(blockScore(g.zones, g.difficulty))} />
      <Line label={`${t('sum.roads')} (${g.roads})`} value={signed(roadTax(g.roads, g.difficulty, g.expansions))} />
      {active.map((e) => (
        <Line key={e.id} label={[e.name, variantName(g, e.id)].filter(Boolean).join(' · ')} value={e.id === 'interstate' ? '✓' : signed(expansions[e.id as ExpansionId] ?? 0)} />
      ))}
      {g.modifier !== 0 && <Line label={t('sum.modifier')} value={signed(g.modifier)} />}
      {g.achievements.length > 0 && (
        <div className="pt-1">
          <dt className="text-muted">{t('tab.achievements')}</dt>
          <dd className="font-semibold">{g.achievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name ?? id).join(', ')}</dd>
        </div>
      )}
    </dl>
  )
}

function VsDetail({ g }: { g: VsGame }) {
  const { t } = useT()
  const pair = (a: number, b: number) => `${plain(a)} × ${plain(b)}`
  const [a, b] = g.sides
  return (
    <dl className="space-y-1">
      <Line label={t('vs.interstate')} value={interstateById(g.interstateCard)?.name ?? g.interstateCard} />
      {ZONE_IDS.map((z) => (
        <Line key={z} label={t(`zone.${z}`)} value={pair(a.zones[z], b.zones[z])} />
      ))}
      <Line label={t('roads.count')} value={pair(a.roads, b.roads)} />
      {g.cards.map((id, i) => (
        <Line key={id} label={`${id} · ${cardById(id)?.name ?? '?'}`} value={pair(a.cardPoints[i], b.cardPoints[i])} />
      ))}
      {(a.modifier !== 0 || b.modifier !== 0) && <Line label={t('sum.modifier')} value={pair(a.modifier, b.modifier)} />}
    </dl>
  )
}
