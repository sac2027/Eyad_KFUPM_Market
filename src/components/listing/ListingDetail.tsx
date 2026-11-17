import { CircleCheck, EyeOff, Flag, MessageCircle, Repeat, Share2, Trash2, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { RATE_UNITS, categoryName } from '../../data/categories'
import { zoneById } from '../../data/zones'
import { ago, sar } from '../../lib/format'
import { useListings, useNow } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { closeListing, go } from '../../lib/router'
import type { Listing, RateUnit } from '../../lib/types'
import { waLink } from '../../lib/whatsapp'
import { usePersona, useStore, useUser } from '../../store/useStore'
import { useUi } from '../../store/useUi'
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

/** Seller's quick controls: change the price or mark it sold elsewhere. */
function OwnerTools({ listing }: { listing: Listing }) {
  const t = useT()
  const lang = useLang()
  const updatePrice = useStore((s) => s.updatePrice)
  const markSold = useStore((s) => s.markSold)
  const removeListing = useStore((s) => s.removeListing)
  const addListing = useStore((s) => s.addListing)
  const [price, setPrice] = useState(String(listing.price))
  const n = Number(price)
  const valid = price.trim() !== '' && Number.isFinite(n) && n >= 0
  const priced = listing.kind === 'sale' || listing.kind === 'bundle' || listing.kind === 'service'

  return (
    <div className="rounded-card bg-wash p-4">
      <p className="font-semibold text-turquoise">{t('This is your listing.', 'هذا إعلانك.')}</p>
      {listing.hidden ? (
        <p className="mt-2 flex items-start gap-2 rounded-control bg-error/15 p-3 text-[14px] font-medium text-danger-ink">
          <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t('A market admin hid this listing. Other students cannot see it. Fix what was reported or contact the admins.', 'مشرف السوق أخفى هذا الإعلان. الطلاب ما يشوفونه. صحّح المشكلة أو تواصل مع المشرفين.')}
        </p>
      ) : (
        <p className="mt-1 text-[14px] text-muted">
          {listing.status === 'available'
            ? t('Students see it now. Reservations show up in your deals.', 'ظاهر للطلاب الحين. الحجوزات تطلع في صفقاتك.')
            : listing.status === 'completed'
              ? t('Marked as sold.', 'تم تحديده كمباع.')
              : t('Manage the handover from your deals.', 'تابع التسليم من صفقاتك.')}
        </p>
      )}
      {listing.status === 'available' ? (
        <>
          {priced ? (
            <form
              className="mt-3 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!valid || n === listing.price) return
                updatePrice(listing.id, n)
                toast.success(t(`Price changed to ${sar(n, lang)}`, `تغيّر السعر إلى ${sar(n, lang)}`))
              }}
            >
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-[13.5px] font-semibold text-turquoise">{t('Price, SAR', 'السعر بالريال')}</span>
                <input className="field tabular" type="number" inputMode="numeric" min={0} value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={!valid} />
              </label>
              <Button type="submit" variant="secondary" disabled={!valid || n === listing.price}>
                {t('Save price', 'احفظ السعر')}
              </Button>
            </form>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.kind === 'service' || listing.kind === 'rent' ? null : (
              <Button
                variant="secondary"
                size="sm"
                className="!min-h-11"
                onClick={() => {
                  markSold(listing.id)
                  toast.success(t('Marked as sold', 'تم تحديده كمباع'))
                }}
              >
                <CircleCheck className="size-4" aria-hidden="true" />
                {listing.kind === 'free' ? t('Mark as given away', 'تم التبرع به') : t('Mark as sold', 'تم البيع')}
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              className="!min-h-11"
              onClick={() => {
                removeListing(listing.id)
                closeListing()
                toast(t('Listing removed', 'تم حذف الإعلان'), { action: { label: t('Undo', 'تراجع'), onClick: () => addListing(listing) }, duration: 8000 })
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t('Remove listing', 'احذف الإعلان')}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}

/** Shown to the admin persona in place of the reserve form. */
function AdminTools({ listing }: { listing: Listing }) {
  const t = useT()
  const setHidden = useStore((s) => s.setListingHidden)
  const remove = useStore((s) => s.adminRemoveListing)
  const openReports = useStore((s) => s.reports.filter((r) => r.status === 'open' && r.targetType === 'listing' && r.targetId === listing.id).length)
  return (
    <div className="rounded-card bg-wash p-4">
      <p className="font-semibold text-turquoise">{t('Moderation', 'الإشراف')}</p>
      <p className="mt-1 text-[14px] text-muted">
        {listing.hidden
          ? t('Hidden from students. The seller still sees it with a notice.', 'مخفي عن الطلاب. البائع يشوفه مع تنبيه.')
          : openReports > 0
            ? t(`${openReports} open ${openReports === 1 ? 'report' : 'reports'} on this listing.`, `${openReports} بلاغ مفتوح على هذا الإعلان.`)
            : t('No open reports on this listing.', 'ما فيه بلاغات مفتوحة على هذا الإعلان.')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="!min-h-11"
          onClick={() => {
            setHidden(listing.id, !listing.hidden)
            toast.success(listing.hidden ? t('Listing restored', 'تمت إعادة الإعلان') : t('Listing hidden from students', 'تم إخفاء الإعلان عن الطلاب'))
          }}
        >
          <EyeOff className="size-4" aria-hidden="true" />
          {listing.hidden ? t('Restore listing', 'أعد الإعلان') : t('Hide listing', 'أخفِ الإعلان')}
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="!min-h-11"
          onClick={() => {
            if (!window.confirm(t('Remove this listing for good? Pending meetups for it are cancelled.', 'تحذف الإعلان نهائيًا؟ المواعيد المعلقة عليه تنلغي.'))) return
            remove(listing.id)
            closeListing()
            toast(t('Listing removed', 'تم حذف الإعلان'))
          }}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t('Remove listing', 'احذف الإعلان')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="!min-h-11"
          onClick={() => {
            closeListing()
            go('admin')
          }}
        >
          {t('Open admin', 'افتح الإدارة')}
        </Button>
      </div>
    </div>
  )
}

function Body({ listing, onFormVisible }: { listing: Listing; onFormVisible: (v: boolean) => void }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow(30_000)
  const me = usePersona()
  const seller = useUser(listing.sellerId)
  const setProfile = useUi((s) => s.setProfile)
  const setReportTarget = useUi((s) => s.setReportTarget)
  const formRef = useRef<HTMLDivElement>(null)
  const myDeal = useStore((s) => s.deals.find((d) => d.listingId === listing.id && d.buyerId === s.personaId && (d.status === 'reserved' || d.status === 'rented')))
  const mine = listing.sellerId === me.id
  const isWorst = listing.id.startsWith('worst-')
  const desc = L(listing.desc)
  const zone = zoneById(listing.zone)
  const sum = bundleTotal(listing)
  const isAdmin = me.role === 'admin'
  const canAsk = Boolean(seller) && !mine && !isWorst && !isAdmin

  // Tell the sheet when the reserve form is on screen, so the sticky bar can step aside.
  useEffect(() => {
    const el = formRef.current
    if (!el) {
      onFormVisible(true)
      return
    }
    const io = new IntersectionObserver(([e]) => onFormVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [onFormVisible, listing.id, listing.status, myDeal?.id])

  return (
    <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
      <div className="relative">
        <Art id={listing.id} icon={listing.icon} tone={listing.tone} photo={listing.photo} alt={listing.photo ? L(listing.title) : t('No photo yet', 'ما فيه صورة')} className="aspect-[16/9] w-full rounded-card sm:aspect-[5/2]" iconClassName="size-20" />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-1.5 pe-12">
          <KindBadge listing={listing} />
          <StatusBadge status={listing.status} />
          {listing.instant && listing.status === 'available' ? <InstantBadge /> : null}
          {listing.passItOn ? <Badge tone="beige">{t('Pass-It-On box', 'صندوق الخريجين')}</Badge> : null}
          {listing.hidden ? <Badge tone="error">{t('Hidden by admin', 'مخفي من المشرف')}</Badge> : null}
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

      {listing.kind !== 'groupbuy' && (listing.status !== 'available' || mine) ? <StatusSteps status={listing.status} rental={listing.kind === 'rent'} /> : null}

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

      {seller && !isWorst ? (
        <div className="-mt-3 flex flex-wrap gap-2">
          {canAsk ? (
            <a
              href={waLink(
                seller,
                lang === 'ar'
                  ? `السلام عليكم، شفت إعلانك في سوق البترول: ${L(listing.title)}\n${listing.photo ? 'عندي سؤال عنه.' : 'ممكن ترسل لي صور له؟'}`
                  : `Salam, I saw your listing on KFUPM Market: ${L(listing.title)}\n${listing.photo ? 'I have a question about it.' : 'Could you send me a few photos of it?'}`,
              )}
              target="_blank"
              rel="noreferrer"
              className={buttonClass('whatsapp', 'sm', '!min-h-11')}
            >
              <MessageCircle className="size-4 text-green" aria-hidden="true" />
              {listing.photo ? t('Ask a question', 'اسأل سؤال') : t('Ask for photos', 'اطلب صور')}
            </a>
          ) : null}
          <Button variant="ghost" size="sm" className="!min-h-11" onClick={() => setProfile(seller.id)}>
            <UserRound className="size-4" aria-hidden="true" />
            {t('Profile and other listings', 'الملف وباقي إعلاناته')}
          </Button>
          {canAsk ? (
            <Button variant="ghost" size="sm" className="!min-h-11" onClick={() => setReportTarget({ type: 'listing', id: listing.id })}>
              <Flag className="size-4" aria-hidden="true" />
              {t('Report', 'بلّغ')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {isAdmin && !isWorst ? (
        <AdminTools listing={listing} />
      ) : listing.kind === 'groupbuy' ? (
        <GroupBuyPanel listing={listing} />
      ) : mine ? (
        <OwnerTools key={listing.id} listing={listing} />
      ) : isWorst ? (
        <p className="rounded-card bg-wash p-4 text-[14px] text-muted">{t('Stress-test row. It cannot be reserved.', 'صف اختبار. ما ينحجز.')}</p>
      ) : myDeal ? (
        <ReservedSummary listing={listing} deal={myDeal} />
      ) : listing.status === 'available' ? (
        <div ref={formRef} id="reserve-form" className="scroll-mt-4">
          <Section title={listing.kind === 'rent' ? t('Pick your rental window', 'اختر مدة الإيجار') : t('Request a meetup', 'اطلب موعد تسليم')}>
            <ReservePanel key={listing.id} listing={listing} />
          </Section>
        </div>
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
  const me = usePersona()
  const hasDeal = useStore((s) => s.deals.some((d) => d.listingId === shownId && d.buyerId === s.personaId && (d.status === 'reserved' || d.status === 'rented')))
  const [formVisible, setFormVisible] = useState(true)
  const reservable =
    listing != null && listing.status === 'available' && listing.kind !== 'groupbuy' && listing.sellerId !== me.id && me.role !== 'admin' && !hasDeal && !listing.id.startsWith('worst-')

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
            aria-label={t('Share this listing', 'شارك الإعلان')}
            onClick={async () => {
              try {
                // Phones get the native share sheet; desktops copy the link.
                if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
                  await navigator.share({ title: L(listing.title), url: window.location.href })
                  return
                }
                await navigator.clipboard.writeText(window.location.href)
                toast.success(t('Link copied', 'تم نسخ الرابط'))
              } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return
                toast.error(t('Copy the link from the address bar.', 'انسخ الرابط من شريط العنوان.'))
              }
            }}
          >
            <Share2 className="size-[18px]" aria-hidden="true" />
          </button>
        ) : null
      }
      footer={
        reservable && !formVisible ? (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Price listing={listing} />
            </div>
            <Button
              onClick={() => document.getElementById('reserve-form')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })}
            >
              {listing.kind === 'rent' ? t('Choose rental dates', 'اختر مدة الإيجار') : listing.kind === 'free' ? t('Claim it', 'احجزه') : listing.kind === 'service' ? t('Book it', 'احجز موعد') : t('Request meetup', 'اطلب موعد')}
            </Button>
          </div>
        ) : undefined
      }
    >
      {listing ? (
        <Body listing={listing} onFormVisible={setFormVisible} />
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
