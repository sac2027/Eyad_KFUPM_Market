import { BadgeCheck, Check, Clock, Heart, MapPin, Zap } from 'lucide-react'
import { CONDITIONS, KINDS, MAJOR_COLOR, PAYMENTS, RATE_UNITS } from '../../data/categories'
import { zoneById } from '../../data/zones'
import { cn } from '../../lib/cn'
import { num, sar } from '../../lib/format'
import { useIsFavorite } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { lowestRate } from '../../lib/rental'
import type { Listing, ListingStatus, Payment, User } from '../../lib/types'
import { useStore } from '../../store/useStore'
import { Badge } from '../ui/Badge'

export function bundleTotal(l: Listing): number {
  return l.bundle?.items.reduce((s, i) => s + i.price, 0) ?? 0
}

export function groupQty(l: Listing): number {
  return l.groupBuy?.joined.reduce((s, j) => s + j.qty, 0) ?? 0
}

/** Price line for cards and the detail header. */
export function Price({ listing, size = 'md' }: { listing: Listing; size?: 'md' | 'lg' }) {
  const lang = useLang()
  const t = useT()
  const L = useL()
  const big = size === 'lg' ? 'text-[28px]' : 'text-[18px]'
  const cls = cn('tabular font-display font-bold text-turquoise', big)
  const sub = 'text-[13px] text-muted'

  if (listing.kind === 'rent' && listing.rent) {
    const { unit, rate } = lowestRate(listing.rent)
    return (
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className={cls}>{sar(rate, lang)}</span>
        <span className={sub}>{L(RATE_UNITS[unit].per)}</span>
      </p>
    )
  }
  if (listing.kind === 'free' || (listing.price === 0 && listing.kind !== 'groupbuy')) {
    return (
      <p className={cls}>
        {t('Free', 'لوجه الله')}
        {size === 'lg' ? <span className="ms-2 text-[14px] font-normal text-muted">{sar(0, lang)}</span> : null}
      </p>
    )
  }
  if (listing.kind === 'bundle') {
    const sum = bundleTotal(listing)
    const save = sum > listing.price ? Math.round((1 - listing.price / sum) * 100) : 0
    return (
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={cls}>{sar(listing.price, lang)}</span>
        {save > 0 ? (
          <>
            <s className={cn(sub, 'tabular')}>{num(sum)}</s>
            <span className="text-[13px] font-semibold text-turquoise">{t(`Save ${save}%`, `وفّر ${save}%`)}</span>
          </>
        ) : null}
      </p>
    )
  }
  if (listing.kind === 'service' && listing.service) {
    return (
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className={cls}>{sar(listing.price, lang)}</span>
        <span className={sub}>{L(listing.service.unit)}</span>
      </p>
    )
  }
  if (listing.kind === 'groupbuy' && listing.groupBuy) {
    return (
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={cls}>{sar(listing.groupBuy.unitPrice, lang)}</span>
        <span className={sub}>{t('each', 'للحبة')}</span>
        {listing.groupBuy.retailPrice > listing.groupBuy.unitPrice ? <s className={cn(sub, 'tabular')}>{num(listing.groupBuy.retailPrice)}</s> : null}
      </p>
    )
  }
  return <p className={cls}>{sar(listing.price, lang)}</p>
}

export function StatusBadge({ status, short }: { status: ListingStatus; short?: boolean }) {
  const t = useT()
  if (status === 'available') return null
  const map = {
    reserved: { tone: 'yellow' as const, label: short ? t('Reserved', 'محجوز') : t('Reserved for meetup', 'محجوز للتسليم') },
    rented: { tone: 'blue' as const, label: short ? t('Rented out', 'مؤجَّر') : t('Out on rent', 'مؤجَّر حاليًا') },
    completed: { tone: 'neutral' as const, label: t('Completed', 'تم') },
  }
  const m = map[status]
  return <Badge tone={m.tone}>{m.label}</Badge>
}

export function KindBadge({ listing }: { listing: Listing }) {
  const L = useL()
  if (listing.kind === 'sale') return null
  const tone = listing.kind === 'free' ? 'yellow' : listing.kind === 'rent' ? 'turquoise' : 'beige'
  return <Badge tone={tone}>{L(KINDS[listing.kind])}</Badge>
}

export function InstantBadge() {
  const t = useT()
  return (
    <Badge tone="yellow">
      <Zap className="size-3.5" aria-hidden="true" />
      <span className="xs:hidden">{t('15 min', '15 د')}</span>
      <span className="hidden xs:inline">{t('15 min pickup', 'استلام خلال 15 د')}</span>
    </Badge>
  )
}

export function CourseTag({ course }: { course: string }) {
  return (
    <span dir="ltr" className="inline-flex min-h-6 max-w-full items-center rounded-[6px] bg-wash-strong px-2 text-[12.5px] font-semibold text-turquoise [overflow-wrap:anywhere]">
      {course}
    </span>
  )
}

export function ConditionLabel({ listing }: { listing: Listing }) {
  const L = useL()
  return <>{L(CONDITIONS[listing.condition])}</>
}

export function ZoneLine({ listing, className }: { listing: Pick<Listing, 'zone'>; className?: string }) {
  const L = useL()
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1', className)}>
      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{L(zoneById(listing.zone).short)}</span>
    </span>
  )
}

export function PaymentBadges({ methods }: { methods: Payment[] }) {
  const L = useL()
  const t = useT()
  if (methods.length === 0) return <p className="text-[13.5px] text-muted">{t('Ask the seller how they want to settle.', 'اسأل البائع عن طريقة الدفع.')}</p>
  return (
    <ul className="flex flex-wrap gap-1.5">
      {methods.map((m) => (
        <li key={m}>
          <Badge tone="outline">{L(PAYMENTS[m])}</Badge>
        </li>
      ))}
    </ul>
  )
}

export function FavButton({ id, className }: { id: string; className?: string }) {
  const on = useIsFavorite(id)
  const toggle = useStore((s) => s.toggleFavorite)
  const t = useT()
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t('Remove from saved', 'إزالة من المحفوظات') : t('Save', 'حفظ')}
      onClick={(e) => {
        e.stopPropagation()
        toggle(id)
      }}
      className={cn('press inline-grid size-11 place-items-center rounded-full', className)}
    >
      <span className="inline-grid size-9 place-items-center rounded-full bg-white text-turquoise">
        <Heart className={cn('size-[18px] transition-transform duration-200', on && 'scale-110 fill-error text-error')} aria-hidden="true" />
      </span>
    </button>
  )
}

/** Name with the simulated @kfupm.edu.sa check and a college-colored major dot. */
export function Verified({ user, className }: { user: User | undefined; className?: string }) {
  const L = useL()
  const t = useT()
  if (!user) return <span className={cn('text-muted', className)}>{t('Unknown student', 'طالب غير معروف')}</span>
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <span className="truncate font-medium">{L(user.name)}</span>
      {user.verified ? (
        <BadgeCheck className="size-4 shrink-0 text-green" aria-label={t('Verified KFUPM student', 'طالب موثّق في الجامعة')} />
      ) : null}
    </span>
  )
}

export function MajorTag({ user }: { user: User }) {
  const L = useL()
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
      <span className="size-2 shrink-0 rounded-full" style={{ background: MAJOR_COLOR[user.major] ?? '#ADACAD' }} aria-hidden="true" />
      <span dir="ltr">{user.major}</span>
      <span aria-hidden="true">/</span>
      <span>{L(user.level)}</span>
    </span>
  )
}

/** Available → Reserved → (Out on rent) → Completed. */
export function StatusSteps({ status, rental }: { status: ListingStatus; rental: boolean }) {
  const t = useT()
  const steps: { id: ListingStatus; label: string }[] = [
    { id: 'available', label: t('Available', 'متاح') },
    { id: 'reserved', label: t('Reserved', 'محجوز') },
    ...(rental ? [{ id: 'rented' as const, label: t('Out on rent', 'مؤجَّر') }] : []),
    { id: 'completed', label: rental ? t('Returned', 'تم الإرجاع') : t('Completed', 'تم') },
  ]
  const at = Math.max(0, steps.findIndex((s) => s.id === status))
  return (
    <ol className="flex items-center gap-1.5" aria-label={t('Handover progress', 'مراحل التسليم')}>
      {steps.map((s, i) => (
        <li key={s.id} className="flex min-w-0 flex-1 flex-col gap-1.5" aria-current={i === at ? 'step' : undefined}>
          <span className={cn('h-1.5 rounded-full transition-colors duration-300', i <= at ? 'bg-green' : 'bg-black/10')} />
          <span className={cn('flex items-center gap-1 text-[12.5px]', i === at ? 'font-semibold text-turquoise' : 'text-muted')}>
            {i < at ? <Check className="size-3.5 shrink-0 text-green" aria-hidden="true" /> : null}
            <span className="truncate">{s.label}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function Posted({ ts, now }: { ts: number; now: number }) {
  const lang = useLang()
  const m = Math.max(0, Math.round((now - ts) / 60_000))
  let text: string
  if (m < 1) text = lang === 'ar' ? 'الآن' : 'now'
  else if (m < 60) text = lang === 'ar' ? `${m} د` : `${m}m`
  else if (m < 1440) text = lang === 'ar' ? `${Math.round(m / 60)} س` : `${Math.round(m / 60)}h`
  else text = lang === 'ar' ? `${Math.round(m / 1440)} يوم` : `${Math.round(m / 1440)}d`
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <Clock className="size-3.5" aria-hidden="true" />
      {text}
    </span>
  )
}
