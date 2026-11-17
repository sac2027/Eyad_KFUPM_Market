import { AlarmClock, CalendarClock, MessageCircle, PackageCheck, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PAYMENTS } from '../../data/categories'
import { zoneById } from '../../data/zones'
import { cn } from '../../lib/cn'
import { dayTime, duration, sar } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { openListing } from '../../lib/router'
import type { Deal, Listing } from '../../lib/types'
import { dealMessage, waLink } from '../../lib/whatsapp'
import { usePersona, useStore, useUser } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Art } from '../brand/Art'
import { Badge } from '../ui/Badge'
import { Button, buttonClass } from '../ui/Button'
import { Sheet } from '../ui/Overlay'
import { Segmented } from '../ui/Segmented'
import { StatusSteps, Verified } from '../listing/parts'

const HOUR = 3_600_000

/** Live return countdown. Ticks every second while the drawer is open. */
function Countdown({ deal, lateFee }: { deal: Deal; lateFee: number }) {
  const t = useT()
  const lang = useLang()
  const now = useNow(1000)
  if (deal.returnAt == null) return null
  const left = deal.returnAt - now
  const late = left < 0
  const soon = !late && left < HOUR
  const abs = Math.abs(left)
  const h = Math.floor(abs / HOUR)
  const m = Math.floor((abs % HOUR) / 60_000)
  const s = Math.floor((abs % 60_000) / 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  const span = Math.max(1, deal.returnAt - deal.meetAt)
  const used = Math.min(1, Math.max(0, (now - deal.meetAt) / span))
  const fee = late ? Math.ceil(abs / HOUR) * lateFee : 0
  return (
    <div className={cn('mt-3 rounded-control p-3', late ? 'bg-error/15' : soon ? 'bg-yellow/40' : 'bg-white')}>
      <div className="flex items-end justify-between gap-3">
        <p className={cn('flex items-center gap-1.5 text-[13px] font-semibold', late ? 'text-danger-ink' : 'text-turquoise')}>
          <AlarmClock className="size-4" aria-hidden="true" />
          {late ? t('Overdue by', 'متأخر بـ') : t('Return in', 'الإرجاع بعد')}
        </p>
        <p className={cn('tabular font-display text-[26px] leading-none font-bold', late ? 'text-danger-ink' : 'text-turquoise')} dir="ltr" role="timer" aria-label={duration(abs, lang)}>
          {h > 0 ? `${h}:` : ''}
          {p(m)}:{p(s)}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10" aria-hidden="true">
        <div className={cn('h-full w-full origin-left rounded-full rtl:origin-right', late ? 'bg-error' : 'bg-green')} style={{ transform: `scaleX(${late ? 1 : used})` }} />
      </div>
      <p className="mt-2 text-[12.5px] text-black/70">
        {late
          ? t(`Late fee so far: ${sar(fee, lang)}. Return it and settle with the owner.`, `غرامة التأخير للحين: ${sar(fee, lang)}. رجّعه وتحاسب مع المالك.`)
          : t(`Due ${dayTime(deal.returnAt, lang, now)} at ${zoneById(deal.zone).short.en}.`, `الموعد ${dayTime(deal.returnAt, lang, now)} عند ${zoneById(deal.zone).short.ar}.`)}
      </p>
    </div>
  )
}

function DealCard({ deal, listing }: { deal: Deal; listing: Listing | undefined }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const iAmSeller = deal.sellerId === me.id
  const other = useUser(iAmSeller ? deal.buyerId : deal.sellerId)
  const buyer = useUser(deal.buyerId)
  const confirmHandover = useStore((s) => s.confirmHandover)
  const markReturned = useStore((s) => s.markReturned)
  const cancelDeal = useStore((s) => s.cancelDeal)
  const setDeals = useUi((s) => s.setDeals)
  const active = deal.status === 'reserved' || deal.status === 'rented'
  const title = listing ? L(listing.title) : t('Removed listing', 'إعلان محذوف')
  const status = deal.status === 'cancelled' ? 'available' : deal.status
  const fee = deal.total - deal.deposit

  return (
    <li className={cn('rounded-card p-4', active ? 'bg-wash' : 'bg-black/[0.03]')}>
      <div className="flex gap-3">
        <Art id={deal.listingId} icon={listing?.icon ?? 'Package'} tone={listing?.tone ?? 'beige'} photo={listing?.photo} alt="" className="size-16 shrink-0 rounded-control" iconClassName="!size-7" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={iAmSeller ? 'turquoise' : 'outline'}>{iAmSeller ? (deal.type === 'rent' ? t('You are lending', 'أنت المؤجّر') : t('You are selling', 'أنت البائع')) : deal.type === 'rent' ? t('You are renting', 'أنت المستأجر') : t('You are buying', 'أنت المشتري')}</Badge>
            {deal.status === 'cancelled' ? <Badge tone="error">{t('Cancelled', 'ملغي')}</Badge> : null}
          </div>
          <button type="button" disabled={!listing} onClick={() => { setDeals(false); if (listing) openListing(listing.id) }} className="mt-1 line-clamp-2 text-start text-[15px] leading-snug font-semibold text-black underline-offset-4 hover:underline [overflow-wrap:anywhere]">
            {title}
          </button>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
            {iAmSeller ? t('With', 'مع') : t('From', 'من')} <Verified user={other} />
          </p>
        </div>
      </div>

      {deal.status !== 'cancelled' ? (
        <div className="mt-3">
          <StatusSteps status={status} rental={deal.type === 'rent'} />
        </div>
      ) : null}

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13.5px]">
        <dt className="text-muted">{deal.type === 'rent' ? t('Pickup', 'الاستلام') : t('Meetup', 'الموعد')}</dt>
        <dd>{dayTime(deal.meetAt, lang)}</dd>
        <dt className="text-muted">{t('Where', 'المكان')}</dt>
        <dd className="[overflow-wrap:anywhere]">{L(zoneById(deal.zone).name)}</dd>
        <dt className="text-muted">{t('Settle', 'الحساب')}</dt>
        <dd className="tabular [overflow-wrap:anywhere]">
          {deal.total === 0 ? t('Free', 'لوجه الله') : deal.deposit > 0 ? t(`${sar(fee, lang)} + ${sar(deal.deposit, lang)} deposit`, `${sar(fee, lang)} + تأمين ${sar(deal.deposit, lang)}`) : sar(deal.total, lang)}
          {deal.total > 0 ? ` · ${L(PAYMENTS[deal.payment])}` : ''}
        </dd>
      </dl>

      {deal.status === 'rented' ? <Countdown deal={deal} lateFee={listing?.rent?.lateFeePerHour ?? 0} /> : null}

      {active ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {deal.status === 'reserved' ? (
            <Button
              size="sm"
              className="!min-h-11"
              onClick={() => {
                confirmHandover(deal.id)
                toast.success(deal.type === 'rent' ? t('Handover confirmed. The countdown has started.', 'تم تأكيد التسليم. بدأ العدّاد.') : t('Deal completed', 'تمت الصفقة'))
              }}
            >
              <PackageCheck className="size-4" aria-hidden="true" />
              {deal.type === 'rent' ? t('Confirm handover', 'أكّد التسليم') : t('Mark as completed', 'تمت الصفقة')}
            </Button>
          ) : (
            <Button
              size="sm"
              className="!min-h-11"
              onClick={() => {
                markReturned(deal.id)
                toast.success(t('Returned', 'تم الإرجاع'), { description: deal.deposit > 0 ? t(`Hand back the ${sar(deal.deposit, lang)} deposit.`, `رجّع التأمين ${sar(deal.deposit, lang)}.`) : undefined })
              }}
            >
              <Undo2 className="size-4" aria-hidden="true" />
              {t('Mark as returned', 'تم الإرجاع')}
            </Button>
          )}
          {other && listing && buyer ? (
            <a href={waLink(other, dealMessage(listing, deal, buyer, lang))} target="_blank" rel="noreferrer" className={buttonClass('whatsapp', 'sm', '!min-h-11')}>
              <MessageCircle className="size-4 text-green" aria-hidden="true" />
              {t('WhatsApp', 'واتساب')}
            </a>
          ) : null}
          {deal.status === 'reserved' ? (
            <Button
              size="sm"
              variant="ghost"
              className="!min-h-11"
              onClick={() => {
                cancelDeal(deal.id)
                toast(t('Reservation cancelled', 'تم إلغاء الحجز'), { description: t('The item is available again.', 'رجع الغرض متاح.') })
              }}
            >
              {t('Cancel', 'إلغاء')}
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function DealDrawer() {
  const t = useT()
  const L = useL()
  const open = useUi((s) => s.deals)
  const setDeals = useUi((s) => s.setDeals)
  const openStudio = useUi((s) => s.openStudio)
  const me = usePersona()
  const deals = useStore((s) => s.deals)
  const listings = useStore((s) => s.listings)
  const [tab, setTab] = useState<'active' | 'mine' | 'history'>('active')

  const mine = deals.filter((d) => d.buyerId === me.id || d.sellerId === me.id)
  const active = mine
    .filter((d) => d.status === 'reserved' || d.status === 'rented')
    // Rentals due soonest first, then upcoming meetups.
    .sort((a, b) => (a.status === 'rented' ? (a.returnAt ?? 0) : a.meetAt + 1e13) - (b.status === 'rented' ? (b.returnAt ?? 0) : b.meetAt + 1e13))
  const history = mine.filter((d) => d.status === 'completed' || d.status === 'cancelled').sort((a, b) => b.createdAt - a.createdAt)
  const myListings = listings.filter((l) => l.sellerId === me.id)
  const incoming = active.filter((d) => d.sellerId === me.id && d.status === 'reserved').length
  const list = tab === 'active' ? active : history

  return (
    <Sheet open={open} onOpenChange={setDeals} title={t('My deals', 'صفقاتي')} description={incoming > 0 ? t(`${incoming} ${incoming === 1 ? 'student is' : 'students are'} waiting for you to confirm a meetup.`, `${incoming} طالب ينتظر تأكيدك للموعد.`) : t('Meetups, rentals and your own listings.', 'المواعيد والإيجارات وإعلاناتك.')}>
      <div className="px-5 py-4 sm:px-6">
        <Segmented
          label={t('Show', 'اعرض')}
          fill
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: t(`Active (${active.length})`, `نشطة (${active.length})`) },
            { value: 'mine', label: t(`My listings (${myListings.length})`, `إعلاناتي (${myListings.length})`) },
            { value: 'history', label: t('History', 'السجل') },
          ]}
        />

        {tab === 'mine' ? (
          myListings.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-muted">{t('You have nothing listed.', 'ما عندك إعلانات.')}</p>
              <Button className="mt-3" onClick={() => { setDeals(false); openStudio('sale') }}>
                {t('List something', 'اعرض غرضك')}
              </Button>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {myListings.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => { setDeals(false); openListing(l.id) }} className="press flex w-full items-center gap-3 rounded-card bg-wash p-3 text-start hover:bg-wash-strong">
                    <Art id={l.id} icon={l.icon} tone={l.tone} photo={l.photo} alt="" className="size-12 shrink-0 rounded-control" iconClassName="!size-6" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[14.5px] font-semibold [overflow-wrap:anywhere]">{L(l.title)}</span>
                      <span className="tabular text-[13px] text-muted">{l.price === 0 ? t('Free', 'لوجه الله') : <SarText n={l.price} />}</span>
                    </span>
                    <Badge tone={l.status === 'available' ? 'green' : l.status === 'reserved' ? 'yellow' : l.status === 'rented' ? 'blue' : 'neutral'}>
                      {l.status === 'available' ? t('Available', 'متاح') : l.status === 'reserved' ? t('Reserved', 'محجوز') : l.status === 'rented' ? t('Out on rent', 'مؤجَّر') : t('Completed', 'تم')}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : list.length === 0 ? (
          <div className="mt-8 flex flex-col items-center text-center">
            <CalendarClock className="size-10 text-turquoise/50" aria-hidden="true" />
            <p className="mt-2 font-semibold text-turquoise">{tab === 'active' ? t('No meetups scheduled', 'ما فيه مواعيد') : t('No past deals yet', 'ما فيه صفقات سابقة')}</p>
            <p className="mt-1 max-w-[36ch] text-[14px] text-muted">{t('Reserve an item and it shows up here with the time, the spot and a WhatsApp link.', 'احجز غرض ويطلع لك هنا بالوقت والمكان ورابط الواتساب.')}</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {list.map((d) => (
              <DealCard key={d.id} deal={d} listing={listings.find((l) => l.id === d.listingId)} />
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  )
}

function SarText({ n }: { n: number }) {
  const lang = useLang()
  return <>{sar(n, lang)}</>
}
