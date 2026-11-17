import { OTPField } from '@base-ui/react/otp-field'
import { BadgeCheck, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useL, useT } from '../../lib/i18n'
import { usePersona, useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Modal } from '../ui/Overlay'

const DEMO_CODE = '590059'
const EMAIL = /^[a-z0-9._-]{3,}@kfupm\.edu\.sa$/i

function Flow({ onClose }: { onClose: () => void }) {
  const t = useT()
  const L = useL()
  const me = usePersona()
  const verify = useStore((s) => s.verify)
  const after = useUi((s) => s.afterVerify)
  const [step, setStep] = useState<'email' | 'code' | 'done'>(me.verified ? 'done' : 'email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()

  if (step === 'done') {
    return (
      <div className="fade-in px-6 pb-8 text-center" role="status">
        <div className="relative -mx-6 mb-10 h-24 bg-turquoise">
          <img src="./brand/matrix-turquoise.svg" alt="" width={1000} height={1000} className="absolute inset-0 size-full object-cover" />
          <span className="absolute start-1/2 top-full inline-grid size-16 -translate-y-1/2 place-items-center rounded-full bg-white ltr:-translate-x-1/2 rtl:translate-x-1/2">
            <BadgeCheck className="size-12 text-green" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 font-display text-[22px] font-bold text-turquoise">{t(`${L(me.name).split(' ')[0]}, you are verified`, `${L(me.name).split(' ')[0]}، تم توثيقك`)}</p>
        <p className="mx-auto mt-1 max-w-[38ch] text-[14.5px] text-muted">{t('The check mark now shows next to your name. You can reserve, rent and list.', 'علامة التوثيق صارت تطلع جنب اسمك. تقدر تحجز وتستأجر وتنشر.')}</p>
        <Button
          className="mt-5"
          size="lg"
          onClick={() => {
            onClose()
            after?.()
          }}
        >
          {after ? t('Continue', 'كمّل') : t('Done', 'تم')}
        </Button>
      </div>
    )
  }

  if (step === 'email') {
    return (
      <form
        noValidate
        className="flex flex-col gap-4 px-5 py-5 sm:px-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (!EMAIL.test(email.trim())) {
            setError(t('Use your university address, like s202112345@kfupm.edu.sa.', 'استخدم إيميل الجامعة، مثل s202112345@kfupm.edu.sa.'))
            return
          }
          setError(undefined)
          setStep('code')
        }}
      >
        <p className="text-[14.5px] text-muted">
          {t('Only KFUPM students can reserve, rent and list. We check that you own a university inbox. Your address is never shown to others.', 'الحجز والإيجار والنشر لطلاب الجامعة فقط. نتأكد إن عندك إيميل جامعي. إيميلك ما يظهر لأحد.')}
        </p>
        <Field label={t('University email', 'الإيميل الجامعي')} error={error}>
          {({ id, describedBy, invalid }) => (
            <input id={id} className="field" dir="ltr" type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder="s202112345@kfupm.edu.sa" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
        <Button type="submit" size="lg">
          <Mail className="size-[18px]" aria-hidden="true" />
          {t('Send code', 'أرسل الرمز')}
        </Button>
        <p className="rounded-control bg-wash p-3 text-[12.5px] text-muted">{t('Demo preview: no email is sent and nothing leaves your browser.', 'عرض تجريبي: ما ينرسل إيميل وما يطلع شي من متصفحك.')}</p>
      </form>
    )
  }

  const check = (value: string) => {
    if (value.length < 6) return
    if (value !== DEMO_CODE) {
      setError(t('That code does not match. Check it and try again.', 'الرمز غير مطابق. تأكد منه وحاول مرة ثانية.'))
      return
    }
    verify(me.id)
    setStep('done')
    toast.success(t('Verified', 'تم التوثيق'))
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4 px-5 py-5 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (code.length < 6) setError(t('Enter all 6 digits.', 'اكتب الأرقام الستة كاملة.'))
        else check(code)
      }}
    >
      <p className="text-[14.5px] text-muted [overflow-wrap:anywhere]">
        {t('Enter the 6-digit code sent to ', 'اكتب الرمز المكوّن من 6 أرقام المرسل إلى ')}
        <strong className="font-semibold text-black" dir="ltr">
          {email.trim()}
        </strong>
      </p>
      <div>
        <label htmlFor="otp" className="mb-1.5 block text-[13.5px] font-semibold text-turquoise">
          {t('Verification code', 'رمز التحقق')}
        </label>
        <OTPField.Root
          id="otp"
          length={6}
          value={code}
          onValueChange={(v) => {
            setCode(v)
            setError(undefined)
            check(v)
          }}
          dir="ltr"
          className="flex justify-between gap-1.5 sm:justify-start sm:gap-2"
          aria-describedby="otp-msg"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <OTPField.Input key={i} aria-label={t(`Digit ${i + 1}`, `الرقم ${i + 1}`)} aria-invalid={Boolean(error)} className="field tabular !min-h-13 !w-11 !px-0 text-center font-display text-[22px] font-bold sm:!w-12" />
          ))}
        </OTPField.Root>
        <p id="otp-msg" className={error ? 'mt-1.5 text-[12.5px] font-medium text-danger-ink' : 'mt-1.5 text-[12.5px] text-muted'} role={error ? 'alert' : undefined}>
          {error ?? t(`Demo preview: the code is ${DEMO_CODE}.`, `عرض تجريبي: الرمز هو ${DEMO_CODE}.`)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" className="flex-1">
          {t('Verify', 'وثّق')}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => { setStep('email'); setCode(''); setError(undefined) }}>
          {t('Change email', 'غيّر الإيميل')}
        </Button>
      </div>
    </form>
  )
}

export function VerifyModal() {
  const t = useT()
  const open = useUi((s) => s.verify)
  const setVerify = useUi((s) => s.setVerify)
  const personaId = useStore((s) => s.personaId)
  return (
    <Modal open={open} onOpenChange={(o) => !o && setVerify(false)} title={t('Verify your KFUPM email', 'وثّق إيميلك الجامعي')}>
      {open ? <Flow key={personaId} onClose={() => setVerify(false)} /> : null}
    </Modal>
  )
}
