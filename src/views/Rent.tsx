import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { ListingGrid } from '../components/listing/ListingCard'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Segmented'
import { RATE_UNITS } from '../data/categories'
import { useDebounced, useListings, useNow } from '../lib/hooks'
import { useL, useT } from '../lib/i18n'
import type { RateUnit } from '../lib/types'
import { useStore } from '../store/useStore'
import { useUi } from '../store/useUi'
import { CategoryChips, EMPTY_FILTERS, EmptyState, FilterButton, FinalsBanner, type Filters, PageHeader, ResultCount, SearchInput, Toolbar, useFiltered } from './shared'

const UNITS: RateUnit[] = ['exam', 'hour', 'day', 'weekend', 'week']

export function Rent() {
  const t = useT()
  const L = useL()
  const now = useNow()
  const all = useListings()
  const finals = useStore((s) => s.finals)
  const openStudio = useUi((s) => s.openStudio)
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const [unit, setUnit] = useState<RateUnit | null>(null)
  const q = useDebounced(f.q)

  const pool = all.filter((l) => l.kind === 'rent' && (unit == null || l.rent?.rates[unit] != null))
  const shown = useFiltered(pool, { ...f, q })

  const steps = [
    { h: t('Pick your window', 'اختر المدة'), p: t('Choose pickup and return times. The total and the deposit update as you go.', 'حدد وقت الاستلام والإرجاع. المجموع والتأمين يتحدثون معك.') },
    { h: t('Meet and pay in person', 'تقابلوا وادفع وجهًا لوجه'), p: t('Hand over the fee and the deposit at the campus spot you agreed on.', 'سلّم الإيجار والتأمين في المكان اللي اتفقتوا عليه داخل الجامعة.') },
    { h: t('Return on time', 'رجّعه في وقته'), p: t('A countdown runs in your deals. Return it and the deposit comes back.', 'عدّاد تنازلي يشتغل في صفقاتك. رجّعه ويرجع لك التأمين.') },
  ]

  return (
    <>
      {finals ? <FinalsBanner count={shown.length} noun={t('rentals', 'إيجار')} /> : null}
      <PageHeader
        title={t('Rentals', 'الإيجار')}
        lead={t('Borrow for an exam, a lab, a weekend or a week. Pay the fee and a refundable deposit at pickup.', 'استأجر لاختبار أو لاب أو ويكند أو أسبوع. تدفع الإيجار وتأمين مسترد عند الاستلام.')}
        action={
          <Button variant="secondary" onClick={() => openStudio('rent')}>
            {t('Rent out your gear', 'أجّر أغراضك')}
          </Button>
        }
      />

      {finals ? null : (
        <details className="group mb-5 rounded-card bg-wash">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 text-[14.5px] font-semibold text-turquoise [&::-webkit-details-marker]:hidden">
            {t('How renting works', 'كيف يشتغل الإيجار')}
            <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ol className="grid gap-x-6 gap-y-3 px-4 pt-1 pb-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={i}>
                <h2 className="!font-sans text-[14.5px] font-bold tracking-normal text-turquoise">{s.h}</h2>
                <p className="mt-0.5 text-[14px] text-muted">{s.p}</p>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="mb-4 flex flex-col gap-3">
        <Toolbar
          left={
            <div className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto" role="group" aria-label={t('Rate', 'نوع السعر')}>
            {UNITS.map((u) => (
              <Chip key={u} on={unit === u} onClick={() => setUnit(unit === u ? null : u)}>
                {L(RATE_UNITS[u].per)}
              </Chip>
            ))}
          </div>
          }
        >
          <SearchInput value={f.q} onChange={(v) => setF({ ...f, q: v })} placeholder={t('Search rentals', 'ابحث في الإيجار')} />
            <FilterButton f={f} set={setF} hideCondition />
        </Toolbar>
        <CategoryChips value={f.category} onChange={(category) => setF({ ...f, category })} />
        <ResultCount n={shown.length} noun={t(shown.length === 1 ? 'rental' : 'rentals', 'إعلان إيجار')} sort={f.sort} onSort={(sort) => setF({ ...f, sort })} />
      </div>

      <ListingGrid
        heading={t('Rentals available', 'الإيجارات المتاحة')}
        listings={shown}
        now={now}
        empty={
          <EmptyState
            title={finals ? t('No rentals ready in 15 minutes', 'ما فيه إيجار جاهز خلال 15 دقيقة') : t('No rentals match', 'ما فيه إيجار مطابق')}
            body={t('Post an urgent request. Students who own one get it at the top of their board.', 'انشر طلب عاجل. اللي عنده الغرض يشوفه أول شي في لوحة الطلبات.')}
            action={<Button onClick={() => openStudio('request')}>{t('Post a request', 'انشر طلب')}</Button>}
          />
        }
      />
    </>
  )
}
