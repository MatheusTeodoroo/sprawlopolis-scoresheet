import { useEffect, useState, type ReactNode } from 'react'
import { signed } from '../i18n'

export function Section({ title, aside, hint, children }: { title: string; aside?: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="caps text-lg leading-tight text-muted">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Segmented<V extends string>({
  value,
  options,
  onChange,
  label,
  dense = false,
}: {
  value: V
  options: { value: V; label: string }[]
  onChange: (v: V) => void
  label: string
  /** tighter padding, for four options on a phone */
  dense?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 flex-1 rounded-lg font-semibold transition-colors ${dense ? 'px-1 text-[13px]' : 'px-3 text-sm'} ${
            o.value === value ? 'bg-surface text-ink shadow-sm' : 'text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Pill that toggles on and off (expansions, yes/no answers, checklists). */
export function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
        on ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/** Signed score, red when negative. */
export function Points({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`caps tabular-nums ${value < 0 ? 'text-neg' : 'text-ink'} ${className}`}>{signed(value)}</span>
  )
}

/** −/+ buttons around a field that can also be typed into. Negative values need `min` left undefined. */
export function NumberStepper({
  value,
  onChange,
  min,
  label,
  compact = false,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  label: string
  compact?: boolean
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => {
    setText((prev) => (parseInt(prev, 10) === value ? prev : String(value)))
  }, [value])

  const clamp = (n: number) => (min !== undefined ? Math.max(min, n) : n)
  const btn = `flex shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xl font-bold text-ink active:bg-line disabled:opacity-40 ${
    compact ? 'size-9' : 'size-11'
  }`

  return (
    <div className="flex items-center gap-1">
      <button type="button" className={btn} aria-label={`${label} −1`} disabled={min !== undefined && value <= min} onClick={() => onChange(clamp(value - 1))}>
        −
      </button>
      <input
        type="text"
        inputMode={min !== undefined && min >= 0 ? 'numeric' : 'text'}
        aria-label={label}
        value={text}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const s = e.target.value.replace('−', '-').replace(/(?!^-)[^\d]/g, '')
          setText(s)
          const n = parseInt(s, 10)
          if (!Number.isNaN(n)) onChange(clamp(n))
        }}
        onBlur={() => setText(String(value))}
        className={`caps min-w-0 rounded-lg border border-line bg-bg text-center text-xl tabular-nums ${
          compact ? 'h-9 w-11' : 'h-11 w-14'
        } ${value < 0 ? 'text-neg' : 'text-ink'}`}
      />
      <button type="button" className={btn} aria-label={`${label} +1`} onClick={() => onChange(clamp(value + 1))}>
        +
      </button>
    </div>
  )
}
