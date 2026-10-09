import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useT } from '../i18n'

type Ask = (message: string) => Promise<boolean>
const ConfirmContext = createContext<Ask>(() => Promise.resolve(false))

/** In-app replacement for window.confirm, which embedded browsers and installed PWAs may silently block. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useT()
  const [pending, setPending] = useState<{ message: string; resolve: (ok: boolean) => void } | null>(null)

  const ask = useCallback<Ask>((message) => new Promise((resolve) => setPending({ message, resolve })), [])
  const answer = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" role="alertdialog" aria-modal="true" aria-describedby="confirm-message">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-4">
            <p id="confirm-message" className="text-base">
              {pending.message}
            </p>
            <div className="mt-4 flex gap-3">
              <button type="button" className="h-12 flex-1 rounded-xl bg-surface-2 font-semibold" onClick={() => answer(false)}>
                {t('cancel')}
              </button>
              <button type="button" autoFocus className="caps h-12 flex-1 rounded-xl bg-accent text-lg text-accent-ink" onClick={() => answer(true)}>
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
