import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { zoneById } from '../../data/zones'
import { sar } from '../../lib/format'
import { useListings, useRequests, useVerifiedAction } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { offerMessage, waLink } from '../../lib/whatsapp'
import { usePersona, useStore, useUser } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Button, buttonClass } from '../ui/Button'
import { Field } from '../ui/Field'
import { Sheet } from '../ui/Overlay'
import { Verified } from '../listing/parts'

function Form({ requestId }: { requestId: string }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const requests = useRequests()
  const listings = useListings()
  const addOffer = useStore((s) => s.addOffer)
  const setOfferFor = useUi((s) => s.setOfferFor)
  const guard = useVerifiedAction()
  const req = requests.find((r) => r.id === requestId)
  const requester = useUser(req?.requesterId ?? '')
  const mine = listings.filter((l) => l.sellerId === me.id && l.status === 'available')
  // Suggest the persona's listing that best fits the request.
  const guess = mine.find((l) => l.category === req?.category && (req?.bounty !== 'rent' || l.kind === 'rent')) ?? mine.find((l) => l.category === req?.category)
  const [listingId, setListingId] = useState(guess?.id ?? '')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  if (!req) return <p className="px-6 py-8 text-muted">{t('This request is no longer open.', 'هذا الطلب ما عاد مفتوح.')}</p>
  const attached = mine.find((l) => l.id === listingId)
  const text = offerMessage(req, me, note.trim(), attached, lang)

  return (
    <form
      className="flex flex-col gap-5 px-5 py-5 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault()
        guard(() => {
          if (!req.id.startsWith('worst-')) addOffer(req.id, { userId: me.id, note: note.trim(), listingId: listingId || undefined })
          setSent(true)
          toast.success(t('Offer sent', 'تم إرسال العرض'), { description: t('It now shows on the request. Message them to agree a time.', 'عرضك ظاهر على الطلب. راسله واتفقوا على الوقت.') })
        })
      }}
    >
      <div className="rounded-card bg-wash p-4">
        <p className="font-semibold [overflow-wrap:anywhere]">{L(req.title)}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[13.5px] text-muted">
          <Verified user={requester} />
          <span>{L(zoneById(req.zone).short)}</span>
          {req.budget > 0 ? <span className="tabular font-semibold text-turquoise">{sar(req.budget, lang)}</span> : null}
        </p>
      </div>

      <Field label={t('Attach one of your listings', 'أرفق أحد إعلاناتك')} hint={mine.length === 0 ? t('You have nothing listed. You can still offer with a note.', 'ما عندك إعلانات. تقدر تعرض بملاحظة بس.') : t('They can open it and reserve straight away.', 'يقدر يفتحه ويحجز على طول.')}>
        {({ id, describedBy }) => (
          <select id={id} className="field" value={listingId} onChange={(e) => setListingId(e.target.value)} disabled={mine.length === 0} aria-describedby={describedBy}>
            <option value="">{t('No listing, just a note', 'بدون إعلان، ملاحظة بس')}</option>
            {mine.map((l) => (
              <option key={l.id} value={l.id}>
                {L(l.title)}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label={t('Note', 'ملاحظة')} hint={t('When and where you can hand it over.', 'متى ووين تقدر تسلّمه.')}>
        {({ id, describedBy }) => (
          <textarea id={id} className="field min-h-24 resize-y" maxLength={280} value={note} onChange={(e) => setNote(e.target.value)} aria-describedby={describedBy} placeholder={t('Free until 9 PM, I can meet at the library.', 'فاضي لين 9 الليل، أقابلك عند المكتبة.')} />
        )}
      </Field>

      {sent ? (
        <div className="fade-in flex flex-col gap-2" role="status">
          <p className="rounded-control bg-success/15 p-3 text-[13.5px] whitespace-pre-line [overflow-wrap:anywhere]">{text}</p>
          <div className="flex flex-wrap gap-2">
            {requester ? (
              <a href={waLink(requester, text)} target="_blank" rel="noreferrer" className={buttonClass('whatsapp', 'md', 'flex-1')}>
                <MessageCircle className="size-[18px] text-green" aria-hidden="true" />
                {t('Send on WhatsApp', 'أرسل في الواتساب')}
              </a>
            ) : null}
            <Button variant="secondary" onClick={() => setOfferFor(null)}>
              {t('Done', 'تم')}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" size="lg">
          {t('Offer to help', 'اعرض مساعدتك')}
        </Button>
      )}
    </form>
  )
}

export function OfferDrawer() {
  const t = useT()
  const offerFor = useUi((s) => s.offerFor)
  const setOfferFor = useUi((s) => s.setOfferFor)
  const [last, setLast] = useState(offerFor)
  if (offerFor && offerFor !== last) setLast(offerFor)
  const id = offerFor ?? last
  return (
    <Sheet open={offerFor != null} onOpenChange={(o) => !o && setOfferFor(null)} title={t('I have this', 'عندي')} description={t('Your offer appears on the request, with a WhatsApp message ready to send.', 'عرضك يطلع على الطلب، ومعه رسالة واتساب جاهزة.')}>
      {id ? <Form key={id} requestId={id} /> : null}
    </Sheet>
  )
}
