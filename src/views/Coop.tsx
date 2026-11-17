import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ListingGrid } from '../components/listing/ListingCard'
import { Button } from '../components/ui/Button'
import { Chip, Segmented } from '../components/ui/Segmented'
import { useDebounced, useListings, useNow } from '../lib/hooks'
import { useT } from '../lib/i18n'
import type { Kind } from '../lib/types'
import { useUi } from '../store/useUi'
import { EMPTY_FILTERS, EmptyState, type Filters, PageHeader, ResultCount, SearchInput, SortSelect, Toolbar, useFiltered } from './shared'

type Tab = 'parts' | 'groupbuy'
const TAGS = ['ESP32', 'STM32', 'FPGA', 'Arduino', 'SPI', 'I2C', 'LiPo', 'NEMA']

export function Coop() {
  const t = useT()
  const now = useNow()
  const all = useListings()
  const openStudio = useUi((s) => s.openStudio)
  const [tab, setTab] = useState<Tab>('parts')
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const [how, setHow] = useState<Kind | 'all'>('all')
  const q = useDebounced(f.q)

  const pool = all.filter((l) => l.category === 'hardware' && (tab === 'groupbuy' ? l.kind === 'groupbuy' : l.kind !== 'groupbuy' && (how === 'all' || l.kind === how)))
  const shown = useFiltered(pool, { ...f, q })
  const open = all.filter((l) => l.kind === 'groupbuy' && (l.groupBuy?.deadline ?? 0) > now).length

  return (
    <>
      <PageHeader
        title={t('Hardware co-op', 'تعاونية القطع')}
        lead={t('Boards, sensors and tools for labs and senior design. Search by chip, interface or spec, or split a bulk order to share shipping.', 'بوردات وحساسات وعدد للابات ومشاريع التخرج. ابحث بالشريحة أو الواجهة أو المواصفة، أو ادخل طلبية جماعية وتقاسموا الشحن.')}
        action={
          <Button variant="secondary" onClick={() => openStudio(tab === 'groupbuy' ? 'groupbuy' : 'sale')}>
            <Plus className="size-[18px]" aria-hidden="true" />
            {tab === 'groupbuy' ? t('Start a group buy', 'ابدأ طلبية جماعية') : t('List a part', 'اعرض قطعة')}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <Toolbar
          left={
            <Segmented
            label={t('Section', 'القسم')}
            value={tab}
            onChange={setTab}
            options={[
              { value: 'parts', label: t('Parts and kits', 'قطع وعدد') },
              { value: 'groupbuy', label: t(`Group buys (${open} open)`, `طلبيات جماعية (${open} مفتوحة)`) },
            ]}
          />
          }
        >
          <SearchInput value={f.q} onChange={(v) => setF({ ...f, q: v })} placeholder={t('Chip, pinout or spec', 'شريحة أو واجهة أو مواصفة')} />
            <SortSelect value={f.sort} onChange={(sort) => setF({ ...f, sort })} />
        </Toolbar>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto sm:flex-wrap" role="group" aria-label={t('Quick spec search', 'بحث سريع بالمواصفة')}>
          {tab === 'parts'
            ? (
                [
                  ['all', t('Buy, rent or free', 'شراء أو إيجار أو مجانًا')],
                  ['sale', t('Buy', 'شراء')],
                  ['rent', t('Rent', 'إيجار')],
                  ['free', t('Free', 'مجانًا')],
                ] as const
              ).map(([v, label]) => (
                <Chip key={v} on={how === v} onClick={() => setHow(v)}>
                  {label}
                </Chip>
              ))
            : null}
          {TAGS.map((tag) => (
            <Chip key={tag} on={f.q.toLowerCase() === tag.toLowerCase()} onClick={() => setF({ ...f, q: f.q.toLowerCase() === tag.toLowerCase() ? '' : tag })}>
              <span dir="ltr">{tag}</span>
            </Chip>
          ))}
        </div>
        <ResultCount n={shown.length} noun={tab === 'groupbuy' ? t(shown.length === 1 ? 'group buy' : 'group buys', 'طلبية') : t(shown.length === 1 ? 'part' : 'parts', 'قطعة')} />
      </div>

      <ListingGrid
        heading={t('Results', 'النتائج')}
        listings={shown}
        now={now}
        empty={
          <EmptyState
            title={t('Nothing matches that spec', 'ما فيه شي يطابق هذي المواصفة')}
            body={t('Ask the co-op. Someone’s SDP box probably has one.', 'اسأل التعاونية. أكيد فيه أحد عنده في كرتون مشروعه.')}
            action={<Button onClick={() => openStudio('request')}>{t('Post a request', 'انشر طلب')}</Button>}
          />
        }
      />
    </>
  )
}
