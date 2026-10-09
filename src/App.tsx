import { useEffect, useState } from 'react'
import { AchievementsPage } from './components/AchievementsPage'
import { CampaignPage } from './components/campaign/CampaignPage'
import { CompetitiveSheet } from './components/CompetitiveSheet'
import { CoopSheet } from './components/CoopSheet'
import { HistoryPage } from './components/HistoryPage'
import { ConfirmProvider, useConfirm } from './components/confirm'
import { MetaSection } from './components/MetaSection'
import { Segmented } from './components/ui'
import { useLocalStorage, useTheme } from './hooks'
import { I18nProvider, useT } from './i18n'
import { KEYS, defaultSettings, emptyDraft, isCampaign, isGame } from './lib/storage'
import type { Campaign, Draft, Game, Settings } from './types'

type Tab = 'game' | 'campaign' | 'history' | 'achievements'

const reviveGames = (stored: unknown): Game[] => (Array.isArray(stored) ? stored.filter(isGame) : [])
const reviveCampaigns = (stored: unknown): Campaign[] => (Array.isArray(stored) ? stored.filter(isCampaign) : [])
const reviveSettings = (stored: unknown): Settings => ({ ...defaultSettings(), ...(stored as Partial<Settings>) })
// Fills in anything a draft saved by an older version of the app is missing.
const reviveDraft = (stored: unknown): Draft => {
  const base = emptyDraft()
  const s = stored as Partial<Draft>
  return { ...base, ...s, coop: { ...base.coop, ...s.coop }, vs: { ...base.vs, ...s.vs } }
}

export default function App() {
  const [settings, setSettings] = useLocalStorage(KEYS.settings, defaultSettings, reviveSettings)
  useTheme(settings.theme)
  useEffect(() => {
    document.documentElement.lang = settings.lang === 'pt' ? 'pt-BR' : 'en'
  }, [settings.lang])

  return (
    <I18nProvider lang={settings.lang}>
      <ConfirmProvider>
        <Shell settings={settings} setSettings={setSettings} />
      </ConfirmProvider>
    </I18nProvider>
  )
}

function Shell({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const { t } = useT()
  const ask = useConfirm()
  const [tab, setTab] = useState<Tab>('game')
  const [games, setGames] = useLocalStorage<Game[]>(KEYS.games, () => [], reviveGames)
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>(KEYS.campaigns, () => [], reviveCampaigns)
  const [draft, setDraft] = useLocalStorage<Draft>(KEYS.draft, emptyDraft, reviveDraft)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(id)
  }, [toast])

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const knownPlayers = [...new Set(games.flatMap((g) => g.players))].sort((a, b) => a.localeCompare(b))

  const saveGame = (game: Game) => {
    setGames((list) => [game, ...list])
    setDraft(emptyDraft({ mode: draft.mode, players: draft.players }))
    setToast(t('saved'))
    setTab('history')
    window.scrollTo({ top: 0 })
  }

  const themes: Settings['theme'][] = ['system', 'light', 'dark']
  const themeIcon = { system: '◐', light: '☀', dark: '☾' }[settings.theme]

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <header className="flex items-center justify-between gap-3 py-3">
        <h1 className="caps text-3xl leading-none">
          <span className="text-muted">Sprawl</span>
          <span className="text-accent">opolis</span>
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="caps h-10 rounded-lg bg-surface-2 px-3 text-base"
            aria-label={`${t('lang.label')}: ${settings.lang === 'pt' ? 'Português' : 'English'}`}
            onClick={() => setSettings({ ...settings, lang: settings.lang === 'pt' ? 'en' : 'pt' })}
          >
            {settings.lang === 'pt' ? 'PT' : 'EN'}
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-surface-2 px-3 text-lg"
            aria-label={`${t('theme.label')}: ${t(`theme.${settings.theme}`)}`}
            title={`${t('theme.label')}: ${t(`theme.${settings.theme}`)}`}
            onClick={() => setSettings({ ...settings, theme: themes[(themes.indexOf(settings.theme) + 1) % themes.length] })}
          >
            {themeIcon}
          </button>
        </div>
      </header>

      <nav className="sticky top-0 z-10 -mx-4 bg-bg px-4 pb-3 pt-1">
        <Segmented
          label="Navigation"
          value={tab}
          onChange={setTab}
          dense
          options={[
            { value: 'game', label: t('tab.game') },
            { value: 'campaign', label: t('tab.campaign') },
            { value: 'history', label: games.length ? `${t('tab.history')} (${games.length})` : t('tab.history') },
            { value: 'achievements', label: t('tab.achievements') },
          ]}
        />
      </nav>

      <main className="space-y-3">
        {tab === 'game' && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Segmented
                  label="Mode"
                  value={draft.mode}
                  onChange={(mode) => patch({ mode })}
                  options={[
                    { value: 'coop', label: t('mode.coop') },
                    { value: 'competitive', label: t('mode.vs') },
                  ]}
                />
              </div>
              <button
                type="button"
                className="h-12 shrink-0 rounded-xl border border-line px-3 text-sm font-semibold text-muted"
                onClick={async () => (await ask(t('confirm.new'))) && setDraft(emptyDraft({ mode: draft.mode, players: draft.players }))}
              >
                {t('new')}
              </button>
            </div>
            {draft.mode === 'competitive' && <p className="text-sm text-muted">{t('mode.vsHint')}</p>}

            <MetaSection draft={draft} knownPlayers={knownPlayers} onChange={patch} />

            {draft.mode === 'coop' ? (
              <CoopSheet
                draft={draft}
                onChange={(p) => setDraft((d) => ({ ...d, coop: { ...d.coop, ...p } }))}
                onNotes={(notes) => patch({ notes })}
                onSave={saveGame}
              />
            ) : (
              <CompetitiveSheet
                draft={draft}
                onChange={(p) => setDraft((d) => ({ ...d, vs: { ...d.vs, ...p } }))}
                onNotes={(notes) => patch({ notes })}
                onSave={saveGame}
              />
            )}
          </>
        )}
        {tab === 'campaign' && <CampaignPage campaigns={campaigns} onChange={setCampaigns} />}
        {tab === 'history' && <HistoryPage games={games} onChange={setGames} campaigns={campaigns} onCampaigns={setCampaigns} />}
        {tab === 'achievements' && <AchievementsPage games={games} />}
        <p className="pt-2 text-center text-xs text-muted">{t('disclaimer')}</p>
      </main>

      {toast && (
        <div className="fixed inset-x-0 top-4 z-30 flex justify-center px-4" role="status">
          <div className="caps rounded-full bg-ink px-5 py-2 text-lg text-bg shadow-lg">{toast}</div>
        </div>
      )}
    </div>
  )
}
