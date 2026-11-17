import { MessageCircle, Repeat, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RATE_UNITS, categoryName } from '../../data/categories'
import { zoneById } from '../../data/zones'
import { ago, sar } from '../../lib/format'
import { useListings, useNow } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { closeListing } from '../../lib/router'
import type { Listing, RateUnit } from '../../lib/types'
import { waLink } from '../../lib/whatsapp'
import { usePersona, useStore, useUser } from '../../store/useStore'
import { Art } from '../brand/Art'
import { Badge } from '../ui/Badge'
import { Button, buttonClass } from '../ui/Button'
import { Sheet } from '../ui/Overlay'
import { GroupBuyPanel } from './GroupBuyPanel'
import { ReservePanel, ReservedSummary } from './ReservePanel'
import { SellerCard } from './SellerCard'
import { ConditionLabel, CourseTag, FavButton, InstantBadge, KindBadge, PaymentBadges, Price, StatusBadge, StatusSteps, bundleTotal } from './parts'

const RATE_ORDER: RateUnit[] = ['exam', 'hour', 'day', 'weekend', 'week']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[15px] font-bold text-turquoise">{title}</h3>
      {children}
    </section>
  )
}

function Body({ listing }: { listing: Listing }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow(30_000)
  const me = usePersona()
  const seller = useUser(listing.sellerId)
  const removeListing = useStore((s) => s.removeListing)
  const addListing = useStore((s) => s.addListing)
  const myDeal = useStore((s) => s.deals.find((d) => d.listingId === listing.id && d.buyerId === s.personaId && (d.status === 'reserved' || d.status === 'rented')))
  const mine = listing.sellerId === me.id
  const isWorst = listing.id.startsWith('worst-')
  const desc = L(listing.desc)
  const zone = zoneById(listing.zone)
  const sum = bundleTotal(listing)

  return (
    <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
      <div className="relative">
        <Art id={listing.id} icon={listing.icon} tone={listing.tone} photo={listing.photo} alt={listing.photo ? L(listing.title) : t('No photo yet', 'ما فيه صورة')} className="aspect-[16/9] w-full rounded-card sm:aspect-[5/2]" iconClassName="size-20" />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-1.5 pe-12">
          <KindBadge listing={listing} />
          <StatusBadge status={listing.status} />
          {listing.instant && listing.status === 'available' ? <InstantBadge /> : null}
          {listing.passItOn ? <Badge tone="beige">{t('Pass-It-On box', 'صندوق الخريجين')}</Badge> : null}
        </div>
        <FavButton id={listing.id} className="absolute end-1 top-1" />
      </div>

      <div>
        <Price listing={listing} size="lg" />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px] text-muted">
          {listing.course ? <CourseTag course={listing.course} /> : null}
          <span>{L(categoryName(listing.category))}</span>
          {listing.kind === 'service' || listing.kind === 'groupbuy' ? null : (
            <span>
              <ConditionLabel listing={listing} />
            </span>
          )}
          <span>{t(`Posted ${ago(listing.createdAt, lang, now)}`, `نُشر ${ago(listing.createdAt, lang, now)}`)}</span>
        </div>
      </div>

      {listing.kind !== 'groupbuy' ? <StatusSteps status={listing.status} rental={listing.kind === 'rent'} /> : null}

      {L(listing.title).length > 90 ? <p className="text-[15px] font-semibold [overflow-wrap:anywhere]">{L(listing.title)}</p> : null}

      {desc ? <p className="max-w-[62ch] text-[15px] whitespace-pre-line [overflow-wrap:anywhere]">{desc}</p> : null}

      {listing.service?.barterFor ? (
        <p className="flex items-start gap-2 rounded-card bg-wash p-3 text-[14px]">
          <Repeat className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
          <span>
            {t('Open to a swap for: ', 'يقبل المقايضة مقابل: ')}
            <strong className="font-semibold text-turquoise">{L(listing.service.barterFor)}</strong>
          </span>
        </p>
      ) : null}

      {listing.rent ? (
        <Section title={t('Rates and terms', 'الأسعار والشروط')}>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {RATE_ORDER.filter((u) => listing.rent?.rates[u] != null).map((u) => (
              <div key={u} className="rounded-control bg-wash px-3 py-2">
                <dt className="text-[12.5px] text-muted">{L(RATE_UNITS[u].per)}</dt>
                <dd className="tabular font-semibold text-turquoise [overflow-wrap:anywhere]">{sar(listing.rent?.rates[u] ?? 0, lang)}</dd>
              </div>
            ))}
            <div className="rounded-control bg-wash px-3 py-2">
              <dt className="text-[12.5px] text-muted">{t('Refundable deposit', 'تأمين مسترد')}</dt>
              <dd className="tabular font-semibold text-turquoise [overflow-wrap:anywhere]">{sar(listing.rent.deposit, lang)}</dd>
            </div>
            <div className="rounded-control bg-wash px-3 py-2">
              <dt className="text-[12.5px] text-muted">{t('Late return', 'التأخير')}</dt>
              <dd className="tabular font-semibold text-turquoise [overflow-wrap:anywhere]">{t(`${sar(listing.rent.lateFeePerHour, lang)} per hour`, `${sar(listing.rent.lateFeePerHour, lang)} للساعة`)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[14px] text-muted [overflow-wrap:anywhere]">{L(listing.rent.terms)}</p>
        </Section>
      ) : null}

      {listing.bundle ? (
        <Section title={t(`What’s in the bundle (${listing.bundle.items.length})`, `محتويات الباقة (${listing.bundle.items.length})`)}>
          <ul className="divide-y divide-line rounded-card bg-wash">
            {listing.bundle.items.map((it, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 px-3 py-2.5 text-[14px]">
                <span className="min-w-0 [overflow-wrap:anywhere]">{L(it.name)}</span>
                <span className="tabular shrink-0 text-muted">{it.price === 0 ? t('Free', 'مجانًا') : sar(it.price, lang)}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 px-3 py-2.5 text-[14px] font-semibold text-turquoise">
              <span>{t('Bought one by one', 'لو تشتريها قطعة قطعة')}</span>
              <span className="tabular shrink-0">{sar(sum, lang)}</span>
            </li>
          </ul>
          {seller && !mine ? (
            <a
              href={waLink(seller, lang === 'ar' ? `السلام عليكم، أبغى أسأل عن قطعة وحدة من: ${L(listing.title)}` : `Salam, can I ask about a single item from: ${L(listing.title)}`)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-turquoise underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t('Ask about a single item', 'اسأل عن قطعة وحدة')}
            </a>
          ) : null}
        </Section>
      ) : null}

      {listing.specs && listing.specs.length > 0 ? (
        <Section title={t('Specs', 'المواصفات')}>
          <dl className="divide-y divide-line rounded-card bg-wash text-[14px]">
            {listing.specs.map((s) => (
              <div key={s.k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 px-3 py-2.5">
                <dt className="text-muted">{s.k}</dt>
                <dd dir="ltr" className="text-start [overflow-wrap:anywhere]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      <Section title={t('Meetup and settlement', 'التسليم والدفع')}>
        <p className="text-[14px] [overflow-wrap:anywhere]">
          <strong className="font-semibold text-turquoise">{L(zone.name)}</strong>
          <span className="text-muted"> · {L(zone.hint)}</span>
        </p>
        <div className="mt-2">
          <PaymentBadges methods={listing.payment} />
        </div>
      </Section>

      <SellerCard user={seller} role={listing.kind === 'groupbuy' ? t('Organizer', 'المنظّم') : listing.kind === 'rent' ? t('Owner', 'المالك') : listing.kind === 'service' ? t('Offered by', 'يقدّمها') : t('Seller', 'البائع')} />

      {listing.kind === 'groupbuy' ? (
        <GroupBuyPanel listing={listing} />
      ) : mine ? (
        <div className="rounded-card bg-wash p-4">
          <p className="font-semibold text-turquoise">{t('This is your listing.', 'هذا إعلانك.')}</p>
          <p className="mt-1 text-[14px] text-muted">
            {listing.status === 'available'
              ? t('Students see it now. Reservations show up in your deals.', 'ظاهر للطلاب الحين. الحجوزات تطلع في صفقاتك.')
              : t('Manage the handover from your deals.', 'تابع التسليم من صفقاتك.')}
          </p>
          {listing.status === 'available' ? (
            <Button
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={() => {
                removeListing(listing.id)
                closeListing()
                toast(t('Listing removed', 'تم حذف الإعلان'), { action: { label: t('Undo', 'تراجع'), onClick: () => addListing(listing) }, duration: 8000 })
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t('Remove listing', 'احذف الإعلان')}
            </Button>
          ) : null}
        </div>
      ) : isWorst ? (
        <p className="rounded-card bg-wash p-4 text-[14px] text-muted">{t('Stress-test row. It cannot be reserved.', 'صف اختبار. ما ينحجز.')}</p>
      ) : myDeal ? (
        <ReservedSummary listing={listing} deal={myDeal} />
      ) : listing.status === 'available' ? (
        <Section title={listing.kind === 'rent' ? t('Pick your rental window', 'اختر مدة الإيجار') : t('Request a meetup', 'اطلب موعد تسليم')}>
          <ReservePanel key={listing.id} listing={listing} />
        </Section>
      ) : (
        <div className="rounded-card bg-wash p-4">
          <p className="font-semibold text-turquoise">
            {listing.status === 'rented'
                ? t('Out on rent right now.', 'مؤجَّر حاليًا.')
                : listing.status === 'reserved'
                  ? t('Someone reserved this for a meetup.', 'أحد حجزه لموعد تسليم.')
                  : t('This one is gone.', 'راح هذا الغرض.')}
          </p>
          {listing.status !== 'completed' ? (
            <p className="mt-1 text-[14px] text-muted">{t('Save it. It comes back if the meetup falls through or the rental is returned.', 'احفظه. يرجع متاح لو ما تم التسليم أو رجع من الإيجار.')}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function ListingDetail({ id }: { id: string | undefined }) {
  const t = useT()
  const L = useL()
  const listings = useListings()
  // Keep showing the last listing while the sheet animates out.
  const [last, setLast] = useState(id)
  if (id && id !== last) setLast(id)
  const shownId = id ?? last
  const listing = shownId ? listings.find((l) => l.id === shownId) : undefined

  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(o) => {
        if (!o) closeListing()
      }}
      wide
      title={listing ? L(listing.title) || t('Untitled', 'بدون عنوان') : t('Listing not found', 'الإعلان غير موجود')}
      headerExtra={
        listing ? (
          <button
            type="button"
            className={buttonClass('ghost', 'sm', '-mt-1 !min-h-11 !px-3')}
            aria-label={t('Copy link', 'انسخ الرابط')}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                toast.success(t('Link copied', 'تم نسخ الرابط'))
              } catch {
                toast.error(t('Copy the link from the address bar.', 'انسخ الرابط من شريط العنوان.'))
              }
            }}
          >
            <Share2 className="size-[18px]" aria-hidden="true" />
          </button>
        ) : null
      }
    >
      {listing ? (
        <Body listing={listing} />
      ) : (
        <div className="px-6 py-10">
          <p className="text-muted">{t('It may have been removed by the seller. Go back to the market to see what is listed now.', 'يمكن البائع حذفه. ارجع للسوق وشوف المعروض الحين.')}</p>
          <Button className="mt-4" onClick={closeListing}>
            {t('Back to the market', 'ارجع للسوق')}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
