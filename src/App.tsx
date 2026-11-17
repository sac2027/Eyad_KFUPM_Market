import { DirectionProvider } from '@base-ui/react/direction-provider'
import { Briefcase, Ellipsis, Megaphone, Plus, Search, Store, Timer } from 'lucide-react'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { Logo } from './components/brand/Logo'
import { ListingDetail } from './components/listing/ListingDetail'
import { FinalsToggle, LangToggle, PersonaMenu } from './components/shell/Controls'
import { NAV } from './components/shell/nav'
import { Sheet } from './components/ui/Overlay'
import { cn } from './lib/cn'
import { useL, useLang, useT } from './lib/i18n'
import { type ViewId, go, useRoute } from './lib/router'
import { useStore } from './store/useStore'
import { useUi } from './store/useUi'
import { Market } from './views/Market'

const DealDrawer = lazy(() => import('./components/deals/DealDrawer').then((m) => ({ default: m.DealDrawer })))
const OfferDrawer = lazy(() => import('./components/iso/OfferDrawer').then((m) => ({ default: m.OfferDrawer })))
const CommandMenu = lazy(() => import('./components/shell/CommandMenu').then((m) => ({ default: m.CommandMenu })))
const QuickList = lazy(() => import('./components/studio/QuickList').then((m) => ({ default: m.QuickList })))
const VerifyModal = lazy(() => import('./components/verify/VerifyModal').then((m) => ({ default: m.VerifyModal })))
const Coop = lazy(() => import('./views/Coop').then((m) => ({ default: m.Coop })))
const PassItOn = lazy(() => import('./views/PassItOn').then((m) => ({ default: m.PassItOn })))
const Rent = lazy(() => import('./views/Rent').then((m) => ({ default: m.Rent })))
const Requests = lazy(() => import('./views/Requests').then((m) => ({ default: m.Requests })))
const Skills = lazy(() => import('./views/Skills').then((m) => ({ default: m.Skills })))
const Zones = lazy(() => import('./views/Zones').then((m) => ({ default: m.Zones })))

const VIEW: Record<ViewId, React.ComponentType> = {
  market: Market,
  rent: Rent,
  requests: Requests,
  coop: Coop,
  skills: Skills,
  passiton: PassItOn,
  zones: Zones,
}

function useActiveDeals(): number {
  return useStore((s) => s.deals.filter((d) => (d.buyerId === s.personaId || d.sellerId === s.personaId) && (d.status === 'reserved' || d.status === 'rented')).length)
}

function DealsButton({ compact }: { compact?: boolean }) {
  const t = useT()
  const count = useActiveDeals()
  const setDeals = useUi((s) => s.setDeals)
  return (
    <button
      type="button"
      onClick={() => setDeals(true)}
      className="press relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-control px-2 text-[14px] font-semibold text-frame-ink hover:bg-frame-soft xs:gap-2 xs:px-3"
      aria-label={t(`My deals, ${count} active`, `صفقاتي، ${count} نشطة`)}
    >
      <Briefcase className="size-[18px]" aria-hidden="true" />
      {compact ? null : <span>{t('My deals', 'صفقاتي')}</span>}
      {count > 0 ? (
        <span className="tabular inline-grid min-w-5 place-items-center rounded-full bg-yellow px-1.5 text-[12px] leading-5 font-bold text-black">{count}</span>
      ) : null}
    </button>
  )
}

function Sidebar({ view }: { view: ViewId }) {
  const L = useL()
  const t = useT()
  return (
    <aside className="on-frame hidden w-[244px] shrink-0 flex-col px-3 pt-4 pb-3 lg:flex">
      <a href="#/market" className="mb-5 rounded-control px-2 py-1" aria-label={t('KFUPM Market home', 'الصفحة الرئيسية لسوق البترول')}>
        <Logo />
      </a>
      <nav aria-label={t('Sections', 'الأقسام')} className="flex flex-col gap-0.5">
        {NAV.map((n) => {
          const on = n.id === view
          return (
            <a
              key={n.id}
              href={`#/${n.id}`}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'press flex min-h-11 items-center gap-3 rounded-control px-3 text-[14.5px] font-medium text-frame-ink',
                on ? 'bg-frame-soft font-semibold' : 'opacity-85 hover:bg-frame-soft hover:opacity-100',
              )}
            >
              <n.icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">{L(n.label)}</span>
              {on ? <span className="ms-auto h-4 w-0.5 rounded-full bg-frame-ink" aria-hidden="true" /> : null}
            </a>
          )
        })}
      </nav>
      <p className="mt-auto px-3 pt-6 text-[12px] leading-relaxed text-frame-ink/80">
        {t('Built by students for the KFUPM community. Not an official KFUPM service.', 'من طلاب الجامعة لمجتمع الجامعة. ليست خدمة رسمية من جامعة الملك فهد.')}
      </p>
    </aside>
  )
}

function TopBar() {
  const t = useT()
  const setCommand = useUi((s) => s.setCommand)
  const openStudio = useUi((s) => s.openStudio)
  return (
    <header className="on-frame flex h-14 shrink-0 items-center gap-0 px-1 xs:gap-1 xs:px-2 sm:gap-2 sm:px-3 lg:ps-1">
      <a href="#/market" className="rounded-control p-1 xs:me-1 lg:hidden" aria-label={t('KFUPM Market home', 'الصفحة الرئيسية لسوق البترول')}>
        <Logo compact />
      </a>
      <button
        type="button"
        onClick={() => setCommand(true)}
        className="press flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-control text-frame-ink hover:bg-frame-soft sm:min-w-0 sm:flex-1 sm:justify-start sm:bg-frame-soft sm:px-3.5 md:max-w-[420px]"
        aria-label={t('Search the market', 'ابحث في السوق')}
        aria-keyshortcuts="Meta+K Control+K"
      >
        <Search className="size-[18px] shrink-0" aria-hidden="true" />
        <span className="hidden truncate text-[14px] opacity-80 sm:inline">{t('Search items, courses, people', 'ابحث عن غرض أو مادة أو شخص')}</span>
        <kbd className="ms-auto hidden rounded-[5px] border border-frame-ink/30 px-1.5 font-sans text-[11.5px] opacity-80 md:inline" dir="ltr">
          Ctrl K
        </kbd>
      </button>
      <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
        <span className="hidden md:inline-flex">
          <FinalsToggle />
        </span>
        <span className="md:hidden">
          <FinalsToggle compact />
        </span>
        <span className="hidden sm:inline-flex">
          <DealsButton />
        </span>
        <span className="sm:hidden">
          <DealsButton compact />
        </span>
        <LangToggle />
        <PersonaMenu />
        <button
          type="button"
          onClick={() => openStudio('sale')}
          className="press ms-1 hidden min-h-11 items-center gap-2 rounded-control bg-frame-ink px-4 text-[14.5px] font-semibold text-frame lg:inline-flex"
        >
          <Plus className="size-[18px]" aria-hidden="true" />
          {t('List something', 'اعرض غرضك')}
        </button>
      </div>
    </header>
  )
}

function MobileNav({ view }: { view: ViewId }) {
  const t = useT()
  const L = useL()
  const openStudio = useUi((s) => s.openStudio)
  const [more, setMore] = useState(false)
  const main: { id: ViewId; icon: typeof Store; label: string }[] = [
    { id: 'market', icon: Store, label: t('Market', 'السوق') },
    { id: 'rent', icon: Timer, label: t('Rentals', 'الإيجار') },
  ]
  const item = 'press flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11.5px] font-medium'
  const moreOn = !['market', 'rent', 'requests'].includes(view)
  return (
    <>
      <nav aria-label={t('Sections', 'الأقسام')} className="on-frame fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-frame-ink/15 bg-frame pb-[env(safe-area-inset-bottom)] lg:hidden">
        {main.map((m) => (
          <a key={m.id} href={`#/${m.id}`} aria-current={view === m.id ? 'page' : undefined} className={cn(item, 'text-frame-ink', view === m.id ? 'font-bold' : 'opacity-75')}>
            <m.icon className="size-5" aria-hidden="true" />
            {m.label}
          </a>
        ))}
        <button type="button" onClick={() => openStudio('sale')} className={cn(item, 'text-frame-ink')} aria-label={t('List something', 'اعرض غرضك')}>
          <span className="inline-grid size-10 place-items-center rounded-full bg-frame-ink text-frame">
            <Plus className="size-5" aria-hidden="true" />
          </span>
        </button>
        <a href="#/requests" aria-current={view === 'requests' ? 'page' : undefined} className={cn(item, 'text-frame-ink', view === 'requests' ? 'font-bold' : 'opacity-75')}>
          <Megaphone className="size-5" aria-hidden="true" />
          {t('Requests', 'الطلبات')}
        </a>
        <button type="button" onClick={() => setMore(true)} className={cn(item, 'text-frame-ink', moreOn ? 'font-bold' : 'opacity-75')} aria-haspopup="dialog">
          <Ellipsis className="size-5" aria-hidden="true" />
          {t('More', 'المزيد')}
        </button>
      </nav>
      <Sheet open={more} onOpenChange={setMore} title={t('All sections', 'كل الأقسام')}>
        <ul className="p-3">
          {NAV.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  setMore(false)
                  go(n.id)
                }}
                aria-current={view === n.id ? 'page' : undefined}
                className={cn('press flex min-h-14 w-full items-center gap-3 rounded-control px-3 text-start', view === n.id ? 'bg-wash-strong' : 'hover:bg-wash')}
              >
                <n.icon className="size-5 shrink-0 text-turquoise" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold text-turquoise">{L(n.label)}</span>
                  <span className="block truncate text-[13px] text-muted">{L(n.blurb)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="px-6 pb-6 text-[12.5px] text-muted">
          {t('Built by students for the KFUPM community. Not an official KFUPM service.', 'من طلاب الجامعة لمجتمع الجامعة. ليست خدمة رسمية من جامعة الملك فهد.')}
        </p>
      </Sheet>
    </>
  )
}

/** Overlays load on first use so the market paints sooner. */
function Overlays() {
  const studio = useUi((s) => s.studio.open)
  const deals = useUi((s) => s.deals)
  const offer = useUi((s) => s.offerFor != null)
  const verify = useUi((s) => s.verify)
  const command = useUi((s) => s.command)
  const [seen, setSeen] = useState({ studio: false, deals: false, offer: false, verify: false, command: false })
  const next = { studio: seen.studio || studio, deals: seen.deals || deals, offer: seen.offer || offer, verify: seen.verify || verify, command: seen.command || command }
  if (Object.keys(next).some((k) => next[k as keyof typeof next] !== seen[k as keyof typeof seen])) setSeen(next)
  return (
    <>
      {next.studio ? <QuickList /> : null}
      {next.deals ? <DealDrawer /> : null}
      {next.offer ? <OfferDrawer /> : null}
      {next.verify ? <VerifyModal /> : null}
      {next.command ? <CommandMenu /> : null}
    </>
  )
}

export default function App() {
  const lang = useLang()
  const t = useT()
  const finals = useStore((s) => s.finals)
  const route = useRoute()
  const setCommand = useUi((s) => s.setCommand)
  const View = VIEW[route.view]

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = lang === 'ar' ? 'سوق البترول · KFUPM Market' : 'KFUPM Market · سوق البترول'
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.finals = finals ? 'on' : 'off'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', finals ? '#115F66' : '#ECE0C7')
  }, [finals])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommand(true)
      }
      // Alt+L switches language from anywhere, including inside an open drawer.
      if (e.altKey && e.code === 'KeyL') {
        e.preventDefault()
        const s = useStore.getState()
        s.setLang(s.lang === 'ar' ? 'en' : 'ar')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCommand])

  // Move focus and scroll to the top of the new section.
  useEffect(() => {
    document.getElementById('main')?.scrollTo({ top: 0 })
  }, [route.view])

  return (
    <DirectionProvider direction={lang === 'ar' ? 'rtl' : 'ltr'}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-control focus:bg-turquoise focus:px-4 focus:py-2 focus:text-white">
        {t('Skip to content', 'انتقل للمحتوى')}
      </a>
      <div className="flex h-dvh">
        <Sidebar view={route.view} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main
            id="main"
            tabIndex={-1}
            className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-sheet outline-none max-lg:pb-[calc(56px+env(safe-area-inset-bottom))] lg:me-2 lg:mb-2 lg:rounded-sheet"
          >
            <div key={route.view} className="mx-auto w-full max-w-[1400px] px-4 pt-5 pb-10 sm:px-6 lg:px-8 lg:pt-7">
              <Suspense fallback={null}>
                <View />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
      <MobileNav view={route.view} />
      <ListingDetail id={route.listingId} />
      <Suspense fallback={null}>
        <Overlays />
      </Suspense>
      <Toaster position={lang === 'ar' ? 'bottom-left' : 'bottom-right'} dir={lang === 'ar' ? 'rtl' : 'ltr'} toastOptions={{ style: { fontFamily: 'var(--font-sans)', borderRadius: 12 } }} mobileOffset={{ bottom: 76 }} />
    </DirectionProvider>
  )
}
