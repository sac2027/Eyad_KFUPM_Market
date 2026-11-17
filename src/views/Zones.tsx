import { ArrowRight, Footprints } from 'lucide-react'
import { useState } from 'react'
import { ListingCard } from '../components/listing/ListingCard'
import { Badge } from '../components/ui/Badge'
import { BELTS, type Belt, ZONES, walkMinutes, zoneById } from '../data/zones'
import { cn } from '../lib/cn'
import { useListings, useNow, useRequests } from '../lib/hooks'
import { useL, useT } from '../lib/i18n'
import { go } from '../lib/router'
import type { ZoneId } from '../lib/types'
import { usePersona } from '../store/useStore'
import { EmptyState, PageHeader } from './shared'

const BELT_FILL: Record<Belt, string> = { academic: '#115F66', housing: '#AA8C6D', hubs: '#009767' }

export function Zones() {
  const t = useT()
  const L = useL()
  const now = useNow()
  const me = usePersona()
  const listings = useListings()
  const requests = useRequests()
  const [sel, setSel] = useState<ZoneId>(me.home)
  const zone = zoneById(sel)

  const count = (id: ZoneId) => listings.filter((l) => l.zone === id && l.status === 'available').length
  const here = listings.filter((l) => l.zone === sel && l.status === 'available').sort((a, b) => b.createdAt - a.createdAt)
  const asks = requests.filter((r) => r.zone === sel && r.status === 'open')

  return (
    <>
      <PageHeader
        title={t('Meetup zones', 'أماكن التسليم')}
        lead={t('Every handover happens at a public spot on campus. Pick a zone to see what is waiting there and how far it is from your building.', 'كل تسليم يصير في مكان عام داخل الجامعة. اختر منطقة وشوف وش المعروض فيها وكم تبعد عن سكنك.')}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-label={t('Campus map', 'خريطة الجامعة')}>
          <div className="relative overflow-hidden rounded-card bg-beige">
            <svg viewBox="0 0 100 64" className="block w-full" role="group" aria-label={t('Schematic campus map, not to scale', 'خريطة تخطيطية للجامعة، ليست بمقياس حقيقي')}>
              {/* Hill band and housing band */}
              <path d="M8 26 C 24 2, 76 0, 92 22 L 92 28 C 70 24, 30 26, 8 30 Z" fill="#115F66" opacity="0.1" />
              <path d="M10 40 C 30 36, 74 36, 90 42 L 90 61 L 10 61 Z" fill="#AA8C6D" opacity="0.18" />
              <path d="M10 32 C 34 30, 70 31, 96 34" fill="none" stroke="#AA8C6D" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
              <text x="50" y="5.5" textAnchor="middle" fontSize="2.6" fontWeight="700" fill="#115F66" fontFamily="var(--font-sans)">
                {L(BELTS.academic)}
              </text>
              <text x="50" y="62.4" textAnchor="middle" fontSize="2.6" fontWeight="700" fill="#115F66" fontFamily="var(--font-sans)">
                {L(BELTS.housing)}
              </text>
              {/* Walking line from your building to the selected zone */}
              {sel !== me.home ? (
                <line x1={zoneById(me.home).x} y1={zoneById(me.home).y} x2={zone.x} y2={zone.y} stroke="#115F66" strokeWidth="0.5" strokeDasharray="1.4 1.2" />
              ) : null}
            </svg>
            {ZONES.map((z) => {
              const n = count(z.id)
              const on = z.id === sel
              const home = z.id === me.home
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSel(z.id)}
                  aria-pressed={on}
                  aria-label={t(`${L(z.name)}, ${n} available`, `${L(z.name)}، ${n} متاح`)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 p-1.5 focus-visible:outline-none"
                  style={{ left: `${z.x}%`, top: `${(z.y / 64) * 100}%` }}
                >
                  <span
                    className={cn(
                      'press tabular inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-[11.5px] font-semibold whitespace-nowrap ring-offset-2 ring-offset-beige group-focus-visible:ring-2 group-focus-visible:ring-green sm:px-2.5 sm:text-[12.5px]',
                      on ? 'bg-turquoise text-white' : 'bg-white text-turquoise group-hover:bg-turquoise group-hover:text-white',
                    )}
                  >
                    <span className="size-2 shrink-0 rounded-full" style={{ background: on ? '#F0BA4F' : BELT_FILL[z.belt] }} aria-hidden="true" />
                    <span className={cn(on ? '' : 'max-sm:sr-only')}>{L(z.short)}</span>
                    <span className={cn('opacity-80', on ? '' : 'sm:inline')}>{n}</span>
                    {home ? <span className="sr-only">{t('(your building)', '(سكنك)')}</span> : null}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-[12.5px] text-muted">{t('Schematic, not to scale. Numbers are listings available at each spot. Walking times are estimates.', 'خريطة تخطيطية وليست بمقياس حقيقي. الأرقام هي الإعلانات المتاحة في كل مكان. أوقات المشي تقديرية.')}</p>

          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-3">
            {(Object.keys(BELTS) as Belt[]).map((belt) => (
              <div key={belt}>
                <h2 className="mb-1.5 flex items-center gap-2 !font-sans text-[14px] font-bold tracking-normal text-turquoise">
                  <span className="size-2.5 rounded-full" style={{ background: BELT_FILL[belt] }} aria-hidden="true" />
                  {L(BELTS[belt])}
                </h2>
                <ul>
                  {ZONES.filter((z) => z.belt === belt).map((z) => (
                    <li key={z.id}>
                      <button
                        type="button"
                        onClick={() => setSel(z.id)}
                        aria-pressed={z.id === sel}
                        className={cn('press flex min-h-11 w-full items-center justify-between gap-2 rounded-control px-2.5 text-start text-[14px]', z.id === sel ? 'bg-wash-strong font-semibold text-turquoise' : 'hover:bg-wash')}
                      >
                        <span className="min-w-0 truncate">{L(z.short)}</span>
                        <span className="tabular shrink-0 text-[13px] text-muted">{count(z.id)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-live="polite" aria-labelledby="zone-title">
          <div className="rounded-card bg-wash p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="outline">{L(BELTS[zone.belt])}</Badge>
              {sel === me.home ? <Badge tone="yellow">{t('Your building', 'سكنك')}</Badge> : null}
            </div>
            <h2 id="zone-title" className="mt-2 text-[22px] font-bold text-turquoise [overflow-wrap:anywhere]">
              {L(zone.name)}
            </h2>
            <p className="mt-1 text-[14.5px] text-black/75">{L(zone.hint)}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-turquoise">
              <Footprints className="size-4" aria-hidden="true" />
              {t(`About ${walkMinutes(me.home, sel)} min walk from Bldg ${me.bldg}`, `حوالي ${walkMinutes(me.home, sel)} د مشي من مبنى ${me.bldg}`)}
            </p>
            {asks.length > 0 ? (
              <button type="button" onClick={() => go('requests')} className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-control bg-yellow px-3 text-start text-[14px] font-semibold text-black">
                <span>{t(`${asks.length} open ${asks.length === 1 ? 'request' : 'requests'} near here`, `${asks.length} طلب مفتوح قريب من هنا`)}</span>
                <ArrowRight className="size-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <h3 className="mt-5 mb-3 text-[17px] font-bold text-turquoise">{t(`Available here (${here.length})`, `المتاح هنا (${here.length})`)}</h3>
          {here.length === 0 ? (
            <EmptyState title={t('Nothing waiting here', 'ما فيه شي هنا الحين')} body={t('Try the Student Mall or Bldg 59. Most handovers happen there.', 'جرّب المول الطلابي أو مبنى 59. أغلب التسليم يصير هناك.')} />
          ) : (
            <div className="stagger grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {here.slice(0, 9).map((l, i) => (
                <ListingCard key={l.id} listing={l} now={now} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
