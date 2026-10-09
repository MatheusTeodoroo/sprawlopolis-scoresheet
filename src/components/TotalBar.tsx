import type { ReactNode } from 'react'
import { useT } from '../i18n'

type Props = {
  children: ReactNode
  status: string
  tone: 'win' | 'lose' | 'neutral'
  canSave: boolean
  onSave: () => void
}

/** Sticky footer with the running result and the save button. */
export function TotalBar({ children, status, tone, canSave, onSave }: Props) {
  const { t } = useT()
  const toneClass = tone === 'win' ? 'text-pos' : tone === 'lose' ? 'text-neg' : 'text-muted'
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">{children}</div>
          <p className={`truncate text-sm font-semibold ${toneClass}`} aria-live="polite">
            {status}
          </p>
        </div>
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className="caps h-12 shrink-0 rounded-xl bg-accent px-5 text-lg text-accent-ink disabled:opacity-40"
        >
          {t('save')}
        </button>
      </div>
    </div>
  )
}
