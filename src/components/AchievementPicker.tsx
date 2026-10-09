import { useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import { useT } from '../i18n'

type Props = { suggested: string[]; onConfirm: (ids: string[]) => void; onCancel: () => void }

/** Shown when saving a win: tick the achievements earned in this game. */
export function AchievementPicker({ suggested, onConfirm, onCancel }: Props) {
  const { t, l } = useT()
  const [picked, setPicked] = useState<string[]>(suggested)
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ach-title">
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-2xl bg-surface sm:rounded-2xl">
        <div className="border-b border-line p-4">
          <h2 id="ach-title" className="caps text-2xl">
            {t('ach.pickTitle')}
          </h2>
          <p className="text-sm text-muted">{t('ach.pickHint')}</p>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {ACHIEVEMENTS.map((a) => (
            <li key={a.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 has-[:checked]:bg-surface-2">
                <input type="checkbox" className="mt-1 size-5 accent-[var(--accent)]" checked={picked.includes(a.id)} onChange={() => toggle(a.id)} />
                <span>
                  <span className="caps block text-lg leading-tight">{a.name}</span>
                  <span className="text-sm text-muted">{l(a.goal)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="flex gap-3 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" className="h-12 flex-1 rounded-xl bg-surface-2 font-semibold" onClick={onCancel}>
            {t('cancel')}
          </button>
          <button type="button" className="caps h-12 flex-1 rounded-xl bg-accent text-lg text-accent-ink" onClick={() => onConfirm(picked)}>
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
