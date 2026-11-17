import { Menu } from '@base-ui/react/menu'
import { BadgeCheck, Check, ChevronDown, FlaskConical, Languages, RotateCcw, ShieldAlert, ShieldCheck, Siren } from 'lucide-react'
import { toast } from 'sonner'
import { ADMIN_ID, PERSONAS } from '../../data/users'
import { resetWithUndo } from '../../lib/demo'
import { cn } from '../../lib/cn'
import { useL, useLang, useT } from '../../lib/i18n'
import { go } from '../../lib/router'
import { usePersona, useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { Avatar } from '../listing/SellerCard'
import { MajorTag } from '../listing/parts'

const frameBtn = 'press inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-2 xs:px-3 text-[14px] font-semibold text-frame-ink hover:bg-frame-soft'

export function LangToggle({ className }: { className?: string }) {
  const lang = useLang()
  const setLang = useStore((s) => s.setLang)
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className={cn(frameBtn, className)}
      aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      aria-keyshortcuts="Alt+L"
      lang={lang === 'ar' ? 'en' : 'ar'}
    >
      <Languages className="hidden size-[18px] xs:block" aria-hidden="true" />
      <span className="xs:hidden">{lang === 'ar' ? 'EN' : 'ع'}</span>
      <span className="hidden xs:inline">{lang === 'ar' ? 'EN' : 'العربية'}</span>
    </button>
  )
}

export function FinalsToggle({ compact }: { compact?: boolean }) {
  const t = useT()
  const finals = useStore((s) => s.finals)
  const setFinals = useStore((s) => s.setFinals)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={finals}
      onClick={() => {
        setFinals(!finals)
        if (!finals) toast(t('Finals mode on', 'وضع الفاينلات شغّال'), { description: t('Showing what you can pick up in 15 minutes.', 'نعرض لك اللي تقدر تستلمه خلال 15 دقيقة.') })
      }}
      className={cn(
        'press inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-2 xs:px-3 text-[14px] font-semibold',
        finals ? 'bg-yellow text-black' : 'text-frame-ink hover:bg-frame-soft',
      )}
      aria-label={t('Finals mode', 'وضع الفاينلات')}
      title={t('Finals mode: only items ready for pickup in 15 minutes', 'وضع الفاينلات: فقط الأغراض الجاهزة للاستلام خلال 15 دقيقة')}
    >
      <Siren className="size-[18px]" aria-hidden="true" />
      {compact ? null : <span>{t('Finals mode', 'وضع الفاينلات')}</span>}
    </button>
  )
}

export function PersonaMenu({ compact }: { compact?: boolean }) {
  const t = useT()
  const L = useL()
  const me = usePersona()
  const users = useStore((s) => s.users)
  const setPersona = useStore((s) => s.setPersona)
  const worst = useStore((s) => s.worstCase)
  const setWorst = useStore((s) => s.setWorstCase)
  const setVerify = useUi((s) => s.setVerify)

  return (
    <Menu.Root>
      <Menu.Trigger className={cn(frameBtn, 'max-w-[220px] !gap-2 !px-1.5')} aria-label={t(`Demo persona: ${L(me.name)}`, `الشخصية التجريبية: ${L(me.name)}`)}>
        <Avatar user={me} className="size-8 text-[13px] ring-1 ring-frame-ink/40" />
        {compact ? null : (
          <span className="hidden min-w-0 flex-col items-start leading-tight xl:flex">
            <span className="max-w-[130px] truncate text-[13.5px]">{L(me.name).split(' ')[0]}</span>
            <span className="text-[11.5px] font-normal opacity-80">
              {me.role === 'admin' ? null : <span dir="ltr">{me.major} · </span>}
              {L(me.level)}
            </span>
          </span>
        )}
        <ChevronDown className="hidden size-4 shrink-0 opacity-70 xs:block" aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup className="pop w-[300px] max-w-[calc(100vw-24px)] rounded-card bg-white p-1.5 shadow-float outline-none">
            <Menu.Group>
              <Menu.GroupLabel className="px-3 pt-2 pb-1 text-[12.5px] font-semibold text-muted">{t('View the market as', 'شوف السوق بعين')}</Menu.GroupLabel>
              <Menu.RadioGroup
                value={me.id}
                onValueChange={(v) => {
                  setPersona(v as string)
                  // The admin lands on the admin page; students never stay on it.
                  if (v === ADMIN_ID) go('admin')
                  else if (window.location.hash.startsWith('#/admin')) go('market')
                }}
              >
                {[...PERSONAS, ADMIN_ID].map((id) => {
                  const u = users.find((x) => x.id === id)
                  if (!u) return null
                  return (
                    <Menu.RadioItem
                      closeOnClick
                      key={id}
                      value={id}
                      className="flex min-h-14 cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 outline-none data-[highlighted]:bg-wash-strong"
                    >
                      <Avatar user={u} className="size-9 text-[14px]" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[14.5px] font-semibold text-black">
                          <span className="truncate">{L(u.name)}</span>
                          {u.role === 'admin' ? <ShieldCheck className="size-4 shrink-0 text-turquoise" aria-hidden="true" /> : u.verified ? <BadgeCheck className="size-4 shrink-0 text-green" aria-label={t('Verified', 'موثّق')} /> : null}
                        </span>
                        {u.role === 'admin' ? <span className="text-[13px] text-muted">{t('Moderation and reports', 'الإشراف والبلاغات')}</span> : <MajorTag user={u} />}
                      </span>
                      <Menu.RadioItemIndicator>
                        <Check className="size-4 text-turquoise" aria-hidden="true" />
                      </Menu.RadioItemIndicator>
                    </Menu.RadioItem>
                  )
                })}
              </Menu.RadioGroup>
            </Menu.Group>
            <div className="my-1.5 h-px bg-line" role="separator" />
            {me.verified || me.role === 'admin' ? null : (
              <Menu.Item onClick={() => setVerify(true)} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-control px-3 text-[14px] font-medium outline-none data-[highlighted]:bg-wash-strong">
                <ShieldAlert className="size-4 text-turquoise" aria-hidden="true" />
                {t('Verify @kfupm.edu.sa email', 'وثّق إيميل الجامعة')}
              </Menu.Item>
            )}
            <Menu.CheckboxItem
              checked={worst}
              onCheckedChange={(v) => setWorst(v)}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-control px-3 text-[14px] font-medium outline-none data-[highlighted]:bg-wash-strong"
            >
              <FlaskConical className="size-4 text-turquoise" aria-hidden="true" />
              <span className="flex-1">{t('Worst-case test data', 'بيانات اختبار قاسية')}</span>
              <Menu.CheckboxItemIndicator>
                <Check className="size-4 text-turquoise" aria-hidden="true" />
              </Menu.CheckboxItemIndicator>
            </Menu.CheckboxItem>
            <Menu.Item
              onClick={() => resetWithUndo(t)}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-control px-3 text-[14px] font-medium text-danger-ink outline-none data-[highlighted]:bg-error/10"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t('Reset demo data', 'إعادة البيانات التجريبية')}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
