import { Dialog } from '@base-ui/react/dialog'
import { Command } from 'cmdk'
import { Briefcase, Languages, Megaphone, Plus, RotateCcw, Search, Siren, UserRound } from 'lucide-react'
import { KINDS } from '../../data/categories'
import { PERSONAS } from '../../data/users'
import { resetWithUndo } from '../../lib/demo'
import { sar } from '../../lib/format'
import { useListings, useRequests } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { go, openListing } from '../../lib/router'
import { useStore } from '../../store/useStore'
import { useUi } from '../../store/useUi'
import { NamedIcon } from '../ui/Icon'
import { NAV } from './nav'

/** Ctrl/Cmd+K. Opened from the keyboard, so it appears without animation. */
export function CommandMenu() {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const open = useUi((s) => s.command)
  const setOpen = useUi((s) => s.setCommand)
  const openStudio = useUi((s) => s.openStudio)
  const setDeals = useUi((s) => s.setDeals)
  const listings = useListings()
  const requests = useRequests()
  const users = useStore((s) => s.users)
  const setLang = useStore((s) => s.setLang)
  const setPersona = useStore((s) => s.setPersona)
  const finals = useStore((s) => s.finals)
  const setFinals = useStore((s) => s.setFinals)

  const run = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Popup className="fixed inset-x-3 top-[8dvh] z-50 mx-auto max-w-[620px] overflow-hidden rounded-sheet bg-white shadow-float outline-none">
          <Dialog.Title className="sr-only">{t('Search and commands', 'البحث والأوامر')}</Dialog.Title>
          <Command label={t('Search and commands', 'البحث والأوامر')} loop>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 shrink-0 text-turquoise" aria-hidden="true" />
              <Command.Input autoFocus placeholder={t('Search items, courses, sections or actions', 'ابحث عن غرض أو مادة أو قسم أو أمر')} className="h-14 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/60" />
              <kbd className="hidden rounded-[5px] border border-line px-1.5 text-[11.5px] text-muted sm:block">Esc</kbd>
            </div>
            <Command.List className="scroll-thin max-h-[min(60dvh,460px)] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-[14.5px] text-muted">{t('Nothing found. Try a course code like EE 202.', 'ما لقينا شي. جرّب رمز مادة مثل EE 202.')}</Command.Empty>

              <Command.Group heading={t('Actions', 'أوامر')}>
                <Command.Item onSelect={run(() => openStudio('sale'))} keywords={['sell', 'new', 'بيع', 'نشر']}>
                  <Plus className="size-4 text-turquoise" aria-hidden="true" />
                  {t('List something', 'اعرض غرضك')}
                </Command.Item>
                <Command.Item onSelect={run(() => openStudio('request'))} keywords={['iso', 'need', 'طلب']}>
                  <Megaphone className="size-4 text-turquoise" aria-hidden="true" />
                  {t('Post a request', 'انشر طلب')}
                </Command.Item>
                <Command.Item onSelect={run(() => setDeals(true))} keywords={['rental', 'countdown', 'صفقات']}>
                  <Briefcase className="size-4 text-turquoise" aria-hidden="true" />
                  {t('Open my deals', 'افتح صفقاتي')}
                </Command.Item>
                <Command.Item onSelect={run(() => setFinals(!finals))} keywords={['exam', 'emergency', 'فاينل', 'اختبار']}>
                  <Siren className="size-4 text-turquoise" aria-hidden="true" />
                  {finals ? t('Turn off Finals mode', 'أوقف وضع الفاينلات') : t('Turn on Finals mode', 'شغّل وضع الفاينلات')}
                </Command.Item>
                <Command.Item onSelect={run(() => setLang(lang === 'ar' ? 'en' : 'ar'))} keywords={['language', 'arabic', 'english', 'لغة', 'عربي']}>
                  <Languages className="size-4 text-turquoise" aria-hidden="true" />
                  {lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                </Command.Item>
              </Command.Group>

              <Command.Group heading={t('Sections', 'الأقسام')}>
                {NAV.map((n) => (
                  <Command.Item key={n.id} value={`section ${n.label.en} ${n.label.ar}`} onSelect={run(() => go(n.id))}>
                    <n.icon className="size-4 text-turquoise" aria-hidden="true" />
                    <span>{L(n.label)}</span>
                    <span className="ms-auto hidden truncate text-[12.5px] text-muted sm:block">{L(n.blurb)}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading={t('Listings', 'الإعلانات')}>
                {listings.map((l) => (
                  <Command.Item key={l.id} value={`${l.id} ${l.title.en} ${l.title.ar} ${l.course ?? ''} ${l.specs?.map((s) => s.v).join(' ') ?? ''}`} onSelect={run(() => openListing(l.id))}>
                    <NamedIcon name={l.icon} className="size-4 shrink-0 text-turquoise" />
                    <span className="min-w-0 flex-1 truncate">{L(l.title)}</span>
                    <span className="tabular shrink-0 text-[12.5px] text-muted">
                      {L(KINDS[l.kind])} · {l.price === 0 ? t('Free', 'مجانًا') : sar(l.price, lang)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading={t('Requests', 'الطلبات')}>
                {requests
                  .filter((r) => r.status === 'open')
                  .map((r) => (
                    <Command.Item key={r.id} value={`${r.id} ${r.title.en} ${r.title.ar} ${r.course ?? ''}`} onSelect={run(() => go('requests'))}>
                      <Megaphone className="size-4 shrink-0 text-turquoise" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{L(r.title)}</span>
                    </Command.Item>
                  ))}
              </Command.Group>

              <Command.Group heading={t('Demo', 'تجريبي')}>
                {PERSONAS.map((id) => {
                  const u = users.find((x) => x.id === id)
                  if (!u) return null
                  return (
                    <Command.Item key={id} value={`persona ${u.name.en} ${u.name.ar} ${u.major}`} onSelect={run(() => setPersona(id))}>
                      <UserRound className="size-4 text-turquoise" aria-hidden="true" />
                      {t(`View as ${u.name.en}`, `شوف بعين ${u.name.ar}`)}
                      <span className="ms-auto text-[12.5px] text-muted">
                        <span dir="ltr">{u.major}</span> · {L(u.level)}
                      </span>
                    </Command.Item>
                  )
                })}
                <Command.Item
                  onSelect={run(() => resetWithUndo(t))}
                  keywords={['clear', 'restore', 'إعادة']}
                >
                  <RotateCcw className="size-4 text-danger-ink" aria-hidden="true" />
                  {t('Reset demo data', 'إعادة البيانات التجريبية')}
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
