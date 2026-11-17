import { Check, ChevronDown, Clock, HandHelping, MapPin, MessageCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar } from '../components/listing/SellerCard'
import { CourseTag, Verified } from '../components/listing/parts'
import { Badge } from '../components/ui/Badge'
import { Button, buttonClass } from '../components/ui/Button'
import { Segmented } from '../components/ui/Segmented'
import { URGENCY } from '../data/categories'
import { zoneById } from '../data/zones'
import { cn } from '../lib/cn'
import { ago, dayTime, duration, sar } from '../lib/format'
import { useListings, useNow, useRequests } from '../lib/hooks'
import { useL, useLang, useT } from '../lib/i18n'
import { openListing } from '../lib/router'
import type { IsoRequest, Urgency } from '../lib/types'
import { waLink } from '../lib/whatsapp'
import { usePersona, useStore, useUser } from '../store/useStore'
import { useUi } from '../store/useUi'
import { EmptyState, PageHeader } from './shared'

function bountyText(r: IsoRequest, t: (en: string, ar: string) => string, lang: 'en' | 'ar'): string {
  if (r.budget === 0) return t('Swap or favor', 'مقايضة أو فزعة')
  const amount = sar(r.budget, lang)
  if (r.bounty === 'rent') return t(`Will rent for ${amount}`, `يستأجر بـ ${amount}`)
  if (r.bounty === 'buy') return t(`Budget ${amount}`, `الميزانية ${amount}`)
  return t(`${amount} for the favor`, `${amount} مقابل الفزعة`)
}

function OfferRow({ offer }: { offer: IsoRequest['offers'][number] }) {
  const L = useL()
  const t = useT()
  const lang = useLang()
  const now = useNow()
  const user = useUser(offer.userId)
  const listings = useListings()
  const attached = offer.listingId ? listings.find((l) => l.id === offer.listingId) : undefined
  return (
    <li className="flex gap-3 py-3">
      <Avatar user={user} className="size-8 text-[13px]" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-[13.5px]">
          <Verified user={user} />
          <span className="text-muted">{ago(offer.createdAt, lang, now)}</span>
        </p>
        {offer.note ? <p className="text-[14px] [overflow-wrap:anywhere]">{offer.note}</p> : null}
        <div className="mt-1 flex flex-wrap gap-x-4">
          {attached ? (
            <button type="button" onClick={() => openListing(attached.id)} className="inline-flex min-h-9 items-center text-[13.5px] font-semibold text-turquoise underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise">
              <span className="line-clamp-1 text-start">{t('Attached: ', 'مرفق: ') + L(attached.title)}</span>
            </button>
          ) : null}
          {user ? (
            <a href={waLink(user, lang === 'ar' ? 'السلام عليكم، شفت عرضك على طلبي في سوق البترول.' : 'Salam, I saw your offer on my KFUPM Market request.')} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-[13.5px] font-semibold text-turquoise underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise">
              <MessageCircle className="size-4 text-green" aria-hidden="true" />
              {t('Reply on WhatsApp', 'رد في الواتساب')}
            </a>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function RequestCard({ r, now, index }: { r: IsoRequest; now: number; index: number }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const requester = useUser(r.requesterId)
  const setOfferFor = useUi((s) => s.setOfferFor)
  const fulfil = useStore((s) => s.fulfilRequest)
  const [open, setOpen] = useState(false)
  const mine = r.requesterId === me.id
  const left = r.neededBy - now
  const overdue = left <= 0
  const hot = r.urgency === 'emergency' && r.status === 'open'
  const offered = r.offers.some((o) => o.userId === me.id)
  const desc = L(r.desc)

  return (
    <li className={cn('rounded-card p-4 sm:p-5', hot ? 'bg-yellow/25' : 'bg-wash', r.status === 'fulfilled' && 'opacity-70')} style={{ '--i': index } as React.CSSProperties}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Badge tone={r.status === 'fulfilled' ? 'green' : hot ? 'yellow' : 'outline'}>
          {r.status === 'fulfilled' ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              {t('Sorted', 'تم')}
            </>
          ) : (
            <>
              {hot ? <span className="pulse-dot size-2 rounded-full bg-black" aria-hidden="true" /> : null}
              {L(URGENCY[r.urgency])}
            </>
          )}
        </Badge>
        {r.course ? <CourseTag course={r.course} /> : null}
        <span className="ms-auto inline-flex items-center gap-1 text-[13px] text-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {r.status === 'fulfilled'
            ? dayTime(r.neededBy, lang, now)
            : overdue
              ? t('Needed time has passed', 'فات الوقت المطلوب')
              : t(`Needed in ${duration(left, lang)}`, `مطلوب خلال ${duration(left, lang)}`)}
        </span>
      </div>

      <h2 className="mt-2.5 !font-sans text-[17px] leading-snug font-semibold tracking-normal text-black [overflow-wrap:anywhere]">{L(r.title)}</h2>
      {desc ? <p className="mt-1 max-w-[70ch] text-[14.5px] text-black/75 [overflow-wrap:anywhere]">{desc}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px]">
        <span className="tabular font-semibold text-turquoise">{bountyText(r, t, lang)}</span>
        <span className="inline-flex min-w-0 items-center gap-1 text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{L(zoneById(r.zone).short)}</span>
        </span>
        <Verified user={requester} className="text-muted" />
        <span className="text-muted">{ago(r.createdAt, lang, now)}</span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {mine ? (
          r.status === 'open' ? (
            <Button
              variant="secondary"
              onClick={() => {
                fulfil(r.id)
                toast.success(t('Marked as sorted', 'تم تحديد الطلب كمنتهي'))
              }}
            >
              <Check className="size-4" aria-hidden="true" />
              {t('Mark as sorted', 'خلاص لقيت')}
            </Button>
          ) : null
        ) : r.status === 'open' ? (
          <Button onClick={() => setOfferFor(r.id)} variant={offered ? 'secondary' : 'primary'}>
            <HandHelping className="size-[18px]" aria-hidden="true" />
            {offered ? t('Offer again', 'اعرض مرة ثانية') : t('I have this', 'عندي')}
          </Button>
        ) : null}
        {r.offers.length > 0 ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={buttonClass('ghost', 'md')}>
            <span className="tabular">{t(`${r.offers.length} ${r.offers.length === 1 ? 'offer' : 'offers'}`, `${r.offers.length} عرض`)}</span>
            <ChevronDown className={cn('size-4 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
          </button>
        ) : r.status === 'open' ? (
          <span className="text-[13.5px] text-muted">{mine ? t('No offers yet. Students nearby have been pinged.', 'ما فيه عروض للحين. نبّهنا الطلاب القريبين.') : t('No offers yet. Be the first.', 'ما فيه عروض. كن أول واحد.')}</span>
        ) : null}
      </div>

      {open ? (
        <ul className="fade-in mt-2 divide-y divide-line border-t border-line">
          {r.offers.map((o) => (
            <OfferRow key={o.id} offer={o} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function Requests() {
  const t = useT()
  const L = useL()
  const now = useNow(15_000)
  const all = useRequests()
  const me = usePersona()
  const finals = useStore((s) => s.finals)
  const openStudio = useUi((s) => s.openStudio)
  const [filter, setFilter] = useState<Urgency | 'all' | 'mine'>('all')

  const effective = finals && filter === 'all' ? 'emergency' : filter
  const rank: Record<Urgency, number> = { emergency: 0, week: 1, flexible: 2 }
  const shown = all
    .filter((r) => (effective === 'all' ? true : effective === 'mine' ? r.requesterId === me.id : r.urgency === effective))
    .sort((a, b) => Number(a.status === 'fulfilled') - Number(b.status === 'fulfilled') || rank[a.urgency] - rank[b.urgency] || a.neededBy - b.neededBy)
  const urgent = all.filter((r) => r.urgency === 'emergency' && r.status === 'open').length

  return (
    <>
      <PageHeader
        title={t('Requests', 'الطلبات')}
        lead={
          urgent > 0
            ? t(`${urgent} students need something before an exam today. If you have it, one tap puts you in touch.`, `${urgent} طلاب يحتاجون شي قبل اختبار اليوم. لو عندك، ضغطة وحدة توصلك فيهم.`)
            : t('Say what you need and when. Students who have it answer here.', 'قل وش تحتاج ومتى. واللي عنده يرد عليك هنا.')
        }
        action={
          <Button onClick={() => openStudio('request')}>
            <Plus className="size-[18px]" aria-hidden="true" />
            {t('Post a request', 'انشر طلب')}
          </Button>
        }
      />

      <div className="mb-4">
        <Segmented
          label={t('Show', 'اعرض')}
          value={effective}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('All', 'الكل') },
            { value: 'emergency', label: L(URGENCY.emergency) },
            { value: 'week', label: L(URGENCY.week) },
            { value: 'flexible', label: L(URGENCY.flexible) },
            { value: 'mine', label: t('Mine', 'طلباتي') },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={effective === 'mine' ? t('You have not asked for anything', 'ما طلبت شي للحين') : t('No requests here', 'ما فيه طلبات هنا')}
          body={t('Need a calculator tonight or a ride to Khobar? Post it and set what you would pay.', 'تحتاج حاسبة الليلة أو مشوار للخبر؟ انشر طلبك وحدد كم تدفع.')}
          action={<Button onClick={() => openStudio('request')}>{t('Post a request', 'انشر طلب')}</Button>}
        />
      ) : (
        <ul className="stagger grid gap-3 xl:grid-cols-2">
          {shown.map((r, i) => (
            <RequestCard key={r.id} r={r} now={now} index={i} />
          ))}
        </ul>
      )}
    </>
  )
}
