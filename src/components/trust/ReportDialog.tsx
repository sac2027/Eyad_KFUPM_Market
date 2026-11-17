import { useState } from 'react'
import { toast } from 'sonner'
import { REPORT_REASONS } from '../../data/categories'
import { useL, useT } from '../../lib/i18n'
import type { ReportReason } from '../../lib/types'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Modal } from '../ui/Overlay'

const REASONS = Object.keys(REPORT_REASONS) as ReportReason[]

function Form({ target, onDone }: { target: NonNullable<ReturnType<typeof useUi.getState>['reportTarget']>; onDone: () => void }) {
  const t = useT()
  const L = useL()
  const report = useStore((s) => s.report)
  const label = useStore((s) =>
    target.type === 'listing' ? s.listings.find((l) => l.id === target.id)?.title : target.type === 'request' ? s.requests.find((r) => r.id === target.id)?.title : s.users.find((u) => u.id === target.id)?.name,
  )
  const [reason, setReason] = useState<ReportReason>(target.type === 'user' ? 'noShow' : 'wrongInfo')
  const [note, setNote] = useState('')
  const reasons = target.type === 'user' ? REASONS.filter((r) => r !== 'prohibited' && r !== 'wrongInfo') : REASONS.filter((r) => r !== 'noShow')

  return (
    <form
      className="flex flex-col gap-4 px-5 py-5 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault()
        report({ targetType: target.type, targetId: target.id, reason, note: note.trim() })
        toast.success(t('Report sent to the market admins', 'وصل بلاغك لمشرفي السوق'), { description: t('They review reports and may hide the listing or suspend the account.', 'يراجعون البلاغات وقد يخفون الإعلان أو يوقفون الحساب.') })
        onDone()
      }}
    >
      {label ? <p className="rounded-control bg-wash p-3 text-[14.5px] font-semibold [overflow-wrap:anywhere]">{L(label)}</p> : null}
      <fieldset>
        <legend className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('What is wrong?', 'وش المشكلة؟')}</legend>
        <div className="flex flex-col">
          {reasons.map((r) => (
            <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-2 text-[15px] hover:bg-wash">
              <input type="radio" name="reason" className="size-5 accent-turquoise" checked={reason === r} onChange={() => setReason(r)} />
              {L(REPORT_REASONS[r])}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={t('What happened?', 'وش اللي صار؟')} hint={t('Optional. Admins see this with your name. The other student does not.', 'اختياري. المشرفين يشوفونه مع اسمك. الطالب الثاني ما يشوفه.')}>
        {({ id, describedBy }) => <textarea id={id} className="field min-h-24 resize-y" maxLength={400} value={note} onChange={(e) => setNote(e.target.value)} aria-describedby={describedBy} />}
      </Field>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onDone}>
          {t('Cancel', 'إلغاء')}
        </Button>
        <Button type="submit" className="flex-1">
          {t('Send report', 'أرسل البلاغ')}
        </Button>
      </div>
    </form>
  )
}

export function ReportDialog() {
  const t = useT()
  const target = useUi((s) => s.reportTarget)
  const setTarget = useUi((s) => s.setReportTarget)
  const [last, setLast] = useState(target)
  if (target && target !== last) setLast(target)
  const shown = target ?? last
  return (
    <Modal
      open={target != null}
      onOpenChange={(o) => !o && setTarget(null)}
      title={shown?.type === 'user' ? t('Report this student', 'بلّغ عن الطالب') : shown?.type === 'request' ? t('Report this request', 'بلّغ عن الطلب') : t('Report this listing', 'بلّغ عن الإعلان')}
    >
      {shown ? <Form key={`${shown.type}:${shown.id}`} target={shown} onDone={() => setTarget(null)} /> : null}
    </Modal>
  )
}
