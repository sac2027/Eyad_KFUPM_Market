import { Clock, Handshake, RotateCcw, ThumbsUp } from 'lucide-react'
import { useL, useT } from '../../lib/i18n'
import type { User } from '../../lib/types'
import { Badge } from '../ui/Badge'
import { MajorTag, Verified } from './parts'

export function Avatar({ user, className = 'size-11 text-[15px]' }: { user: User | undefined; className?: string }) {
  const L = useL()
  const initial = user ? L(user.name).trim().charAt(0) : '?'
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full bg-turquoise font-sans font-bold text-beige ${className}`} aria-hidden="true">
      {initial}
    </span>
  )
}

export function SellerCard({ user, role }: { user: User | undefined; role: string }) {
  const t = useT()
  if (!user) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-wash p-4">
        <Avatar user={undefined} />
        <p className="text-[14px] text-muted">{t('This student’s profile is no longer available.', 'ملف هذا الطالب غير متاح.')}</p>
      </div>
    )
  }
  const s = user.stats
  const stats = [
    { icon: Clock, label: t('Replies in', 'يرد خلال'), value: s.deals === 0 ? '—' : t(`${s.responseMins} min`, `${s.responseMins} د`) },
    { icon: Handshake, label: t('Deals done', 'صفقات تمت'), value: String(s.deals) },
    { icon: RotateCcw, label: t('Returned on time', 'إرجاع في الوقت'), value: s.rentals === 0 ? '—' : `${s.onTime}/${s.rentals}` },
    { icon: ThumbsUp, label: t('Endorsements', 'تزكيات'), value: String(s.endorsements) },
  ]
  return (
    <section className="rounded-card bg-wash p-4" aria-label={role}>
      <div className="flex items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] text-muted">{role}</p>
          <Verified user={user} className="text-[15px] text-black" />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <MajorTag user={user} />
            <span className="text-[13px] text-muted">{t(`Bldg ${user.bldg}`, `مبنى ${user.bldg}`)}</span>
          </div>
        </div>
        {user.verified ? null : <Badge tone="neutral">{t('Not verified', 'غير موثّق')}</Badge>}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {stats.map(({ icon: I, label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="flex items-center gap-1 text-[12px] text-muted">
              <I className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </dt>
            <dd className="tabular text-[15px] font-semibold text-turquoise">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
