import { ArrowRight, Pause, Play, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { ListingGrid } from '../components/listing/ListingCard'
import { Button } from '../components/ui/Button'
import { Segmented } from '../components/ui/Segmented'
import { useDebounced, useListings, useNow } from '../lib/hooks'
import { useT } from '../lib/i18n'
import { useStore } from '../store/useStore'
import { useUi } from '../store/useUi'
import { CategoryChips, EMPTY_FILTERS, EmptyState, FilterButton, FinalsBanner, type Filters, PageHeader, ResultCount, SearchInput, SortSelect, Toolbar, useFiltered } from './shared'

type Tab = 'all' | 'sale' | 'bundle' | 'free' | 'saved'

function Hero() {
  const t = useT()
  const openStudio = useUi((s) => s.openStudio)
  const video = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)
  return (
    <section className="relative mb-6 overflow-hidden rounded-card bg-turquoise text-white" aria-label={t('Welcome', 'مرحبًا')}>
      <video
        ref={video}
        className="absolute inset-y-0 end-0 hidden h-full w-[58%] object-cover motion-reduce:hidden sm:block rtl:-scale-x-100"
        src="./brand/matrix-loop.mp4"
        poster="./brand/matrix-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />
      <img src="./brand/matrix-poster.jpg" alt="" width={1280} height={554} className="absolute inset-y-0 end-0 hidden h-full w-[58%] object-cover motion-reduce:sm:block rtl:-scale-x-100" />
      <div className="absolute inset-y-0 start-0 hidden w-[62%] bg-turquoise sm:block" style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }} aria-hidden="true" />
      <button
        type="button"
        onClick={() => {
          const v = video.current
          if (!v) return
          if (v.paused) void v.play()
          else v.pause()
          setPaused(v.paused)
        }}
        aria-pressed={paused}
        aria-label={paused ? t('Play background animation', 'شغّل حركة الخلفية') : t('Pause background animation', 'أوقف حركة الخلفية')}
        className="press absolute end-2 bottom-2 z-10 hidden size-11 place-items-center rounded-full text-white/85 hover:bg-white/15 hover:text-white motion-reduce:hidden sm:inline-grid"
      >
        {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      </button>
      <div className="relative max-w-[560px] px-5 py-7 sm:px-8 sm:py-9">
        <h1 className="text-[26px] font-black text-white sm:text-[32px]">{t('Need it on campus? A student has it.', 'تحتاجه في الجامعة؟ عند طالب مثلك.')}</h1>
        <p className="mt-2 max-w-[46ch] text-[15.5px] text-beige">
          {t(
            'Buy, rent or borrow from students in the dorms and up the hill. Meet on campus and settle face to face.',
            'اشترِ أو استأجر أو استعر من طلاب السكن والجبل. تتقابلون داخل الجامعة والحساب بينكم وجهًا لوجه.',
          )}
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button type="button" onClick={() => openStudio('sale')} className="press inline-flex min-h-12 items-center gap-2 rounded-control bg-beige px-5 text-[16px] font-semibold text-turquoise hover:bg-white">
            <Plus className="size-5" aria-hidden="true" />
            {t('List something', 'اعرض غرضك')}
          </button>
          <a href="#/requests" className="press inline-flex min-h-12 items-center gap-2 rounded-control border border-beige/60 px-5 text-[16px] font-semibold text-white hover:bg-white/10">
            {t('Ask for something', 'اطلب غرض')}
            <ArrowRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

export function Market() {
  const t = useT()
  const now = useNow()
  const all = useListings()
  const finals = useStore((s) => s.finals)
  const favorites = useStore((s) => s.favorites[s.personaId] ?? [])
  const openStudio = useUi((s) => s.openStudio)
  const [tab, setTab] = useState<Tab>('all')
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const q = useDebounced(f.q)

  const pool = all.filter((l) => {
    if (tab === 'saved') return favorites.includes(l.id)
    if (!['sale', 'bundle', 'free'].includes(l.kind)) return false
    return tab === 'all' || l.kind === tab
  })
  const shown = useFiltered(pool, { ...f, q })
  const dirty = f.q !== '' || f.category !== 'all' || tab !== 'all' || JSON.stringify({ ...f, q: '', category: 'all', sort: 'new' }) !== JSON.stringify(EMPTY_FILTERS)

  return (
    <>
      {finals ? <FinalsBanner count={shown.length} noun={t('items', 'غرض')} /> : <Hero />}
      {finals ? <PageHeader title={t('Market', 'السوق')} lead={t('Calculators, notes and chargers you can get before the exam starts.', 'حاسبات ومذكرات وشواحن تلحق عليها قبل يبدأ الاختبار.')} /> : null}

      <div className="mb-4 flex flex-col gap-3">
        <Toolbar
          left={
            <Segmented
            label={t('Deal type', 'نوع العرض')}
            value={tab}
            onChange={setTab}
            options={[
              { value: 'all', label: t('All', 'الكل') },
              { value: 'sale', label: t('Buy', 'شراء') },
              { value: 'bundle', label: t('Bundles', 'باقات') },
              { value: 'free', label: t('Free', 'لوجه الله') },
              { value: 'saved', label: t('Saved', 'المحفوظات') },
            ]}
          />
          }
        >
          <SearchInput value={f.q} onChange={(v) => setF({ ...f, q: v })} placeholder={t('Search this list', 'ابحث في القائمة')} />
            <FilterButton f={f} set={setF} />
            <SortSelect value={f.sort} onChange={(sort) => setF({ ...f, sort })} />
        </Toolbar>
        <CategoryChips value={f.category} onChange={(category) => setF({ ...f, category })} only={['academic', 'hardware', 'dorm', 'mobility', 'gaming', 'sports', 'camping']} />
        <ResultCount n={shown.length} noun={t(shown.length === 1 ? 'listing' : 'listings', 'إعلان')} />
      </div>

      <ListingGrid
        heading={t('Listings', 'الإعلانات')}
        listings={shown}
        now={now}
        empty={
          tab === 'saved' && !dirty ? (
            <EmptyState title={t('Nothing saved yet', 'ما حفظت شي للحين')} body={t('Tap the heart on a listing to keep it here.', 'اضغط القلب على أي إعلان عشان يتحفظ هنا.')} />
          ) : (
            <EmptyState
              title={finals ? t('Nothing ready in 15 minutes', 'ما فيه شي جاهز خلال 15 دقيقة') : t('No listings match', 'ما فيه إعلانات مطابقة')}
              body={
                finals
                  ? t('Post an urgent request and students nearby will see it first.', 'انشر طلب عاجل والطلاب القريبين يشوفونه أول.')
                  : t('Loosen a filter, or post a request so someone who has it can reach you.', 'خفّف الفلاتر، أو انشر طلب عشان اللي عنده يتواصل معك.')
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {dirty && !finals ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setF(EMPTY_FILTERS)
                        setTab('all')
                      }}
                    >
                      {t('Clear everything', 'امسح الكل')}
                    </Button>
                  ) : null}
                  <Button onClick={() => openStudio('request')}>{t('Post a request', 'انشر طلب')}</Button>
                </div>
              }
            />
          )
        }
      />
    </>
  )
}
