import { ArrowDownUp, Search, Siren, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CATEGORIES, CONDITIONS, COURSE_PREFIXES, PAYMENTS } from '../data/categories'
import { BELTS, ZONES, walkMinutes } from '../data/zones'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { NamedIcon } from '../components/ui/Icon'
import { Sheet } from '../components/ui/Overlay'
import { Chip } from '../components/ui/Segmented'
import { cn } from '../lib/cn'
import { num } from '../lib/format'
import { useL, useT } from '../lib/i18n'
import type { CategoryId, Condition, Listing, Payment, ZoneId } from '../lib/types'
import { usePersona, useStore } from '../store/useStore'

export function PageHeader({ title, lead, action }: { title: string; lead: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 max-w-[60ch]">
        <h1 className="text-[24px] font-black text-turquoise sm:text-[30px]">{title}</h1>
        <p className="mt-1 text-[15px] text-muted">{lead}</p>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-beige px-6 py-12 text-center">
      <img src="./brand/matrix-beige.svg" alt="" width={1000} height={1000} loading="lazy" className="absolute inset-0 size-full object-cover opacity-25" />
      <div className="relative mx-auto max-w-[44ch]">
        <h2 className="text-[20px] font-bold text-turquoise">{title}</h2>
        <p className="mt-1.5 text-[15px] text-black/75">{body}</p>
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}

export function FinalsBanner({ count, noun }: { count: number; noun: string }) {
  const t = useT()
  const setFinals = useStore((s) => s.setFinals)
  return (
    <div className="fade-in relative mb-5 overflow-hidden rounded-card bg-yellow text-black" role="status">
      <img src="./brand/matrix-yellow.jpg" alt="" width={1600} height={480} className="absolute inset-y-0 end-0 hidden h-full w-[30%] object-cover md:block rtl:-scale-x-100" style={{ clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' }} />
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:max-w-[72%]">
        <Siren className="size-6 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[18px] font-bold">{t('Finals mode is on', 'وضع الفاينلات شغّال')}</p>
          <p className="text-[14px]">
            {t(`${count} ${noun} ready for pickup within 15 minutes, nearest to your building first.`, `${count} ${noun} جاهزة للاستلام خلال 15 دقيقة، والأقرب لسكنك أول.`)}
          </p>
        </div>
        <button type="button" onClick={() => setFinals(false)} className="press inline-flex min-h-11 items-center rounded-control bg-black px-3.5 text-[14px] font-semibold text-white hover:bg-black/85">
          {t('Turn off', 'إيقاف')}
        </button>
      </div>
    </div>
  )
}

export type Sort = 'new' | 'low' | 'high' | 'near'

export interface Filters {
  q: string
  category: CategoryId | 'all'
  course: string
  conditions: Condition[]
  zone: ZoneId | 'all'
  payment: Payment | 'all'
  maxPrice: number | null
  availableOnly: boolean
  sort: Sort
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  category: 'all',
  course: 'all',
  conditions: [],
  zone: 'all',
  payment: 'all',
  maxPrice: null,
  availableOnly: false,
  sort: 'new',
}

export function countActive(f: Filters): number {
  return (
    (f.course !== 'all' ? 1 : 0) +
    (f.conditions.length ? 1 : 0) +
    (f.zone !== 'all' ? 1 : 0) +
    (f.payment !== 'all' ? 1 : 0) +
    (f.maxPrice != null ? 1 : 0) +
    (f.availableOnly ? 1 : 0)
  )
}

function matchesText(l: Listing, q: string): boolean {
  if (!q) return true
  const hay = [l.title.en, l.title.ar, l.desc.en, l.desc.ar, l.course ?? '', ...(l.specs?.flatMap((s) => [s.k, s.v]) ?? []), ...(l.bundle?.items.flatMap((i) => [i.name.en, i.name.ar]) ?? [])]
    .join(' ')
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w))
}

/** Filter and sort. In Finals mode only instant, available items remain, nearest first. */
export function useFiltered(listings: Listing[], f: Filters): Listing[] {
  const finals = useStore((s) => s.finals)
  const me = usePersona()
  return useMemo(() => {
    const out = listings.filter((l) => {
      if (finals && !(l.instant && l.status === 'available')) return false
      if (f.category !== 'all' && l.category !== f.category) return false
      if (f.course !== 'all' && !(l.course ?? '').toUpperCase().includes(f.course)) return false
      if (f.conditions.length && !f.conditions.includes(l.condition)) return false
      if (f.zone !== 'all' && l.zone !== f.zone) return false
      if (f.payment !== 'all' && !l.payment.includes(f.payment)) return false
      if (f.maxPrice != null && l.price > f.maxPrice) return false
      if (f.availableOnly && l.status !== 'available') return false
      return matchesText(l, f.q)
    })
    const sort: Sort = finals ? 'near' : f.sort
    const by: Record<Sort, (a: Listing, b: Listing) => number> = {
      new: (a, b) => b.createdAt - a.createdAt,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      near: (a, b) => walkMinutes(me.home, a.zone) - walkMinutes(me.home, b.zone) || b.createdAt - a.createdAt,
    }
    // Finished deals sink to the bottom whatever the sort.
    return out.sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || by[sort](a, b))
  }, [listings, f, finals, me.home])
}

/** Controls row: the left group wraps above the search and sort group on narrow screens. */
export function Toolbar({ left, children }: { left?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      {left ? <div className="min-w-0">{left}</div> : null}
      <div className="flex min-w-0 flex-wrap items-center gap-2 lg:ms-auto lg:flex-1 lg:justify-end">{children}</div>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const t = useT()
  return (
    <div className="relative min-w-[150px] flex-1 lg:max-w-[340px]">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-turquoise/70" aria-hidden="true" />
      <input type="search" className="field !ps-10 !pe-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${placeholder}…`} aria-label={placeholder} enterKeyHint="search" autoComplete="off" name="q" />
      {value ? (
        <button type="button" onClick={() => onChange('')} aria-label={t('Clear search', 'امسح البحث')} className="press absolute end-0 top-0 inline-grid size-11 place-items-center text-turquoise">
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export function CategoryChips({ value, onChange, only }: { value: CategoryId | 'all'; onChange: (v: CategoryId | 'all') => void; only?: CategoryId[] }) {
  const t = useT()
  const L = useL()
  const cats = only ? CATEGORIES.filter((c) => only.includes(c.id)) : CATEGORIES
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto sm:flex-wrap" role="group" aria-label={t('Category', 'التصنيف')}>
      <Chip on={value === 'all'} onClick={() => onChange('all')}>
        {t('Everything', 'الكل')}
      </Chip>
      {cats.map((c) => (
        <Chip key={c.id} on={value === c.id} onClick={() => onChange(value === c.id ? 'all' : c.id)}>
          <NamedIcon name={c.icon} className="size-4" />
          {L(c.name)}
        </Chip>
      ))}
    </div>
  )
}

export function SortSelect({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  const t = useT()
  const finals = useStore((s) => s.finals)
  return (
    <label className="relative inline-flex min-w-0 shrink-0 items-center">
      <span className="sr-only">{t('Sort by', 'الترتيب')}</span>
      <ArrowDownUp className="pointer-events-none absolute start-2.5 size-4 text-turquoise" aria-hidden="true" />
      <select className="field !min-h-9 !w-auto !border-transparent !py-1 !ps-8 text-[13.5px] font-semibold text-turquoise hover:!border-turquoise/40" value={finals ? 'near' : value} disabled={finals} onChange={(e) => onChange(e.target.value as Sort)}>
        <option value="new">{t('Newest', 'الأحدث')}</option>
        <option value="low">{t('Price: low to high', 'السعر: من الأقل')}</option>
        <option value="high">{t('Price: high to low', 'السعر: من الأعلى')}</option>
        <option value="near">{t('Nearest to me', 'الأقرب لي')}</option>
      </select>
    </label>
  )
}

export function FilterButton({ f, set, hideCondition }: { f: Filters; set: (f: Filters) => void; hideCondition?: boolean }) {
  const t = useT()
  const L = useL()
  const [open, setOpen] = useState(false)
  const n = countActive(f)
  const upd = (p: Partial<Filters>) => set({ ...f, ...p })
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('press inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border px-3.5 text-[14px] font-semibold', n ? 'border-turquoise bg-turquoise text-white' : 'border-turquoise/30 text-turquoise hover:border-turquoise/60')}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {t('Filters', 'فلترة')}
        {n ? <span className="tabular inline-grid min-w-5 place-items-center rounded-full bg-white px-1 text-[12px] leading-5 text-turquoise">{n}</span> : null}
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t('Filters', 'فلترة')}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => set({ ...EMPTY_FILTERS, q: f.q, category: f.category, sort: f.sort })} disabled={n === 0}>
              {t('Clear filters', 'امسح الفلاتر')}
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              {t('Show results', 'اعرض النتائج')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          <Field label={t('Course', 'المادة')} hint={t('Matches the course tag on a listing.', 'يطابق وسم المادة في الإعلان.')}>
            {({ id, describedBy }) => (
              <select id={id} className="field" value={f.course} onChange={(e) => upd({ course: e.target.value })} aria-describedby={describedBy}>
                <option value="all">{t('Any course', 'أي مادة')}</option>
                {COURSE_PREFIXES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </Field>

          {hideCondition ? null : (
            <fieldset>
              <legend className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Condition', 'الحالة')}</legend>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CONDITIONS) as Condition[]).map((c) => {
                  const on = f.conditions.includes(c)
                  return (
                    <Chip key={c} on={on} onClick={() => upd({ conditions: on ? f.conditions.filter((x) => x !== c) : [...f.conditions, c] })}>
                      {L(CONDITIONS[c])}
                    </Chip>
                  )
                })}
              </div>
            </fieldset>
          )}

          <Field label={t('Meetup zone', 'مكان التسليم')}>
            {({ id }) => (
              <select id={id} className="field" value={f.zone} onChange={(e) => upd({ zone: e.target.value as ZoneId | 'all' })}>
                <option value="all">{t('Anywhere on campus', 'أي مكان في الجامعة')}</option>
                {(['academic', 'housing', 'hubs'] as const).map((belt) => (
                  <optgroup key={belt} label={L(BELTS[belt])}>
                    {ZONES.filter((z) => z.belt === belt).map((z) => (
                      <option key={z.id} value={z.id}>
                        {L(z.name)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </Field>

          <Field label={t('Settlement at meetup', 'طريقة الدفع عند التسليم')}>
            {({ id }) => (
              <select id={id} className="field" value={f.payment} onChange={(e) => upd({ payment: e.target.value as Payment | 'all' })}>
                <option value="all">{t('Any method', 'أي طريقة')}</option>
                {(Object.keys(PAYMENTS) as Payment[]).map((p) => (
                  <option key={p} value={p}>
                    {L(PAYMENTS[p])}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label={t('Highest price, SAR', 'أعلى سعر بالريال')} hint={f.maxPrice != null ? t(`Up to SAR ${num(f.maxPrice)}`, `لين ${num(f.maxPrice)} ر.س`) : t('Leave empty for no limit.', 'اتركه فاضي بدون حد.')}>
            {({ id, describedBy }) => (
              <input
                id={id}
                className="field"
                type="number"
                inputMode="numeric"
                min={0}
                step={10}
                placeholder="500"
                value={f.maxPrice ?? ''}
                aria-describedby={describedBy}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Math.max(0, Number(e.target.value))
                  upd({ maxPrice: v != null && Number.isFinite(v) ? v : null })
                }}
              />
            )}
          </Field>

          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input type="checkbox" className="size-5 accent-turquoise" checked={f.availableOnly} onChange={(e) => upd({ availableOnly: e.target.checked })} />
            {t('Only show what is available now', 'اعرض المتاح الحين فقط')}
          </label>
        </div>
      </Sheet>
    </>
  )
}

export function ResultCount({ n, noun, sort, onSort }: { n: number; noun: string; sort?: Sort; onSort?: (s: Sort) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="tabular text-[13.5px] text-muted" aria-live="polite">
        {n} {noun}
      </p>
      {sort && onSort ? <SortSelect value={sort} onChange={onSort} /> : null}
    </div>
  )
}
