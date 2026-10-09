import { useEffect, useState } from 'react'
import { CARDS, cardById } from '../data/cards'
import { useT } from '../i18n'
import { NumberStepper } from './ui'

type Props = {
  index: number
  value: number | null
  /** numbers already used by the other slots */
  taken: number[]
  onChange: (card: number | null) => void
  points?: number
  onPoints?: (n: number) => void
  /** the card cannot be changed (campaign: mandatory card of the scenario) */
  fixed?: boolean
  /** numbers that may not be picked here (campaign: forbidden in the scenario) */
  forbidden?: number[]
}

/** One scoring-card slot: type the printed number and the card's name and rule show up. */
export function CardSlot({ index, value, taken, onChange, points, onPoints, fixed = false, forbidden = [] }: Props) {
  const { t, l } = useT()
  const [text, setText] = useState('')
  const [error, setError] = useState<'invalid' | 'repeated' | 'forbidden' | null>(null)
  const card = cardById(value)

  const commit = (s: string, final: boolean) => {
    if (!s) return setError(null)
    const n = parseInt(s, 10)
    if (Number.isNaN(n) || n < 1 || n > CARDS.length) return setError('invalid')
    if (!final && s === '1') return setError(null) // may still become 10–18
    if (forbidden.includes(n)) return setError('forbidden')
    if (taken.includes(n)) return setError('repeated')
    setError(null)
    setText('')
    onChange(n)
  }

  // A lone "1" is ambiguous while typing, so accept it after a short pause.
  useEffect(() => {
    if (text !== '1') return
    const id = setTimeout(() => commit('1', true), 1200)
    return () => clearTimeout(id)
  })

  if (card) {
    return (
      <div className="rounded-xl border border-line bg-bg p-3">
        <div className="flex items-start gap-3">
          <span className="caps flex size-11 shrink-0 items-center justify-center rounded-full bg-goal text-2xl text-goal-ink">
            {card.id}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="caps text-xl leading-tight">{card.name}</h3>
              {!fixed && (
                <button type="button" className="shrink-0 text-sm font-semibold text-accent underline" onClick={() => onChange(null)}>
                  {t('cards.change')}
                </button>
              )}
            </div>
            <p className="mt-1 text-sm leading-snug text-ink">{l(card.rule)}</p>
          </div>
        </div>
        {onPoints && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold text-muted">{t('cards.points')}</span>
            <NumberStepper value={points ?? 0} onChange={onPoints} label={`${t('cards.points')} · ${card.name}`} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dashed border-line bg-bg p-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="numeric"
          aria-label={t('cards.numberLabel', { n: index + 1 })}
          aria-invalid={error !== null}
          placeholder="#"
          value={text}
          onChange={(e) => {
            const s = e.target.value.replace(/\D/g, '').slice(0, 2)
            setText(s)
            commit(s, s.length === 2)
          }}
          onKeyDown={(e) => e.key === 'Enter' && commit(text, true)}
          className="caps size-11 shrink-0 rounded-full border-2 border-line bg-surface text-center text-2xl"
        />
        <div className="min-w-0">
          <h3 className="caps text-lg leading-tight text-muted">{t('cards.slot', { n: index + 1 })}</h3>
          <p className={`text-sm ${error ? 'font-semibold text-neg' : 'text-muted'}`} role={error ? 'alert' : undefined}>
            {error ? t(`cards.${error}`) : t('cards.pick')}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5 sm:grid-cols-9">
        {CARDS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={taken.includes(c.id) || forbidden.includes(c.id)}
            title={c.name}
            onClick={() => commit(String(c.id), true)}
            className="caps h-10 rounded-lg bg-surface-2 text-lg text-ink active:bg-goal disabled:opacity-30"
          >
            {c.id}
          </button>
        ))}
      </div>
    </div>
  )
}
