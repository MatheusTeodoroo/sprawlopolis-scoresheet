import { ABILITIES } from '../../data/campaign'
import { CAMPAIGN_INTRO, CAMPAIGN_RULES, CREDITS } from '../../data/campaignRules'
import { useT } from '../../i18n'

/** Everything needed to play the campaign without the original document. */
export function CampaignRules() {
  const { t, l } = useT()
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="caps text-2xl">{t('camp.title')}</h2>
        <p className="mt-1 leading-relaxed">{l(CAMPAIGN_INTRO)}</p>
      </section>

      {CAMPAIGN_RULES.map((s) => (
        <section key={s.title.en} className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="caps text-lg text-muted">{l(s.title)}</h3>
          {s.body.map((p) => (
            <p key={p.en} className="mt-2 leading-relaxed">
              {l(p)}
            </p>
          ))}
          {s.list && (
            <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
              {s.list.map((item) => (
                <li key={item.en}>{l(item)}</li>
              ))}
            </ul>
          )}
          {s.note && <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm leading-relaxed">{l(s.note)}</p>}
        </section>
      ))}

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="caps text-lg text-muted">{t('camp.abilities')}</h3>
        <dl className="mt-2 space-y-2">
          {ABILITIES.map((a) => (
            <div key={a.id} className="flex gap-3">
              <dt className="caps w-9 shrink-0 text-lg">{a.id}</dt>
              <dd className="leading-snug">
                <span className="text-sm text-muted">
                  {a.zone ? `${t(`zone.${a.zone}`)} · ${t('camp.atSpace', { n: a.space })}` : t('camp.atSpace', { n: a.space })}
                </span>
                <br />
                {l(a.text)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="caps text-lg text-muted">{t('camp.credits')}</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {CREDITS.map((c) => (
            <div key={c.title.en}>
              <h4 className="caps text-lg">{l(c.title)}</h4>
              <ul className="text-sm leading-relaxed">
                {c.lines.map((line) => (
                  <li key={line.en}>{l(line)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{t('disclaimer')}</p>
      </section>
    </div>
  )
}
