import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ListingGrid } from '../components/listing/ListingCard'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Segmented'
import { useDebounced, useListings, useNow } from '../lib/hooks'
import { useT } from '../lib/i18n'
import { useUi } from '../store/useUi'
import { EMPTY_FILTERS, EmptyState, type Filters, PageHeader, ResultCount, SearchInput, Toolbar, useFiltered } from './shared'

export function Skills() {
  const t = useT()
  const now = useNow()
  const all = useListings()
  const openStudio = useUi((s) => s.openStudio)
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const [swap, setSwap] = useState(false)
  const q = useDebounced(f.q)
  const pool = all.filter((l) => l.kind === 'service' && (!swap || l.service?.barterFor != null))
  const shown = useFiltered(pool, { ...f, q })

  return (
    <>
      <PageHeader
        title={t('Skill exchange', 'تبادل المهارات')}
        lead={t('3D printing, soldering, tutoring, photos and errands from students on campus. Pay per session, or swap a skill of your own.', 'طباعة ثلاثية الأبعاد ولحام وشرح وتصوير ومشاوير من طلاب الجامعة. ادفع بالجلسة، أو قايض بمهارة عندك.')}
        action={
          <Button variant="secondary" onClick={() => openStudio('service')}>
            <Plus className="size-[18px]" aria-hidden="true" />
            {t('Offer a skill', 'اعرض مهارتك')}
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3">
        <Toolbar
          left={
            <Chip on={swap} onClick={() => setSwap(!swap)}>
            {t('Open to a swap', 'يقبل المقايضة')}
          </Chip>
          }
        >
          <SearchInput value={f.q} onChange={(v) => setF({ ...f, q: v })} placeholder={t('Search skills', 'ابحث في المهارات')} />
        </Toolbar>
        <ResultCount n={shown.length} noun={t(shown.length === 1 ? 'service' : 'services', 'خدمة')} sort={f.sort} onSort={(sort) => setF({ ...f, sort })} />
      </div>
      <ListingGrid
        heading={t('Services', 'الخدمات')}
        listings={shown}
        now={now}
        empty={
          <EmptyState
            title={t('No one offers that yet', 'محد يقدّم هذي الخدمة للحين')}
            body={t('If you can do it, you would be the first on campus.', 'لو تعرف لها، بتكون أول واحد في الجامعة.')}
            action={<Button onClick={() => openStudio('service')}>{t('Offer a skill', 'اعرض مهارتك')}</Button>}
          />
        }
      />
    </>
  )
}
