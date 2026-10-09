import { ACHIEVEMENTS } from '../data/achievements'
import { useT } from '../i18n'
import { achievementCounts } from '../lib/achievements'
import type { Game } from '../types'

export function AchievementsPage({ games }: { games: Game[] }) {
  const { t, l } = useT()
  const counts = achievementCounts(games)
  const unlocked = ACHIEVEMENTS.filter((a) => counts[a.id]).length

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="caps text-2xl">{t('ach.unlocked', { n: unlocked, total: ACHIEVEMENTS.length })}</h2>
      <p className="mb-3 text-sm text-muted">{t('ach.requires')}</p>
      <ul className="space-y-2">
        {ACHIEVEMENTS.map((a) => {
          const n = counts[a.id] ?? 0
          return (
            <li key={a.id} className={`flex items-center gap-3 rounded-xl border border-line p-3 ${n ? 'bg-bg' : 'opacity-60'}`}>
              <span
                className={`caps flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-muted text-lg ${n ? 'bg-goal text-goal-ink' : 'bg-surface-2 text-muted'}`}
                aria-hidden
              >
                {n ? '✓' : ''}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="caps text-lg leading-tight">{a.name}</h3>
                <p className="text-sm text-muted">{l(a.goal)}</p>
              </div>
              {n > 1 && <span className="caps text-lg text-muted">{n}×</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
