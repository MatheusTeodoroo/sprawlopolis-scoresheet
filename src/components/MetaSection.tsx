import { useState } from 'react'
import { useT } from '../i18n'
import type { Draft } from '../types'

const field = 'h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 text-base text-ink placeholder:text-muted/70'
const MAX_PLAYERS = 4

type Props = {
  draft: Draft
  knownPlayers: string[]
  onChange: (patch: Partial<Draft>) => void
}

/** City name, date and who played. Competitive games always have exactly two players, one per side. */
export function MetaSection({ draft, knownPlayers, onChange }: Props) {
  const { t } = useT()
  const [name, setName] = useState('')
  const vs = draft.mode === 'competitive'

  const add = () => {
    const clean = name.trim()
    if (clean && !draft.players.includes(clean) && draft.players.length < MAX_PLAYERS) onChange({ players: [...draft.players, clean] })
    setName('')
  }
  const setSide = (i: 0 | 1, value: string) => {
    const players = [draft.players[0] ?? '', draft.players[1] ?? '']
    players[i] = value
    onChange({ players })
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <datalist id="known-players">
        {knownPlayers.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      <div className="grid grid-cols-[minmax(0,1fr)_10rem] gap-3">
        <label className="block min-w-0">
          <span className="caps text-sm text-muted">{t('meta.city')}</span>
          <input className={field} value={draft.cityName} placeholder={t('meta.cityPh')} onChange={(e) => onChange({ cityName: e.target.value })} />
        </label>
        <label className="block">
          <span className="caps text-sm text-muted">{t('meta.date')}</span>
          <input type="date" className={field} value={draft.date} onChange={(e) => onChange({ date: e.target.value })} />
        </label>
      </div>

      <div className="mt-3">
        <span className="caps text-sm text-muted">{t('meta.players')}</span>
        {vs ? (
          <div className="grid grid-cols-2 gap-3">
            {([0, 1] as const).map((i) => (
              <input
                key={i}
                className={field}
                list="known-players"
                aria-label={t(i === 0 ? 'vs.playerA' : 'vs.playerB')}
                placeholder={t(i === 0 ? 'vs.playerA' : 'vs.playerB')}
                value={draft.players[i] ?? ''}
                onChange={(e) => setSide(i, e.target.value)}
              />
            ))}
          </div>
        ) : (
          <>
            {draft.players.length > 0 && (
              <ul className="mb-2 flex flex-wrap gap-2">
                {draft.players.map((p) => (
                  <li key={p} className="flex items-center gap-1 rounded-full bg-surface-2 py-1 pl-3 pr-1 text-sm font-semibold">
                    {p}
                    <button
                      type="button"
                      aria-label={t('meta.remove', { name: p })}
                      className="flex size-7 items-center justify-center rounded-full text-lg text-muted"
                      onClick={() => onChange({ players: draft.players.filter((x) => x !== p) })}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {draft.players.length < MAX_PLAYERS && (
              <div className="flex gap-2">
                <input
                  className={field}
                  list="known-players"
                  aria-label={t('meta.playerPh')}
                  placeholder={t('meta.playerPh')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && add()}
                  onBlur={add}
                />
                <button type="button" className="h-11 shrink-0 rounded-lg bg-surface-2 px-4 text-sm font-semibold" onClick={add}>
                  {t('meta.addPlayer')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useT()
  return (
    <label className="mt-3 block">
      <span className="caps text-sm text-muted">{t('meta.notes')}</span>
      <textarea
        rows={2}
        className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-base text-ink placeholder:text-muted/70"
        placeholder={t('meta.notesPh')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
