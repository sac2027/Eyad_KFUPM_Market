import { BadgeCheck, EyeOff, MessageCircle, Search, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Art } from '../../components/brand/Art'
import { Avatar } from '../../components/listing/SellerCard'
import { MajorTag } from '../../components/listing/parts'
import { Badge } from '../../components/ui/Badge'
import { Button, buttonClass } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Segmented } from '../../components/ui/Segmented'
import { KINDS, REPORT_REASONS } from '../../data/categories'
import { zoneById } from '../../data/zones'
import { cn } from '../../lib/cn'
import { ago, dayTime, duration, sar } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { openListing } from '../../lib/router'
import type { Announcement, Bi, Listing, Report, User } from '../../lib/types'
import { waLink } from '../../lib/whatsapp'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'

const th = 'px-3 py-2 text-start text-[12.5px] font-medium whitespace-nowrap text-muted first:ps-0 last:pe-0'
const td = 'px-3 py-2.5 align-middle text-[14px] first:ps-0 last:pe-0'
const rowBtn = '!min-h-11 md:!min-h-9'

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-card bg-wash p-5 text-[14.5px] text-muted">{children}</p>
}

function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative min-w-[180px] flex-1 sm:max-w-[320px]">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-turquoise/70" aria-hidden="true" />
      <input type="search" className="field !ps-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${label}…`} aria-label={label} autoComplete="off" name="admin-q" />
    </div>
  )
}

function UserStatus({ user }: { user: User }) {
  const t = useT()
  if (user.suspended) return <Badge tone="error">{t('Suspended', 'موقوف')}</Badge>
  if (user.verified) return <Badge tone="green">{t('Verified', 'موثّق')}</Badge>
  return <Badge tone="neutral">{t('Not verified', 'غير موثّق')}</Badge>
}

// ── Reports ──────────────────────────────────────────────────────────────────

function ReportCard({ r }: { r: Report }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow()
  const listing = useStore((s) => (r.targetType === 'listing' ? s.listings.find((l) => l.id === r.targetId) : undefined))
  const request = useStore((s) => (r.targetType === 'request' ? s.requests.find((x) => x.id === r.targetId) : undefined))
  const target = useStore((s) => (r.targetType === 'user' ? s.users.find((u) => u.id === r.targetId) : undefined))
  const owner = useStore((s) => s.users.find((u) => u.id === (listing?.sellerId ?? request?.requesterId)))
  const reporter = useStore((s) => s.users.find((u) => u.id === r.reporterId))
  const others = useStore((s) => s.reports.filter((x) => x.id !== r.id && x.targetType === r.targetType && x.targetId === r.targetId).length)
  const resolve = useStore((s) => s.resolveReport)
  const setHidden = useStore((s) => s.setListingHidden)
  const setSuspended = useStore((s) => s.setSuspended)
  const removeRequest = useStore((s) => s.adminRemoveRequest)
  const setProfile = useUi((s) => s.setProfile)

  const gone = r.targetType === 'listing' ? !listing : r.targetType === 'request' ? !request : !target
  const title = listing ? L(listing.title) : request ? L(request.title) : target ? L(target.name) : t('No longer exists', 'لم يعد موجودًا')
  const typeLabel = r.targetType === 'listing' ? t('Listing', 'إعلان') : r.targetType === 'request' ? t('Request', 'طلب') : t('Student', 'طالب')
  const open = r.status === 'open'

  const act = (resolution: Bi, fn: () => void, msg: string) => {
    fn()
    resolve(r.id, 'actioned', resolution)
    toast.success(msg)
  }

  return (
    <li className={cn('rounded-card p-4 sm:p-5', open ? 'bg-wash' : 'bg-black/[0.03]')}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Badge tone="outline">{typeLabel}</Badge>
        <Badge tone={r.reason === 'scam' || r.reason === 'abuse' ? 'error' : 'yellow'}>{L(REPORT_REASONS[r.reason])}</Badge>
        {others > 0 ? <Badge tone="neutral">{t(`${others} more on this ${r.targetType === 'user' ? 'student' : 'item'}`, `${others} بلاغ آخر على نفس ${r.targetType === 'user' ? 'الطالب' : 'العنصر'}`)}</Badge> : null}
        <span className="ms-auto text-[13px] text-muted">{ago(r.createdAt, lang, now)}</span>
      </div>

      <p className="mt-2.5 text-[16px] leading-snug font-semibold [overflow-wrap:anywhere]">
        {listing ? (
          <button type="button" onClick={() => openListing(listing.id)} className="text-start underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise">
            {title}
          </button>
        ) : target ? (
          <button type="button" onClick={() => setProfile(target.id)} className="text-start underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise">
            {title}
          </button>
        ) : (
          title
        )}
      </p>
      {owner ? (
        <p className="text-[13.5px] text-muted">
          {r.targetType === 'listing' ? t('Listed by ', 'نشره ') : t('Posted by ', 'نشره ')}
          <button type="button" onClick={() => setProfile(owner.id)} className="font-medium text-turquoise underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise">
            {L(owner.name)}
          </button>
          {listing?.hidden ? ` · ${t('hidden now', 'مخفي حاليًا')}` : ''}
        </p>
      ) : null}

      {r.note ? <blockquote className="mt-3 rounded-control bg-white p-3 text-[14.5px] text-black/80 [overflow-wrap:anywhere]">{r.note}</blockquote> : null}
      <p className="mt-2 text-[13px] text-muted">{t(`Reported by ${reporter ? reporter.name.en : 'a student'}`, `بلّغ عنه ${reporter ? reporter.name.ar : 'طالب'}`)}</p>

      {open ? (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {listing && !listing.hidden ? (
            <Button size="sm" className={rowBtn} onClick={() => act({ en: 'Listing hidden from students.', ar: 'تم إخفاء الإعلان عن الطلاب.' }, () => setHidden(listing.id, true), t('Listing hidden and report closed', 'تم إخفاء الإعلان وإغلاق البلاغ'))}>
              <EyeOff className="size-4" aria-hidden="true" />
              {t('Hide listing', 'أخفِ الإعلان')}
            </Button>
          ) : null}
          {request ? (
            <Button size="sm" className={rowBtn} onClick={() => act({ en: 'Request removed.', ar: 'تم حذف الطلب.' }, () => removeRequest(request.id), t('Request removed and report closed', 'تم حذف الطلب وإغلاق البلاغ'))}>
              <Trash2 className="size-4" aria-hidden="true" />
              {t('Remove request', 'احذف الطلب')}
            </Button>
          ) : null}
          {(target ?? owner) && !(target ?? owner)?.suspended ? (
            <Button
              size="sm"
              variant={r.targetType === 'user' ? 'primary' : 'secondary'}
              className={rowBtn}
              onClick={() => {
                const u = (target ?? owner) as User
                act({ en: `${u.name.en} suspended.`, ar: `تم إيقاف ${u.name.ar}.` }, () => setSuspended(u.id, true), t(`${u.name.en} suspended and report closed`, `تم إيقاف ${u.name.ar} وإغلاق البلاغ`))
              }}
            >
              {t(`Suspend ${L(((target ?? owner) as User).name).split(' ')[0]}`, `أوقف ${L(((target ?? owner) as User).name).split(' ')[0]}`)}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className={rowBtn}
            onClick={() => {
              resolve(r.id, 'dismissed', gone ? { en: 'Dismissed. The item no longer exists.', ar: 'تم الرفض. العنصر لم يعد موجودًا.' } : { en: 'Dismissed. No rule was broken.', ar: 'تم الرفض. ما فيه مخالفة.' })
              toast(t('Report dismissed', 'تم رفض البلاغ'))
            }}
          >
            {t('Dismiss', 'ارفض البلاغ')}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-[13.5px] font-medium text-turquoise">
          {r.resolution ? L(r.resolution) : r.status === 'dismissed' ? t('Dismissed.', 'تم الرفض.') : t('Action taken.', 'تم اتخاذ إجراء.')}
          {r.resolvedAt ? <span className="font-normal text-muted"> · {ago(r.resolvedAt, lang, now)}</span> : null}
        </p>
      )}
    </li>
  )
}

export function ReportsTab() {
  const t = useT()
  const reports = useStore((s) => s.reports)
  const [show, setShow] = useState<'open' | 'resolved'>('open')
  const open = reports.filter((r) => r.status === 'open').sort((a, b) => a.createdAt - b.createdAt)
  const resolved = reports.filter((r) => r.status !== 'open').sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0))
  const list = show === 'open' ? open : resolved
  return (
    <>
      <div className="mb-4">
        <Segmented
          label={t('Show', 'اعرض')}
          value={show}
          onChange={setShow}
          options={[
            { value: 'open', label: t(`Open (${open.length})`, `مفتوحة (${open.length})`) },
            { value: 'resolved', label: t(`Resolved (${resolved.length})`, `منتهية (${resolved.length})`) },
          ]}
        />
      </div>
      {list.length === 0 ? (
        <Empty>{show === 'open' ? t('No open reports. Students file them from a listing, a request or a profile.', 'ما فيه بلاغات مفتوحة. الطلاب يرفعونها من الإعلان أو الطلب أو الملف.') : t('No resolved reports yet.', 'ما فيه بلاغات منتهية.')}</Empty>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {list.map((r) => (
            <ReportCard key={r.id} r={r} />
          ))}
        </ul>
      )}
    </>
  )
}

// ── Listings ─────────────────────────────────────────────────────────────────

type ListingFilter = 'all' | 'available' | 'active' | 'hidden' | 'reported'

function listingState(l: Listing, t: (en: string, ar: string) => string, sellerSuspended = false) {
  if (sellerSuspended) return { tone: 'error' as const, label: t('Seller suspended', 'البائع موقوف') }
  if (l.hidden) return { tone: 'error' as const, label: t('Hidden', 'مخفي') }
  if (l.status === 'available') return { tone: 'green' as const, label: t('Available', 'متاح') }
  if (l.status === 'reserved') return { tone: 'yellow' as const, label: t('Reserved', 'محجوز') }
  if (l.status === 'rented') return { tone: 'blue' as const, label: t('Out on rent', 'مؤجَّر') }
  return { tone: 'neutral' as const, label: t('Completed', 'تم') }
}

export function ListingsTab() {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow()
  const listings = useStore((s) => s.listings)
  const users = useStore((s) => s.users)
  const reports = useStore((s) => s.reports)
  const setHidden = useStore((s) => s.setListingHidden)
  const remove = useStore((s) => s.adminRemoveListing)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<ListingFilter>('all')

  const reported = new Set(reports.filter((r) => r.status === 'open' && r.targetType === 'listing').map((r) => r.targetId))
  const name = (id: string) => users.find((u) => u.id === id)
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const rows = listings
    .filter((l) => {
      if (filter === 'available' && (l.status !== 'available' || l.hidden)) return false
      if (filter === 'active' && l.status !== 'reserved' && l.status !== 'rented') return false
      if (filter === 'hidden' && !l.hidden) return false
      if (filter === 'reported' && !reported.has(l.id)) return false
      const u = name(l.sellerId)
      const hay = `${l.title.en} ${l.title.ar} ${l.course ?? ''} ${u?.name.en ?? ''} ${u?.name.ar ?? ''}`.toLowerCase()
      return words.every((w) => hay.includes(w))
    })
    .sort((a, b) => Number(reported.has(b.id)) - Number(reported.has(a.id)) || b.createdAt - a.createdAt)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented
          label={t('Filter', 'فلترة')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t(`All (${listings.length})`, `الكل (${listings.length})`) },
            { value: 'available', label: t('Available', 'متاح') },
            { value: 'active', label: t('In a deal', 'في صفقة') },
            { value: 'reported', label: t(`Reported (${reported.size})`, `عليه بلاغ (${reported.size})`) },
            { value: 'hidden', label: t('Hidden', 'مخفي') },
          ]}
        />
        <div className="ms-auto flex min-w-0 flex-1 justify-end">
          <SearchBox value={q} onChange={setQ} label={t('Search title, course or seller', 'ابحث بالعنوان أو المادة أو البائع')} />
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>{t('No listings match. Clear the search or pick another filter.', 'ما فيه إعلانات مطابقة. امسح البحث أو غيّر الفلتر.')}</Empty>
      ) : (
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full border-collapse md:min-w-[560px]">
            <caption className="sr-only">{t('All listings on the market', 'كل إعلانات السوق')}</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className={th}>
                  {t('Listing', 'الإعلان')}
                </th>
                <th scope="col" className={cn(th, 'max-lg:hidden')}>
                  {t('Seller', 'البائع')}
                </th>
                <th scope="col" className={cn(th, 'text-end max-md:hidden')}>
                  {t('Price', 'السعر')}
                </th>
                <th scope="col" className={th}>
                  {t('State', 'الحالة')}
                </th>
                <th scope="col" className={cn(th, 'max-xl:hidden')}>
                  {t('Zone', 'المكان')}
                </th>
                <th scope="col" className={cn(th, 'max-lg:hidden')}>
                  {t('Posted', 'نُشر')}
                </th>
                <th scope="col" className={cn(th, 'text-end')}>
                  {t('Actions', 'إجراءات')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const u = name(l.sellerId)
                const state = listingState(l, t, Boolean(u?.suspended))
                return (
                  <tr key={l.id} className="border-b border-line last:border-0 hover:bg-wash">
                    <td className={cn(td, 'max-w-[320px] max-md:w-full max-md:max-w-0')}>
                      <button type="button" onClick={() => openListing(l.id)} className="flex w-full min-w-0 items-center gap-3 text-start">
                        <Art id={l.id} icon={l.icon} tone={l.tone} photo={l.photo} alt="" className="size-10 shrink-0 rounded-control max-sm:hidden" iconClassName="!size-5" />
                        <span className="min-w-0">
                          <span className="line-clamp-1 font-medium underline-offset-4 hover:underline [overflow-wrap:anywhere]">{L(l.title)}</span>
                          <span className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted">
                            {L(KINDS[l.kind])}
                            <span className="tabular md:hidden">{l.price === 0 ? t('Free', 'مجانًا') : sar(l.price, lang)}</span>
                            <span className="lg:hidden">{u ? L(u.name) : '—'}</span>
                            {reported.has(l.id) ? <span className="font-semibold text-danger-ink">{t('Open report', 'بلاغ مفتوح')}</span> : null}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className={cn(td, 'max-lg:hidden')}>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        {u ? L(u.name) : '—'}
                        {u?.suspended ? <Badge tone="error">{t('Suspended', 'موقوف')}</Badge> : null}
                      </span>
                    </td>
                    <td className={cn(td, 'tabular text-end whitespace-nowrap max-md:hidden')}>{l.price === 0 ? t('Free', 'مجانًا') : sar(l.price, lang)}</td>
                    <td className={td}>
                      <Badge tone={state.tone}>{state.label}</Badge>
                    </td>
                    <td className={cn(td, 'whitespace-nowrap max-xl:hidden')}>{L(zoneById(l.zone).short)}</td>
                    <td className={cn(td, 'whitespace-nowrap text-muted max-lg:hidden')}>{ago(l.createdAt, lang, now)}</td>
                    <td className={td}>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className={rowBtn}
                          onClick={() => {
                            setHidden(l.id, !l.hidden)
                            toast.success(l.hidden ? t('Listing restored', 'تمت إعادة الإعلان') : t('Listing hidden from students', 'تم إخفاء الإعلان عن الطلاب'), {
                              action: { label: t('Undo', 'تراجع'), onClick: () => setHidden(l.id, Boolean(l.hidden)) },
                            })
                          }}
                        >
                          {l.hidden ? t('Restore', 'أعد') : t('Hide', 'أخفِ')}
                        </Button>
                        <button
                          type="button"
                          aria-label={t(`Remove ${l.title.en}`, `احذف ${l.title.ar}`)}
                          title={t('Remove for good', 'حذف نهائي')}
                          className={cn(buttonClass('danger', 'sm', rowBtn), '!px-2.5')}
                          onClick={() => {
                            if (!window.confirm(t(`Remove "${l.title.en}" for good? Pending meetups for it are cancelled. This cannot be undone.`, `تحذف "${l.title.ar}" نهائيًا؟ المواعيد المعلقة عليه تنلغي. ما تقدر تتراجع.`))) return
                            remove(l.id)
                            toast(t('Listing removed', 'تم حذف الإعلان'))
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Students ─────────────────────────────────────────────────────────────────

export function StudentsTab() {
  const t = useT()
  const L = useL()
  const users = useStore((s) => s.users)
  const listings = useStore((s) => s.listings)
  const reports = useStore((s) => s.reports)
  const setSuspended = useStore((s) => s.setSuspended)
  const setVerified = useStore((s) => s.setVerified)
  const setProfile = useUi((s) => s.setProfile)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'unverified' | 'suspended' | 'reported'>('all')

  const students = users.filter((u) => u.role !== 'admin')
  const reported = new Map<string, number>()
  for (const r of reports) if (r.status === 'open' && r.targetType === 'user') reported.set(r.targetId, (reported.get(r.targetId) ?? 0) + 1)
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const rows = students.filter((u) => {
    if (filter === 'unverified' && u.verified) return false
    if (filter === 'suspended' && !u.suspended) return false
    if (filter === 'reported' && !reported.has(u.id)) return false
    const hay = `${u.name.en} ${u.name.ar} ${u.major} ${u.bldg}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented
          label={t('Filter', 'فلترة')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t(`All (${students.length})`, `الكل (${students.length})`) },
            { value: 'unverified', label: t('Not verified', 'غير موثّق') },
            { value: 'reported', label: t(`Reported (${reported.size})`, `عليه بلاغ (${reported.size})`) },
            { value: 'suspended', label: t('Suspended', 'موقوف') },
          ]}
        />
        <div className="ms-auto flex min-w-0 flex-1 justify-end">
          <SearchBox value={q} onChange={setQ} label={t('Search name, major or building', 'ابحث بالاسم أو التخصص أو المبنى')} />
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>{t('No students match.', 'ما فيه طلاب مطابقين.')}</Empty>
      ) : (
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full border-collapse md:min-w-[540px]">
            <caption className="sr-only">{t('Student accounts', 'حسابات الطلاب')}</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className={th}>
                  {t('Student', 'الطالب')}
                </th>
                <th scope="col" className={cn(th, 'max-md:hidden')}>
                  {t('Building', 'المبنى')}
                </th>
                <th scope="col" className={cn(th, 'text-end max-md:hidden')}>
                  {t('Listings', 'إعلانات')}
                </th>
                <th scope="col" className={cn(th, 'text-end max-lg:hidden')}>
                  {t('Deals', 'صفقات')}
                </th>
                <th scope="col" className={cn(th, 'text-end max-lg:hidden')}>
                  {t('On-time returns', 'إرجاع في الوقت')}
                </th>
                <th scope="col" className={cn(th, 'max-md:hidden')}>
                  {t('Status', 'الحالة')}
                </th>
                <th scope="col" className={cn(th, 'text-end')}>
                  {t('Actions', 'إجراءات')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const n = listings.filter((l) => l.sellerId === u.id && l.status !== 'completed').length
                const rep = reported.get(u.id) ?? 0
                return (
                  <tr key={u.id} className="border-b border-line last:border-0 hover:bg-wash">
                    <td className={cn(td, 'max-md:w-full max-md:max-w-0')}>
                      <button type="button" onClick={() => setProfile(u.id)} className="flex w-full min-w-0 items-center gap-3 text-start">
                        <Avatar user={u} className="size-9 text-[14px] max-sm:hidden" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium underline-offset-4 hover:underline">{L(u.name)}</span>
                          <span className="flex flex-wrap items-center gap-x-2">
                            <MajorTag user={u} />
                            <span className="md:hidden">
                              <UserStatus user={u} />
                            </span>
                            {rep > 0 ? <span className="text-[12.5px] font-semibold text-danger-ink">{t(`${rep} open ${rep === 1 ? 'report' : 'reports'}`, `${rep} بلاغ مفتوح`)}</span> : null}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className={cn(td, 'tabular whitespace-nowrap max-md:hidden')}>{u.bldg}</td>
                    <td className={cn(td, 'tabular text-end max-md:hidden')}>{n}</td>
                    <td className={cn(td, 'tabular text-end max-lg:hidden')}>{u.stats.deals}</td>
                    <td className={cn(td, 'tabular text-end max-lg:hidden')}>{u.stats.rentals === 0 ? '—' : `${u.stats.onTime}/${u.stats.rentals}`}</td>
                    <td className={cn(td, 'max-md:hidden')}>
                      <UserStatus user={u} />
                    </td>
                    <td className={td}>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className={rowBtn}
                          onClick={() => {
                            setVerified(u.id, !u.verified)
                            toast.success(u.verified ? t(`Verification removed from ${u.name.en}`, `تم إلغاء توثيق ${u.name.ar}`) : t(`${u.name.en} verified`, `تم توثيق ${u.name.ar}`))
                          }}
                        >
                          {u.verified ? null : <BadgeCheck className="size-4" aria-hidden="true" />}
                          {u.verified ? t('Unverify', 'ألغِ التوثيق') : t('Verify', 'وثّق')}
                        </Button>
                        <Button
                          size="sm"
                          variant={u.suspended ? 'secondary' : 'danger'}
                          className={rowBtn}
                          onClick={() => {
                            setSuspended(u.id, !u.suspended)
                            toast.success(
                              u.suspended ? t(`${u.name.en} reinstated`, `تم تفعيل ${u.name.ar}`) : t(`${u.name.en} suspended. Their listings are hidden.`, `تم إيقاف ${u.name.ar}. إعلاناته مخفية.`),
                              { action: { label: t('Undo', 'تراجع'), onClick: () => setSuspended(u.id, Boolean(u.suspended)) } },
                            )
                          }}
                        >
                          {u.suspended ? t('Reinstate', 'فعّل') : t('Suspend', 'أوقف')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Deals and rentals ────────────────────────────────────────────────────────

export function RentalsTab() {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow(15_000)
  const deals = useStore((s) => s.deals)
  const listings = useStore((s) => s.listings)
  const users = useStore((s) => s.users)
  const setProfile = useUi((s) => s.setProfile)

  const active = deals
    .filter((d) => d.status === 'reserved' || d.status === 'rented')
    .map((d) => {
      const due = d.status === 'rented' ? (d.returnAt ?? d.meetAt) : d.meetAt
      return { d, due, late: due < now }
    })
    // Overdue first, then whatever is due soonest.
    .sort((a, b) => Number(b.late) - Number(a.late) || a.due - b.due)
  const user = (id: string) => users.find((u) => u.id === id)

  if (active.length === 0) return <Empty>{t('No meetups or rentals in progress.', 'ما فيه مواعيد أو إيجارات جارية.')}</Empty>

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full border-collapse md:min-w-[560px]">
        <caption className="sr-only">{t('Meetups and rentals in progress', 'المواعيد والإيجارات الجارية')}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={th}>
              {t('Item', 'الغرض')}
            </th>
            <th scope="col" className={cn(th, 'max-md:hidden')}>
              {t('Buyer or borrower', 'المشتري أو المستأجر')}
            </th>
            <th scope="col" className={cn(th, 'max-lg:hidden')}>
              {t('Seller or owner', 'البائع أو المالك')}
            </th>
            <th scope="col" className={cn(th, 'text-end max-md:hidden')}>
              {t('Amount', 'المبلغ')}
            </th>
            <th scope="col" className={th}>
              {t('Due', 'الموعد')}
            </th>
            <th scope="col" className={cn(th, 'text-end')}>
              {t('Actions', 'إجراءات')}
            </th>
          </tr>
        </thead>
        <tbody>
          {active.map(({ d, due, late }) => {
            const l = listings.find((x) => x.id === d.listingId)
            const buyer = user(d.buyerId)
            const seller = user(d.sellerId)
            const rented = d.status === 'rented'
            const title = l ? L(l.title) : t('Removed listing', 'إعلان محذوف')
            const reminder =
              lang === 'ar'
                ? `السلام عليكم ${buyer?.name.ar ?? ''}، معك مشرف سوق البترول. موعد إرجاع "${l?.title.ar ?? ''}" فات. رجّعه للمالك اليوم لو سمحت.`
                : `Salam ${buyer?.name.en ?? ''}, this is the KFUPM Market admin. "${l?.title.en ?? ''}" is past its return time. Please return it to the owner today.`
            return (
              <tr key={d.id} className="border-b border-line last:border-0 hover:bg-wash">
                <td className={cn(td, 'max-w-[280px] max-md:w-full max-md:max-w-0')}>
                  <button type="button" disabled={!l} onClick={() => l && openListing(l.id)} className="line-clamp-2 text-start font-medium underline-offset-4 hover:underline [overflow-wrap:anywhere]">
                    {title}
                  </button>
                  <span className="block text-[12.5px] text-muted">
                    {rented ? t('Out on rent', 'مؤجَّر') : d.type === 'rent' ? t('Rental reserved', 'إيجار محجوز') : t('Sale reserved', 'بيع محجوز')}
                    {buyer ? <span className="md:hidden"> · {L(buyer.name)}</span> : null}
                  </span>
                </td>
                <td className={cn(td, 'max-md:hidden')}>
                  {buyer ? (
                    <button type="button" onClick={() => setProfile(buyer.id)} className="text-start underline-offset-4 hover:underline">
                      {L(buyer.name)}
                    </button>
                  ) : (
                    '—'
                  )}
                </td>
                <td className={cn(td, 'max-lg:hidden')}>{seller ? L(seller.name) : '—'}</td>
                <td className={cn(td, 'tabular text-end whitespace-nowrap max-md:hidden')}>{d.total === 0 ? t('Free', 'مجانًا') : sar(d.total, lang)}</td>
                <td className={td}>
                  <span className={cn('block font-semibold whitespace-nowrap', late ? 'text-danger-ink' : 'text-turquoise')}>
                    {late ? (rented ? t(`Overdue ${duration(now - due, lang)}`, `متأخر ${duration(now - due, lang)}`) : t(`Meetup passed ${duration(now - due, lang)} ago`, `فات الموعد قبل ${duration(now - due, lang)}`)) : t(`In ${duration(due - now, lang)}`, `بعد ${duration(due - now, lang)}`)}
                  </span>
                  <span className="block text-[12.5px] whitespace-nowrap text-muted">{dayTime(due, lang, now)}</span>
                </td>
                <td className={td}>
                  <div className="flex justify-end">
                    {late && rented && buyer ? (
                      <a href={waLink(buyer, reminder)} target="_blank" rel="noreferrer" className={buttonClass('whatsapp', 'sm', rowBtn)}>
                        <MessageCircle className="size-4 text-green" aria-hidden="true" />
                        {t('Remind', 'ذكّر')}
                      </a>
                    ) : (
                      <span className="text-[13px] whitespace-nowrap text-muted">{t('On track', 'ماشي تمام')}</span>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Announcement ─────────────────────────────────────────────────────────────

export function AnnouncementTab() {
  const t = useT()
  const lang = useLang()
  const now = useNow()
  const current = useStore((s) => s.announcement)
  const setAnnouncement = useStore((s) => s.setAnnouncement)
  const [en, setEn] = useState(current?.text.en ?? '')
  const [ar, setAr] = useState(current?.text.ar ?? '')
  const [tone, setTone] = useState<Announcement['tone']>(current?.tone ?? 'info')
  const [tried, setTried] = useState(false)
  const errEn = tried && en.trim().length < 8 ? t('Write the notice in English, at least 8 characters.', 'اكتب التنبيه بالإنجليزي، 8 حروف على الأقل.') : undefined
  const errAr = tried && ar.trim().length < 8 ? t('Write the notice in Arabic, at least 8 characters.', 'اكتب التنبيه بالعربي، 8 حروف على الأقل.') : undefined
  const unchanged = current != null && current.text.en === en.trim() && current.text.ar === ar.trim() && current.tone === tone

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setTried(true)
          if (en.trim().length < 8 || ar.trim().length < 8) return
          setAnnouncement({ text: { en: en.trim(), ar: ar.trim() }, tone })
          toast.success(t('Announcement published to every student', 'تم نشر التنبيه لكل الطلاب'))
        }}
      >
        <p className="max-w-[60ch] text-[14.5px] text-muted">
          {t('One notice shows at the top of every section until a student closes it. Publishing a new one replaces the old and shows again to everyone.', 'تنبيه واحد يطلع فوق كل قسم لين يقفله الطالب. نشر تنبيه جديد يستبدل القديم ويظهر للكل من جديد.')}
        </p>
        <Field label={t('Notice in English', 'التنبيه بالإنجليزي')} error={errEn} hint={`${en.length}/200`}>
          {({ id, describedBy, invalid }) => <textarea id={id} dir="ltr" lang="en" className="field min-h-24 resize-y" maxLength={200} value={en} onChange={(e) => setEn(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label={t('Notice in Arabic', 'التنبيه بالعربي')} error={errAr} hint={`${ar.length}/200`}>
          {({ id, describedBy, invalid }) => <textarea id={id} dir="rtl" lang="ar" className="field min-h-24 resize-y" maxLength={200} value={ar} onChange={(e) => setAr(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <div>
          <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Kind of notice', 'نوع التنبيه')}</p>
          <Segmented
            label={t('Kind of notice', 'نوع التنبيه')}
            value={tone}
            onChange={setTone}
            options={[
              { value: 'info', label: t('Information', 'معلومة') },
              { value: 'warning', label: t('Warning', 'تحذير') },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={unchanged}>
            {current ? t('Replace announcement', 'استبدل التنبيه') : t('Publish announcement', 'انشر التنبيه')}
          </Button>
          {current ? (
            <Button
              variant="danger"
              onClick={() => {
                const prev = current
                setAnnouncement(null)
                toast(t('Announcement taken down', 'تمت إزالة التنبيه'), { action: { label: t('Undo', 'تراجع'), onClick: () => setAnnouncement({ text: prev.text, tone: prev.tone }) } })
              }}
            >
              {t('Take it down', 'أزل التنبيه')}
            </Button>
          ) : null}
        </div>
      </form>

      <section aria-labelledby="ann-preview">
        <h2 id="ann-preview" className="mb-3 text-[18px] font-bold text-turquoise">
          {t('What students see', 'اللي يشوفه الطلاب')}
        </h2>
        {en.trim() || ar.trim() ? (
          <div className="flex flex-col gap-2">
            {(['en', 'ar'] as const).map((l) => (
              <p key={l} dir={l === 'ar' ? 'rtl' : 'ltr'} lang={l} className={cn('rounded-card px-4 py-3 text-[14.5px] [overflow-wrap:anywhere]', tone === 'warning' ? 'bg-warning/50' : 'bg-info/35')}>
                <span className="font-semibold text-turquoise">{l === 'ar' ? 'من مشرفي السوق: ' : 'From the market admins: '}</span>
                {(l === 'ar' ? ar : en) || '…'}
              </p>
            ))}
          </div>
        ) : (
          <Empty>{t('Nothing to preview yet. Write the notice in both languages.', 'ما فيه شي للمعاينة. اكتب التنبيه باللغتين.')}</Empty>
        )}
        <p className="mt-3 text-[13px] text-muted">{current ? t(`Live now. Published ${ago(current.createdAt, lang, now)}.`, `ظاهر الآن. نُشر ${ago(current.createdAt, lang, now)}.`) : t('No announcement is live.', 'ما فيه تنبيه ظاهر حاليًا.')}</p>
      </section>
    </div>
  )
}

// ── Activity log ─────────────────────────────────────────────────────────────

export function Activity() {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow()
  const audit = useStore((s) => s.audit)
  const users = useStore((s) => s.users)
  if (audit.length === 0) return <Empty>{t('No admin actions yet.', 'ما فيه إجراءات للحين.')}</Empty>
  return (
    <>
      <p className="mb-3 text-[13.5px] text-muted">{t(`Last ${audit.length} admin ${audit.length === 1 ? 'action' : 'actions'}, newest first.`, `آخر ${audit.length} إجراء إداري، الأحدث أول.`)}</p>
      <ol className="divide-y divide-line">
        {audit.map((a) => {
          const who = users.find((u) => u.id === a.adminId)
          return (
            <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 text-[14px]">
              <span className="font-semibold text-turquoise">{L(a.action)}</span>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{a.target}</span>
              <span className="text-[13px] whitespace-nowrap text-muted">
                {who ? L(who.name) : a.adminId} · {dayTime(a.at, lang, now)}
              </span>
            </li>
          )
        })}
      </ol>
    </>
  )
}
