import NumberFlow from '@number-flow/react'
import { CalendarClock, Footprints, MessageCircle, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PAYMENTS, RATE_UNITS } from '../../data/categories'
import { BELTS, ZONES, walkMinutes, zoneById } from '../../data/zones'
import { dayTime, duration, fromLocalInput, sar, toLocalInput } from '../../lib/format'
import { useVerifiedAction } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { quoteRental } from '../../lib/rental'
import type { Deal, Listing, Payment, ZoneId } from '../../lib/types'
import { dealMessage, waLink } from '../../lib/whatsapp'
import { usePersona, useStore, useUser } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Button, buttonClass } from '../ui/Button'
import { Field } from '../ui/Field'
import { Segmented } from '../ui/Segmented'

const HOUR = 3_600_000

/** Round up to the next half hour so default times look deliberate. */
function nextHalfHour(ts: number): number {
  const step = 30 * 60_000
  return Math.ceil(ts / step) * step
}

function at(ts: number, h: number, m = 0): number {
  const d = new Date(ts)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

/** Next Thursday 5 PM to Saturday 8 PM: the campus weekend. */
function nextWeekend(now: number): [number, number] {
  const d = new Date(now)
  const toThu = (4 - d.getDay() + 7) % 7
  let start = at(now + toThu * 24 * HOUR, 17)
  if (start < now) start += 7 * 24 * HOUR
  return [start, at(start + 2 * 24 * HOUR, 20)]
}

export function ReservePanel({ listing }: { listing: Listing }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const reserve = useStore((s) => s.reserve)
  const guard = useVerifiedAction()

  const isRent = listing.kind === 'rent' && listing.rent != null
  const [start0] = useState(() => nextHalfHour(Date.now() + 20 * 60_000))
  const [zone, setZone] = useState<ZoneId>(listing.zone)
  const [meet, setMeet] = useState(toLocalInput(start0))
  const [ret, setRet] = useState(toLocalInput(start0 + (listing.rent?.rates.exam != null ? 3 : 24) * HOUR))
  const methods = listing.payment.length > 0 ? listing.payment : (['cash'] as Payment[])
  const [payment, setPayment] = useState<Payment>(methods[0])

  const meetAt = fromLocalInput(meet)
  const returnAt = fromLocalInput(ret)
  const quote = useMemo(() => (isRent && listing.rent ? quoteRental(listing.rent, meetAt, returnAt) : null), [isRent, listing.rent, meetAt, returnAt])
  const total = isRent ? (quote?.total ?? 0) : listing.price
  const deposit = isRent ? (listing.rent?.deposit ?? 0) : 0
  const inPast = Number.isFinite(meetAt) && meetAt < Date.now() - 5 * 60_000
  const meetError = !Number.isFinite(meetAt)
    ? t('Pick a date and time.', 'اختر التاريخ والوقت.')
    : inPast
      ? t('That time has passed. Pick a later one.', 'هذا الوقت فات. اختر وقت بعده.')
      : undefined
  const retError =
    isRent && quote && !quote.ok
      ? quote.error === 'order'
        ? t('Return must be after pickup.', 'وقت الإرجاع لازم يكون بعد الاستلام.')
        : t('Rent for at least 30 minutes.', 'أقل مدة إيجار 30 دقيقة.')
      : undefined
  const valid = !meetError && !retError

  const presets = useMemo(() => {
    const now = Date.now()
    const s = nextHalfHour(now + 20 * 60_000)
    const list: { label: string; range: [number, number] }[] = []
    if (isRent) {
      if (listing.rent?.rates.exam != null) list.push({ label: t('Exam slot, 3 h', 'اختبار، 3 ساعات'), range: [s, s + 3 * HOUR] })
      list.push({ label: t('Until tonight', 'لين الليلة'), range: [s, Math.max(s + HOUR, at(now, 22))] })
      list.push({ label: t('One day', 'يوم واحد'), range: [s, s + 24 * HOUR] })
      list.push({ label: t('This weekend', 'هذا الويكند'), range: nextWeekend(now) })
      if (listing.rent?.rates.week != null) list.push({ label: t('One week', 'أسبوع'), range: [s, s + 7 * 24 * HOUR] })
    } else {
      list.push({ label: t('In 30 min', 'بعد 30 د'), range: [s, s] })
      const tonight = at(now, 20)
      if (tonight > now + HOUR) list.push({ label: t('Tonight 8 PM', 'الليلة 8 م'), range: [tonight, tonight] })
      const tomorrow = at(now + 24 * HOUR, 12, 30)
      list.push({ label: t('Tomorrow 12:30', 'بكرة 12:30'), range: [tomorrow, tomorrow] })
    }
    return list
  }, [isRent, listing.rent, t])

  const verb =
    listing.kind === 'free'
      ? t('Claim and request pickup', 'احجزها واطلب الاستلام')
      : listing.kind === 'service'
        ? t('Book and request meetup', 'احجز واطلب موعد')
        : isRent
          ? t('Reserve rental', 'احجز الإيجار')
          : t('Reserve and request meetup', 'احجز واطلب موعد تسليم')

  const submit = () => {
    if (!valid) return
    guard(() => {
      const deal = reserve({ listingId: listing.id, zone, meetAt, returnAt: isRent ? returnAt : undefined, total, deposit, payment })
      if (!deal) {
        toast.error(t('Someone reserved this a moment ago.', 'أحد حجزها قبل لحظات.'))
        return
      }
      toast.success(t('Reserved', 'تم الحجز'), {
        description: t('The item is locked for you until the meetup.', 'الغرض محجوز لك لين موعد التسليم.'),
      })
    })
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" role="group" aria-label={t('Quick times', 'أوقات سريعة')}>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setMeet(toLocalInput(p.range[0]))
              if (isRent) setRet(toLocalInput(p.range[1]))
            }}
            className="press inline-flex min-h-9 shrink-0 items-center rounded-full border border-turquoise/25 px-3 text-[13px] font-medium whitespace-nowrap text-turquoise hover:border-turquoise/60"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        <Field label={isRent ? t('Pickup', 'الاستلام') : t('Meetup time', 'وقت التسليم')} error={meetError} className={isRent ? '' : 'sm:col-span-2'}>
          {({ id, describedBy, invalid }) => (
            <input id={id} type="datetime-local" className="field" value={meet} onChange={(e) => setMeet(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} required />
          )}
        </Field>
        {isRent ? (
          <Field label={t('Return', 'الإرجاع')} error={retError}>
            {({ id, describedBy, invalid }) => (
              <input id={id} type="datetime-local" className="field" value={ret} min={meet} onChange={(e) => setRet(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} required />
            )}
          </Field>
        ) : null}
      </div>

      <Field
        label={t('Meetup spot', 'مكان التسليم')}
        hint={
          <span className="inline-flex items-center gap-1">
            <Footprints className="size-3.5" aria-hidden="true" />
            {t(`About ${walkMinutes(me.home, zone)} min walk from your building. ${L(zoneById(zone).hint)}.`, `حوالي ${walkMinutes(me.home, zone)} د مشي من سكنك. ${L(zoneById(zone).hint)}.`)}
          </span>
        }
      >
        {({ id, describedBy }) => (
          <select id={id} className="field" value={zone} onChange={(e) => setZone(e.target.value as ZoneId)} aria-describedby={describedBy}>
            {(['academic', 'housing', 'hubs'] as const).map((belt) => (
              <optgroup key={belt} label={L(BELTS[belt])}>
                {ZONES.filter((z) => z.belt === belt).map((z) => (
                  <option key={z.id} value={z.id}>
                    {L(z.name)}
                    {z.id === listing.zone ? t(' (seller’s spot)', ' (مكان البائع)') : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </Field>

      {total > 0 || deposit > 0 ? (
        <div>
          <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Pay at the meetup with', 'الدفع عند التسليم بـ')}</p>
          <Segmented label={t('Payment method', 'طريقة الدفع')} value={payment} onChange={setPayment} options={methods.map((m) => ({ value: m, label: L(PAYMENTS[m]) }))} />
        </div>
      ) : null}

      {isRent && listing.rent ? (
        <div className="rounded-card bg-wash p-4" aria-live="polite">
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-turquoise">
            <CalendarClock className="size-4" aria-hidden="true" />
            {quote?.ok ? t(`Rental for ${duration(quote.hours * HOUR, lang)}`, `إيجار لمدة ${duration(quote.hours * HOUR, lang)}`) : t('Rental cost', 'تكلفة الإيجار')}
          </div>
          <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[14px]">
            {quote?.ok ? (
              quote.lines.map((l) => (
                <div key={l.unit} className="contents">
                  <dt className="text-muted">
                    <span className="tabular">{l.qty}</span> × {L(RATE_UNITS[l.unit].plural)} <span className="tabular">({sar(l.rate, lang)})</span>
                  </dt>
                  <dd className="tabular text-end">{sar(l.qty * l.rate, lang)}</dd>
                </div>
              ))
            ) : (
              <div className="contents">
                <dt className="text-muted">{t('Rental fee', 'رسوم الإيجار')}</dt>
                <dd className="text-end">—</dd>
              </div>
            )}
            <dt className="text-muted">{t('Refundable deposit', 'تأمين مسترد')}</dt>
            <dd className="tabular text-end">{sar(deposit, lang)}</dd>
            <dt className="mt-1 border-t border-line pt-2 font-semibold text-turquoise">{t('Bring to pickup', 'جهّز عند الاستلام')}</dt>
            <dd className="tabular mt-1 border-t border-line pt-2 text-end font-display text-[22px] font-bold text-turquoise">
              <span className="inline-flex items-baseline gap-1">
                {lang === 'en' ? <span className="text-[15px]">SAR</span> : null}
                <NumberFlow value={quote?.ok ? quote.total : deposit} locales="en-US" />
                {lang === 'ar' ? <span className="text-[15px]">ر.س</span> : null}
              </span>
            </dd>
          </dl>
          <p className="mt-2 text-[12.5px] text-muted">
            {t(`You get ${sar(deposit, lang)} back when you return it on time. Late returns cost ${sar(listing.rent.lateFeePerHour, lang)} per hour.`, `يرجع لك ${sar(deposit, lang)} إذا رجّعته في الوقت. التأخير بـ ${sar(listing.rent.lateFeePerHour, lang)} للساعة.`)}
          </p>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={!valid} className="w-full">
        {verb}
      </Button>
      <p className="text-center text-[12.5px] text-muted">
        {t('No payment happens in the app. You settle in person at the meetup.', 'ما فيه دفع داخل التطبيق. الحساب بينكم وجهًا لوجه عند التسليم.')}
      </p>
    </form>
  )
}

/** Shown to the buyer once the item is reserved: the agreed details and a ready WhatsApp message. */
export function ReservedSummary({ listing, deal: done }: { listing: Listing; deal: Deal }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const seller = useUser(listing.sellerId)
  const setDeals = useUi((s) => s.setDeals)
  const isRent = done.type === 'rent'
    const text = dealMessage(listing, done, me, lang)
    return (
      <div className="fade-in rounded-card bg-success/15 p-4" role="status">
        <p className="flex items-center gap-2 font-semibold text-turquoise">
          <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
          {done.status === 'rented' ? t('It is with you now. Return it on time.', 'الغرض عندك الحين. رجّعه في وقته.') : t('Reserved. Now agree the meetup on WhatsApp.', 'تم الحجز. اتفقوا على الموعد في الواتساب.')}
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
          <dt className="text-muted">{isRent ? t('Pickup', 'الاستلام') : t('Meetup', 'الموعد')}</dt>
          <dd>{dayTime(done.meetAt, lang)}</dd>
          {done.returnAt ? (
            <>
              <dt className="text-muted">{t('Return', 'الإرجاع')}</dt>
              <dd>{dayTime(done.returnAt, lang)}</dd>
            </>
          ) : null}
          <dt className="text-muted">{t('Where', 'المكان')}</dt>
          <dd className="[overflow-wrap:anywhere]">{L(zoneById(done.zone).name)}</dd>
          <dt className="text-muted">{t('Bring', 'جهّز')}</dt>
          <dd className="tabular">
            {done.total === 0 ? t('Nothing to pay', 'ما فيه دفع') : `${sar(done.total, lang)} · ${L(PAYMENTS[done.payment])}`}
          </dd>
        </dl>
        <p className="mt-3 rounded-control bg-white p-3 text-[13px] whitespace-pre-line text-black/80 [overflow-wrap:anywhere]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {text}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {seller ? (
            <a href={waLink(seller, text)} target="_blank" rel="noreferrer" className={buttonClass('whatsapp', 'md', 'flex-1')}>
              <MessageCircle className="size-[18px] text-green" aria-hidden="true" />
              {t('Send on WhatsApp', 'أرسل في الواتساب')}
            </a>
          ) : null}
          <Button variant="secondary" onClick={() => setDeals(true)}>
            {t('Open my deals', 'افتح صفقاتي')}
          </Button>
        </div>
      </div>
    )
}
