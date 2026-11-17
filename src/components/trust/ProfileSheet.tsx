import { Flag } from 'lucide-react'
import { useState } from 'react'
import { useListings } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { openListing } from '../../lib/router'
import { sar } from '../../lib/format'
import { KINDS } from '../../data/categories'
import { usePersona, useUser } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Art } from '../brand/Art'
import { SellerCard } from '../listing/SellerCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Overlay'

function Body({ id }: { id: string }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const user = useUser(id)
  const listings = useListings()
  const setProfile = useUi((s) => s.setProfile)
  const setReportTarget = useUi((s) => s.setReportTarget)
  const theirs = listings.filter((l) => l.sellerId === id && l.status !== 'completed')

  return (
    <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
      <SellerCard user={user} role={t('Student', 'طالب')} />
      {user?.suspended ? <p className="rounded-control bg-error/15 p-3 text-[14px] font-medium text-danger-ink">{t('This account is suspended by the market admins.', 'هذا الحساب موقوف من مشرفي السوق.')}</p> : null}

      <section>
        <h3 className="mb-2 text-[15px] font-bold text-turquoise">{t(`Listed now (${theirs.length})`, `معروض الحين (${theirs.length})`)}</h3>
        {theirs.length === 0 ? (
          <p className="text-[14px] text-muted">{t('Nothing listed at the moment.', 'ما عنده شي معروض حاليًا.')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {theirs.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    setProfile(null)
                    openListing(l.id)
                  }}
                  className="press flex w-full items-center gap-3 rounded-card bg-wash p-3 text-start hover:bg-wash-strong"
                >
                  <Art id={l.id} icon={l.icon} tone={l.tone} photo={l.photo} alt="" className="size-12 shrink-0 rounded-control" iconClassName="!size-6" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-[14.5px] font-semibold [overflow-wrap:anywhere]">{L(l.title)}</span>
                    <span className="text-[13px] text-muted">
                      {L(KINDS[l.kind])} · {l.price === 0 ? t('Free', 'لوجه الله') : sar(l.price, lang)}
                    </span>
                  </span>
                  {l.status !== 'available' ? <Badge tone="yellow">{l.status === 'rented' ? t('Rented out', 'مؤجَّر') : t('Reserved', 'محجوز')}</Badge> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {user && user.id !== me.id && user.role !== 'admin' ? (
        <Button
          variant="ghost"
          size="sm"
          className="!min-h-11 self-start"
          onClick={() => {
            setProfile(null)
            setReportTarget({ type: 'user', id: user.id })
          }}
        >
          <Flag className="size-4" aria-hidden="true" />
          {t('Report this student', 'بلّغ عن الطالب')}
        </Button>
      ) : null}
    </div>
  )
}

export function ProfileSheet() {
  const L = useL()
  const t = useT()
  const profileId = useUi((s) => s.profileId)
  const setProfile = useUi((s) => s.setProfile)
  const [last, setLast] = useState(profileId)
  if (profileId && profileId !== last) setLast(profileId)
  const id = profileId ?? last
  const user = useUser(id ?? '')
  return (
    <Sheet open={profileId != null} onOpenChange={(o) => !o && setProfile(null)} title={user ? L(user.name) : t('Student', 'طالب')}>
      {id ? <Body key={id} id={id} /> : null}
    </Sheet>
  )
}
