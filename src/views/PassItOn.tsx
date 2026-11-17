import { Gift } from 'lucide-react'
import { useMemo } from 'react'
import { Avatar } from '../components/listing/SellerCard'
import { ListingGrid } from '../components/listing/ListingCard'
import { MajorTag, Verified } from '../components/listing/parts'
import { Button } from '../components/ui/Button'
import { useListings, useNow } from '../lib/hooks'
import { useT } from '../lib/i18n'
import { usePersona, useStore } from '../store/useStore'
import { useUi } from '../store/useUi'
import { EMPTY_FILTERS, EmptyState, useFiltered } from './shared'

export function PassItOn() {
  const t = useT()
  const now = useNow()
  const all = useListings()
  const me = usePersona()
  const users = useStore((s) => s.users)
  const openStudio = useUi((s) => s.openStudio)
  const box = all.filter((l) => l.passItOn)
  const shown = useFiltered(box, EMPTY_FILTERS)

  const givers = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of box) counts.set(l.sellerId, (counts.get(l.sellerId) ?? 0) + 1)
    return [...counts.entries()]
      .map(([id, n]) => ({ user: users.find((u) => u.id === id), n }))
      .filter((g) => g.user)
      .sort((a, b) => b.n - a.n)
  }, [box, users])

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-card bg-beige">
        <img src="./brand/matrix-beige.jpg" alt="" width={1600} height={480} className="absolute inset-y-0 end-0 hidden h-full w-1/2 object-cover sm:block rtl:-scale-x-100" style={{ clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)' }} />
        <div className="relative max-w-[600px] px-5 py-7 sm:px-8 sm:py-9">
          <h1 className="text-[26px] font-black text-turquoise sm:text-[32px]">{t('The Pass-It-On box', 'صندوق الخريجين')}</h1>
          <p className="mt-2 max-w-[48ch] text-[15.5px] text-black/80">
            {t(
              'Graduating seniors leave books, lab kits and dorm gear here for the students coming up behind them. Everything is free.',
              'الخريجين يتركون هنا كتبهم وعدة اللابات وأغراض السكن للي جايين بعدهم. كل شي لوجه الله.',
            )}
          </p>
          <div className="mt-5">
            <Button size="lg" onClick={() => openStudio('free')}>
              <Gift className="size-5" aria-hidden="true" />
              {me.graduating ? t('Drop something in the box', 'حط شي في الصندوق') : t('Give something away', 'تبرّع بغرض')}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="box-items">
          <h2 id="box-items" className="mb-4 text-[20px] font-bold text-turquoise">
            {t(`In the box now (${shown.length})`, `في الصندوق الحين (${shown.length})`)}
          </h2>
          <div className="[&_.grid]:lg:grid-cols-3 [&_.grid]:2xl:grid-cols-4">
            <ListingGrid
              listings={shown}
              now={now}
              empty={<EmptyState title={t('The box is empty', 'الصندوق فاضي')} body={t('It fills up in the last two weeks of term, when seniors hand in their keys.', 'يمتلي آخر أسبوعين من الترم لما الخريجين يسلمون المفاتيح.')} />}
            />
          </div>
        </section>

        <aside aria-labelledby="givers">
          <h2 id="givers" className="mb-4 text-[20px] font-bold text-turquoise">
            {t('Seniors giving this term', 'خريجين تبرعوا هذا الترم')}
          </h2>
          {givers.length === 0 ? (
            <p className="text-[14px] text-muted">{t('No one yet.', 'ما فيه أحد للحين.')}</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {givers.map(({ user, n }) => (
                <li key={user!.id} className="flex items-center gap-3 rounded-card bg-wash p-3">
                  <Avatar user={user} className="size-10 text-[14px]" />
                  <div className="min-w-0 flex-1">
                    <Verified user={user} className="text-[14.5px]" />
                    <MajorTag user={user!} />
                  </div>
                  <p className="shrink-0 text-end">
                    <span className="tabular block font-display text-[22px] leading-none font-bold text-turquoise">{n}</span>
                    <span className="text-[12px] text-muted">{t(n === 1 ? 'item' : 'items', 'غرض')}</span>
                  </p>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-[13px] text-muted">{t('Counts are items currently in the box.', 'العدد هو الأغراض الموجودة حاليًا في الصندوق.')}</p>
        </aside>
      </div>
    </>
  )
}
