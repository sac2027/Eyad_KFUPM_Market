import { Users } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useL, useT } from '../../lib/i18n'
import { openListing } from '../../lib/router'
import type { Listing } from '../../lib/types'
import { useUser } from '../../store/useStore'
import { Art } from '../brand/Art'
import { CourseTag, FavButton, InstantBadge, KindBadge, Posted, Price, StatusBadge, Verified, ZoneLine, groupQty } from './parts'

export function ListingCard({ listing, now, index = 0 }: { listing: Listing; now: number; index?: number }) {
  const L = useL()
  const t = useT()
  const seller = useUser(listing.sellerId)
  const gone = listing.status === 'completed'
  const gb = listing.groupBuy
  const qty = groupQty(listing)

  return (
    <article className="group/card relative flex min-w-0 flex-col" style={{ '--i': index } as React.CSSProperties}>
      <div className="relative">
        <Art
          id={listing.id}
          icon={listing.icon}
          tone={listing.tone}
          photo={listing.photo}
          alt=""
          className={cn('aspect-[4/3] w-full rounded-card', gone && 'opacity-60')}
        />
        <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-wrap gap-1.5 pe-11">
          <KindBadge listing={listing} />
          <StatusBadge status={listing.status} short />
          {listing.instant && listing.status === 'available' ? <InstantBadge /> : null}
        </div>
        <FavButton id={listing.id} className="absolute end-0.5 top-0.5 z-10" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 px-0.5 pt-2.5">
        <Price listing={listing} />
        <h3 className="!font-sans line-clamp-2 text-[15px] leading-snug font-medium tracking-normal text-black [overflow-wrap:anywhere]">
          <button
            type="button"
            onClick={() => openListing(listing.id)}
            className="text-start after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-green"
          >
            {L(listing.title) || t('Untitled', 'بدون عنوان')}
          </button>
        </h3>

        {gb ? (
          <div className="mt-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuemin={0} aria-valuemax={gb.target} aria-valuenow={Math.min(qty, gb.target)} aria-label={t('Units claimed', 'الحبات المحجوزة')}>
              <div className="h-full origin-[inline-start] rounded-full bg-green" style={{ width: `${Math.min(100, (qty / Math.max(1, gb.target)) * 100)}%` }} />
            </div>
            <p className="mt-1 flex items-center gap-1 text-[12.5px] text-muted">
              <Users className="size-3.5" aria-hidden="true" />
              <span className="tabular">{t(`${qty} of ${gb.target} claimed`, `${qty} من ${gb.target} محجوزة`)}</span>
            </p>
          </div>
        ) : null}

        <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-[12.5px] text-muted">
          {listing.course ? <CourseTag course={listing.course} /> : null}
          <ZoneLine listing={listing} />
          <Posted ts={listing.createdAt} now={now} />
        </div>
        <Verified user={seller} className="text-[12.5px] text-muted" />
      </div>
    </article>
  )
}

export function ListingGrid({ listings, now, empty, heading }: { listings: Listing[]; now: number; empty: React.ReactNode; heading?: string }) {
  if (listings.length === 0) return <>{empty}</>
  return (
    <>
      {heading ? <h2 className="sr-only">{heading}</h2> : null}
      <div className="stagger grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {listings.map((l, i) => (
        <ListingCard key={l.id} listing={l} now={now} index={i} />
      ))}
      </div>
    </>
  )
}
