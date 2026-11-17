import { Minus, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { duration, sar } from '../../lib/format'
import { useNow, useVerifiedAction } from '../../lib/hooks'
import { useLang, useT } from '../../lib/i18n'
import type { Listing } from '../../lib/types'
import { useStore } from '../../store/useStore'
import { Button, IconButton } from '../ui/Button'
import { groupQty } from './parts'

export function GroupBuyPanel({ listing }: { listing: Listing }) {
  const t = useT()
  const lang = useLang()
  const now = useNow(30_000)
  const personaId = useStore((s) => s.personaId)
  const join = useStore((s) => s.joinGroupBuy)
  const leave = useStore((s) => s.leaveGroupBuy)
  const guard = useVerifiedAction()
  const gb = listing.groupBuy
  const mine = gb?.joined.find((j) => j.userId === personaId)?.qty ?? 0
  const [qty, setQty] = useState(mine || 1)
  if (!gb) return null

  const total = groupQty(listing)
  const pct = Math.min(100, (total / Math.max(1, gb.target)) * 100)
  const left = Math.max(0, gb.target - total)
  const closed = gb.deadline <= now
  const saving = Math.max(0, gb.retailPrice - gb.unitPrice)

  return (
    <section className="rounded-card bg-wash p-4" aria-label={t('Group buy', 'طلبية جماعية')}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex items-center gap-1.5 font-semibold text-turquoise">
          <Users className="size-4" aria-hidden="true" />
          <span className="tabular">{t(`${total} of ${gb.target} units claimed`, `${total} من ${gb.target} حبة محجوزة`)}</span>
        </p>
        <p className="shrink-0 text-[13px] text-muted">{closed ? t('Order closed', 'الطلبية مقفلة') : t(`Closes in ${duration(gb.deadline - now, lang)}`, `تقفل بعد ${duration(gb.deadline - now, lang)}`)}</p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuemin={0} aria-valuemax={gb.target} aria-valuenow={Math.min(total, gb.target)} aria-label={t('Units claimed', 'الحبات المحجوزة')}>
        <div className="h-full rounded-full bg-green transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[13.5px] text-muted">
        {left > 0
          ? t(`${left} more and the order goes to ${gb.supplier}.`, `باقي ${left} ونرفع الطلبية على ${gb.supplier}.`)
          : t(`Target reached. The organizer orders from ${gb.supplier} at the deadline.`, `اكتمل العدد. المنظّم يطلب من ${gb.supplier} عند الإقفال.`)}
        {saving > 0 ? ' ' + t(`You save ${sar(saving, lang)} per unit against buying alone.`, `توفّر ${sar(saving, lang)} في الحبة مقارنة بالشراء لحالك.`) : ''}
      </p>

      {closed ? null : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-control border border-turquoise/30 bg-white">
            <IconButton label={t('One less', 'أقل بواحد')} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="text-turquoise disabled:opacity-40">
              <Minus className="size-4" aria-hidden="true" />
            </IconButton>
            <output className="tabular min-w-9 text-center font-semibold" aria-live="polite" aria-label={t('Units', 'عدد الحبات')}>
              {qty}
            </output>
            <IconButton label={t('One more', 'زيادة واحد')} onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= 20} className="text-turquoise disabled:opacity-40">
              <Plus className="size-4" aria-hidden="true" />
            </IconButton>
          </div>
          <Button
            className="min-w-0 flex-1"
            onClick={() =>
              guard(() => {
                join(listing.id, qty)
                toast.success(mine ? t('Units updated', 'تم تحديث العدد') : t('You joined the order', 'دخلت في الطلبية'), {
                  description: t(`${qty} × ${sar(gb.unitPrice, lang)} = ${sar(qty * gb.unitPrice, lang)}, paid to the organizer on delivery.`, `${qty} × ${sar(gb.unitPrice, lang)} = ${sar(qty * gb.unitPrice, lang)} تدفعها للمنظّم عند الاستلام.`),
                })
              })
            }
          >
            <span className="truncate">{mine ? t(`Update to ${qty} · ${sar(qty * gb.unitPrice, lang)}`, `عدّل إلى ${qty} · ${sar(qty * gb.unitPrice, lang)}`) : t(`Join with ${qty} · ${sar(qty * gb.unitPrice, lang)}`, `ادخل بـ ${qty} · ${sar(qty * gb.unitPrice, lang)}`)}</span>
          </Button>
          {mine ? (
            <Button
              variant="ghost"
              onClick={() => {
                leave(listing.id)
                toast(t('You left the order', 'طلعت من الطلبية'))
              }}
            >
              {t('Leave', 'انسحب')}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  )
}
