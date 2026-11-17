import { Megaphone, ShieldAlert, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useL, useT } from '../../lib/i18n'
import { usePersona, useStore } from '../../store/useStore'

/** Admin announcement and account notices, shown above every section. */
export function Notices() {
  const t = useT()
  const L = useL()
  const me = usePersona()
  const announcement = useStore((s) => s.announcement)
  const dismissed = useStore((s) => s.dismissedAnnouncement)
  const dismiss = useStore((s) => s.dismissAnnouncement)
  const show = announcement && announcement.id !== dismissed

  if (!show && !me.suspended) return null
  return (
    <div className="mb-5 flex flex-col gap-2">
      {me.suspended ? (
        <p className="flex items-start gap-2.5 rounded-card bg-error/15 px-4 py-3 text-[14.5px] font-medium text-danger-ink" role="alert">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {t('Your account is suspended. You can browse, but you cannot list or reserve until a market admin reinstates it.', 'حسابك موقوف. تقدر تتصفح، بس ما تقدر تنشر أو تحجز لين يرجّعه مشرف السوق.')}
        </p>
      ) : null}
      {show ? (
        <div className={cn('flex items-start gap-2.5 rounded-card py-1.5 ps-4 pe-1.5 text-[14.5px]', announcement.tone === 'warning' ? 'bg-warning/50' : 'bg-info/35')} role="status">
          <Megaphone className="mt-2.5 size-5 shrink-0 text-turquoise" aria-hidden="true" />
          <p className="min-w-0 flex-1 py-2 [overflow-wrap:anywhere]">
            <span className="font-semibold text-turquoise">{t('From the market admins: ', 'من مشرفي السوق: ')}</span>
            {L(announcement.text)}
          </p>
          <button type="button" onClick={dismiss} aria-label={t('Dismiss announcement', 'إخفاء الإعلان')} className="press inline-grid size-11 shrink-0 place-items-center rounded-control text-turquoise hover:bg-black/5">
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
