import { useT } from '../i18n'
import { ZONE_IDS } from '../lib/scoring'
import type { ZoneId, Zones } from '../types'
import { NumberStepper } from './ui'

export const ZONE_BG: Record<ZoneId, string> = {
  residential: 'bg-res',
  commercial: 'bg-com',
  industrial: 'bg-ind',
  park: 'bg-park',
}

type Props = {
  zones: Zones
  onChange: (zones: Zones) => void
  /** dims every zone but this one (Hard mode scores a single zone) */
  only?: ZoneId | null
}

/** The four coloured boxes of the paper sheet: largest group of each zone. */
export function ZoneGrid({ zones, onChange, only = null }: Props) {
  const { t } = useT()
  return (
    <div className="grid grid-cols-2 gap-2">
      {ZONE_IDS.map((z) => (
        <div key={z} className={`rounded-xl p-2 transition-opacity ${ZONE_BG[z]} ${only && only !== z ? 'opacity-45' : ''}`}>
          <div className="caps mb-1 text-center text-base text-zone-ink">{t(`zone.${z}`)}</div>
          <div className="flex justify-center">
            <NumberStepper compact min={0} value={zones[z]} label={t(`zone.${z}`)} onChange={(n) => onChange({ ...zones, [z]: n })} />
          </div>
        </div>
      ))}
    </div>
  )
}
