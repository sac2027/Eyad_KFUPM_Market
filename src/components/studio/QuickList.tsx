import { ImagePlus, Plus, Trash2, Zap } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CATEGORIES, CONDITIONS, KINDS, PAYMENTS, RATE_UNITS, URGENCY } from '../../data/categories'
import { BELTS, ZONES } from '../../data/zones'
import { cn } from '../../lib/cn'
import { fromLocalInput, sar, toLocalInput } from '../../lib/format'
import { useVerifiedAction } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { suggestPrice, verdict } from '../../lib/pricing'
import { go, openListing } from '../../lib/router'
import type { CategoryId, Condition, IsoRequest, Kind, Listing, Payment, RateUnit, Tone, Urgency, ZoneId } from '../../lib/types'
import { usePersona, useStore } from '../../store/useStore'
import { type StudioMode, useUi } from '../../store/useUi'
import { Button, IconButton } from '../ui/Button'
import { Field } from '../ui/Field'
import { NamedIcon } from '../ui/Icon'
import { Modal } from '../ui/Overlay'
import { Chip, Segmented } from '../ui/Segmented'

const HOUR = 3_600_000
const MODES: StudioMode[] = ['sale', 'rent', 'bundle', 'free', 'service', 'groupbuy', 'request']
const UNITS: RateUnit[] = ['exam', 'hour', 'day', 'weekend', 'week']
const TONES: Tone[] = ['beige', 'turquoise', 'sand', 'blue', 'green', 'yellow']

interface Preset {
  en: string
  ar: string
  category: CategoryId
  icon: string
  course?: string
  modes: StudioMode[]
}

/** One tap fills the title, category and course. */
const PRESETS: Preset[] = [
  { en: 'Casio fx-991 calculator', ar: 'حاسبة كاسيو fx-991', category: 'academic', icon: 'Calculator', course: 'MATH 101', modes: ['sale', 'rent', 'free', 'request'] },
  { en: 'Lab coat and goggles', ar: 'بالطو مختبر ونظارة', category: 'academic', icon: 'Shirt', course: 'CHEM 101', modes: ['sale', 'rent', 'free', 'request'] },
  { en: 'Lab manual and notes', ar: 'مذكرة لاب وملخصات', category: 'academic', icon: 'Book', course: 'PHYS 102', modes: ['sale', 'free'] },
  { en: 'Mini-fridge', ar: 'ثلاجة صغيرة', category: 'dorm', icon: 'Refrigerator', modes: ['sale', 'free', 'request'] },
  { en: '27" monitor', ar: 'شاشة 27 بوصة', category: 'dorm', icon: 'Monitor', modes: ['sale', 'rent'] },
  { en: 'Mountain bike', ar: 'سيكل جبلي', category: 'mobility', icon: 'Bike', modes: ['sale', 'rent'] },
  { en: 'ESP32 dev board', ar: 'بورد ESP32', category: 'hardware', icon: 'Cpu', course: 'SDP', modes: ['sale', 'groupbuy', 'request', 'free'] },
  { en: 'DE10-Lite FPGA board', ar: 'بورد DE10-Lite', category: 'hardware', icon: 'CircuitBoard', course: 'COE 203', modes: ['sale', 'rent'] },
  { en: 'Soldering station', ar: 'محطة لحام', category: 'hardware', icon: 'Zap', course: 'EE 202', modes: ['rent', 'request'] },
  { en: 'PS5 controllers', ar: 'أيادي بلايستيشن 5', category: 'gaming', icon: 'Gamepad2', modes: ['sale', 'rent'] },
  { en: 'Camping set', ar: 'عزبة كشتة', category: 'camping', icon: 'Tent', modes: ['rent', 'sale'] },
  { en: 'Dorm room move-out', ar: 'تصفية غرفة السكن', category: 'dorm', icon: 'Refrigerator', modes: ['bundle'] },
  { en: 'Prep-year starter pack', ar: 'باقة أوريا', category: 'academic', icon: 'GraduationCap', course: 'PREP', modes: ['bundle'] },
  { en: '3D printing', ar: 'طباعة ثلاثية الأبعاد', category: 'services', icon: 'Printer', modes: ['service'] },
  { en: 'Tutoring', ar: 'شرح ومراجعة', category: 'services', icon: 'GraduationCap', course: 'MATH 101', modes: ['service'] },
  { en: 'Photo session', ar: 'جلسة تصوير', category: 'services', icon: 'Camera', modes: ['service'] },
  { en: 'Ride to Khobar', ar: 'مشوار للخبر', category: 'services', icon: 'Package', modes: ['service', 'request'] },
]

const CATEGORY_ICON: Record<CategoryId, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.icon])) as Record<CategoryId, string>

interface Draft {
  title: string
  desc: string
  category: CategoryId
  icon: string
  course: string
  condition: Condition
  price: string
  zone: ZoneId
  payment: Payment[]
  instant: boolean
  photo: string
  rates: Partial<Record<RateUnit, string>>
  deposit: number
  lateFee: string
  items: { name: string; price: string }[]
  serviceUnit: 'hour' | 'session' | 'job'
  barterFor: string
  passItOn: boolean
  retail: string
  target: string
  days: string
  supplier: string
  urgency: Urgency
  bounty: IsoRequest['bounty']
  neededBy: string
}

const SERVICE_UNITS = {
  hour: { en: 'per hour', ar: 'للساعة' },
  session: { en: 'per session', ar: 'للجلسة' },
  job: { en: 'per job', ar: 'للمهمة' },
}

const toNum = (v: string | undefined): number => {
  const n = Number(v)
  return v != null && v.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : NaN
}

async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.72)
}

function PriceAssistant({ category, condition, kind, price, onPick }: { category: CategoryId; condition: Condition; kind: Kind; price: number; onPick: (n: number) => void }) {
  const t = useT()
  const lang = useLang()
  const listings = useStore((s) => s.listings)
  const s = useMemo(() => suggestPrice(category, condition, kind, listings), [category, condition, kind, listings])
  const v = Number.isFinite(price) ? verdict(price, s) : null
  const span = s.high * 1.5
  const pct = (n: number) => `${Math.min(100, Math.max(0, (n / span) * 100))}%`
  const mid = Math.round((s.low + s.high) / 2 / 5) * 5
  const text =
    v === 'low'
      ? t('Below the usual range. It will go fast.', 'أقل من المعتاد. بيروح بسرعة.')
      : v === 'high'
        ? t('Above the usual range. Expect offers under it.', 'أعلى من المعتاد. توقّع عروض أقل.')
        : v === 'fair'
          ? t('Inside the usual campus range.', 'ضمن النطاق المعتاد في الجامعة.')
          : t('Tap a price to use it.', 'اضغط على سعر عشان تستخدمه.')
  return (
    <div className="rounded-card bg-wash p-3.5" aria-live="polite">
      <p className="text-[13.5px] font-semibold text-turquoise">
        {kind === 'rent'
          ? t(`Students rent this out for ${sar(s.low, lang)} to ${sar(s.high, lang)} a day`, `الطلاب يأجرونه بين ${sar(s.low, lang)} و ${sar(s.high, lang)} في اليوم`)
          : t(`Students list this for ${sar(s.low, lang)} to ${sar(s.high, lang)}`, `الطلاب يعرضونه بين ${sar(s.low, lang)} و ${sar(s.high, lang)}`)}
      </p>
      <div className="relative mt-3 h-2 rounded-full bg-black/10" dir="ltr" aria-hidden="true">
        <div className="absolute inset-y-0 rounded-full bg-green" style={{ left: pct(s.low), width: `calc(${pct(s.high)} - ${pct(s.low)})` }} />
        {Number.isFinite(price) ? <div className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-turquoise transition-[left] duration-200 ease-out" style={{ left: pct(price) }} /> : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {[s.low, mid, s.high].map((p, i) => (
          <button key={i} type="button" onClick={() => onPick(p)} className="press tabular inline-flex min-h-9 items-center rounded-full border border-turquoise/30 bg-white px-3 text-[13px] font-semibold text-turquoise hover:border-turquoise">
            {sar(p, lang)}
          </button>
        ))}
        <span className="text-[13px] text-muted">{text}</span>
      </div>
      <p className="mt-2 text-[12px] text-muted">
        {s.comparables >= 3
          ? t(`Based on ${s.comparables} similar listings on the market now and typical campus prices.`, `مبني على ${s.comparables} إعلانات مشابهة في السوق الحين وعلى الأسعار المعتادة.`)
          : t('Based on typical campus prices for this category and condition.', 'مبني على الأسعار المعتادة في الجامعة لهذا التصنيف والحالة.')}
      </p>
    </div>
  )
}

function Form({ initial, onDone }: { initial: StudioMode; onDone: () => void }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const me = usePersona()
  const addListing = useStore((s) => s.addListing)
  const addRequest = useStore((s) => s.addRequest)
  const guard = useVerifiedAction()
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [mode, setMode] = useState<StudioMode>(initial)
  const [tried, setTried] = useState(false)
  const [d, setD] = useState<Draft>(() => ({
    title: '',
    desc: '',
    category: initial === 'service' ? 'services' : initial === 'groupbuy' ? 'hardware' : 'academic',
    icon: initial === 'service' ? 'Wrench' : initial === 'groupbuy' ? 'Cpu' : 'Calculator',
    course: '',
    condition: 'good',
    price: '',
    zone: me.home,
    payment: ['stc', 'cash'],
    instant: false,
    photo: '',
    rates: { day: '' },
    deposit: 50,
    lateFee: '5',
    items: [
      { name: '', price: '' },
      { name: '', price: '' },
    ],
    serviceUnit: 'session',
    barterFor: '',
    passItOn: Boolean(me.graduating),
    retail: '',
    target: '10',
    days: '5',
    supplier: '',
    urgency: 'week',
    bounty: 'rent',
    neededBy: toLocalInput(Math.ceil((Date.now() + 6 * HOUR) / (30 * 60_000)) * 30 * 60_000),
  }))
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))

  const isRequest = mode === 'request'
  const kind = (isRequest ? 'sale' : mode) as Kind
  const price = toNum(d.price)
  const itemsSum = d.items.reduce((s, i) => s + (toNum(i.price) || 0), 0)
  const filledItems = d.items.filter((i) => i.name.trim() !== '')
  const anyRate = UNITS.some((u) => Number.isFinite(toNum(d.rates[u])) && toNum(d.rates[u]) > 0)
  const neededBy = fromLocalInput(d.neededBy)
  const showCourse = d.category === 'academic' || d.category === 'hardware' || d.category === 'services'

  const errors = {
    title: d.title.trim().length < 3 ? t('Give it a name of at least 3 letters.', 'اكتب اسم من 3 حروف على الأقل.') : undefined,
    price:
      (mode === 'sale' || mode === 'bundle' || mode === 'service' || mode === 'groupbuy') && !Number.isFinite(price)
        ? t('Enter a price in SAR. Use 0 for free.', 'اكتب السعر بالريال. حط 0 لو مجانًا.')
        : mode === 'request' && d.price.trim() !== '' && !Number.isFinite(price)
          ? t('Enter a number, or leave it empty.', 'اكتب رقم أو اتركه فاضي.')
          : undefined,
    rates: mode === 'rent' && !anyRate ? t('Set at least one rate above 0.', 'حدد سعر واحد على الأقل أكبر من 0.') : undefined,
    items: mode === 'bundle' && filledItems.length < 2 ? t('A bundle needs at least two named items.', 'الباقة تحتاج قطعتين على الأقل بأسماء.') : undefined,
    target: mode === 'groupbuy' && !(toNum(d.target) >= 2) ? t('Target must be 2 units or more.', 'الهدف لازم يكون حبتين أو أكثر.') : undefined,
    neededBy: mode === 'request' && !(neededBy > Date.now()) ? t('Pick a time in the future.', 'اختر وقت في المستقبل.') : undefined,
    payment: !isRequest && mode !== 'free' && d.payment.length === 0 ? t('Choose at least one way to settle.', 'اختر طريقة دفع وحدة على الأقل.') : undefined,
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const show = <K extends keyof typeof errors>(k: K) => (tried ? errors[k] : undefined)

  const presets = PRESETS.filter((p) => p.modes.includes(mode))

  const submit = () => {
    setTried(true)
    if (hasErrors) {
      toast.error(t('Fix the highlighted fields first.', 'صحّح الخانات المحددة أول.'))
      // Wait for the error state to render, then move focus to the first bad field.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    guard(() => {
      const now = Date.now()
      const id = `${mode}-${now.toString(36)}`
      const bi = (s: string) => ({ en: s.trim(), ar: s.trim() })
      if (isRequest) {
        addRequest({
          id,
          title: bi(d.title),
          desc: bi(d.desc),
          urgency: d.urgency,
          budget: Number.isFinite(price) ? price : 0,
          bounty: d.bounty,
          neededBy,
          zone: d.zone,
          course: d.course.trim() || undefined,
          category: d.category,
          requesterId: me.id,
          offers: [],
          status: 'open',
          createdAt: now,
        })
        toast.success(t('Request posted', 'تم نشر الطلب'), { description: t('It is at the top of the board for students nearby.', 'طلبك أول اللوحة عند الطلاب القريبين.') })
        onDone()
        go('requests')
        return
      }
      const rates: Partial<Record<RateUnit, number>> = {}
      for (const u of UNITS) {
        const n = toNum(d.rates[u])
        if (Number.isFinite(n) && n > 0) rates[u] = n
      }
      const listing: Listing = {
        id,
        kind,
        title: bi(d.title),
        desc: bi(d.desc),
        category: d.category,
        course: showCourse && d.course.trim() ? d.course.trim().toUpperCase() : undefined,
        condition: kind === 'service' || kind === 'groupbuy' ? 'new' : d.condition,
        price: kind === 'free' ? 0 : kind === 'rent' ? Math.min(...(Object.values(rates) as number[])) : price,
        zone: d.zone,
        payment: kind === 'free' ? ['free'] : d.payment,
        sellerId: me.id,
        status: 'available',
        createdAt: now,
        instant: d.instant || undefined,
        passItOn: kind === 'free' && d.passItOn ? true : undefined,
        icon: d.icon,
        tone: TONES[now % TONES.length],
        photo: d.photo || undefined,
      }
      if (kind === 'rent') listing.rent = { rates, deposit: d.deposit, lateFeePerHour: toNum(d.lateFee) || 0, terms: bi(t('Return it clean and working.', 'رجّعه نظيف وشغّال.')) }
      if (kind === 'bundle') listing.bundle = { items: filledItems.map((i) => ({ name: bi(i.name), price: toNum(i.price) || 0 })) }
      if (kind === 'service') listing.service = { unit: SERVICE_UNITS[d.serviceUnit], barterFor: d.barterFor.trim() ? bi(d.barterFor) : undefined }
      if (kind === 'groupbuy')
        listing.groupBuy = {
          unitPrice: price,
          retailPrice: toNum(d.retail) || price,
          target: Math.round(toNum(d.target)),
          joined: [{ userId: me.id, qty: 1 }],
          deadline: now + (toNum(d.days) || 5) * 24 * HOUR,
          supplier: d.supplier.trim() || t('the supplier', 'المورّد'),
        }
      addListing(listing)
      toast.success(t('Listed', 'تم النشر'), {
        description: t('Students can see it now.', 'صار ظاهر للطلاب.'),
        action: { label: t('View', 'عرض'), onClick: () => openListing(id) },
      })
      onDone()
      go(kind === 'rent' ? 'rent' : kind === 'service' ? 'skills' : kind === 'groupbuy' ? 'coop' : kind === 'free' && listing.passItOn ? 'passiton' : 'market')
    })
  }

  const priceLabel =
    mode === 'bundle'
      ? t('Bundle price, SAR', 'سعر الباقة بالريال')
      : mode === 'service'
        ? t('Rate, SAR', 'السعر بالريال')
        : mode === 'groupbuy'
          ? t('Price per unit, SAR', 'سعر الحبة بالريال')
          : mode === 'request'
            ? t('What you would pay, SAR', 'كم تدفع بالريال')
            : t('Price, SAR', 'السعر بالريال')

  return (
    <form
      ref={formRef}
      noValidate
      className="flex min-w-0 flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="flex min-w-0 flex-col gap-5 px-5 py-5 sm:px-6 [&>*]:min-w-0">
        <Segmented
          label={t('What are you posting?', 'وش تبي تنشر؟')}
          value={mode}
          onChange={(m) => {
            setMode(m)
            setTried(false)
            if (m === 'service') set({ category: 'services', icon: 'Wrench' })
            if (m === 'groupbuy') set({ category: 'hardware', icon: 'Cpu' })
          }}
          options={MODES.map((m) => ({ value: m, label: m === 'request' ? t('Request', 'طلب') : m === 'sale' ? t('Sell', 'بيع') : m === 'rent' ? t('Rent out', 'تأجير') : m === 'free' ? t('Give away', 'لوجه الله') : L(KINDS[m]) }))}
        />

        <div>
          <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Start from a common item', 'ابدأ من غرض شائع')}</p>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto sm:flex-wrap">
            {presets.map((p) => (
              <Chip key={p.en} on={d.title === (lang === 'ar' ? p.ar : p.en)} onClick={() => set({ title: lang === 'ar' ? p.ar : p.en, category: p.category, icon: p.icon, course: p.course ?? '' })}>
                <NamedIcon name={p.icon} className="size-4" />
                {lang === 'ar' ? p.ar : p.en}
              </Chip>
            ))}
          </div>
        </div>

        <Field label={isRequest ? t('What do you need?', 'وش تحتاج؟') : t('Title', 'العنوان')} error={show('title')}>
          {({ id, describedBy, invalid }) => (
            <input id={id} className="field" value={d.title} maxLength={90} onChange={(e) => set({ title: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="off" placeholder={isRequest ? t('Casio fx-991CW for tonight’s major', 'حاسبة كاسيو لميجر الليلة') : t('Casio fx-991CW, like new', 'حاسبة كاسيو fx-991CW شبه جديدة')} />
          )}
        </Field>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
          <Field label={t('Category', 'التصنيف')}>
            {({ id }) => (
              <select id={id} className="field" value={d.category} onChange={(e) => set({ category: e.target.value as CategoryId, icon: CATEGORY_ICON[e.target.value as CategoryId] })}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {L(c.name)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {showCourse ? (
            <Field label={t('Course code', 'رمز المادة')} hint={t('Optional. Helps classmates find it.', 'اختياري. يساعد زملاءك يلقونه.')}>
              {({ id, describedBy }) => <input id={id} className="field" dir="ltr" value={d.course} maxLength={12} onChange={(e) => set({ course: e.target.value })} aria-describedby={describedBy} placeholder="EE 202" autoCapitalize="characters" autoComplete="off" />}
            </Field>
          ) : null}
          {!isRequest && mode !== 'service' && mode !== 'groupbuy' ? (
            <div className={showCourse ? 'sm:col-span-2' : ''}>
              <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Condition', 'الحالة')}</p>
              <Segmented label={t('Condition', 'الحالة')} value={d.condition} onChange={(condition) => set({ condition })} options={(Object.keys(CONDITIONS) as Condition[]).map((c) => ({ value: c, label: L(CONDITIONS[c]) }))} />
            </div>
          ) : null}
        </div>

        {mode === 'rent' ? (
          <fieldset>
            <legend className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Rates in SAR. Fill the ones you offer.', 'الأسعار بالريال. عبّ اللي تقدّمه.')}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {UNITS.map((u) => (
                <label key={u} className="block">
                  <span className="mb-1 block text-[12.5px] text-muted">{L(RATE_UNITS[u].per)}</span>
                  <input className="field tabular" type="number" inputMode="numeric" min={0} value={d.rates[u] ?? ''} onChange={(e) => set({ rates: { ...d.rates, [u]: e.target.value } })} placeholder="—" aria-invalid={Boolean(show('rates'))} />
                </label>
              ))}
            </div>
            {show('rates') ? (
              <p className="mt-1.5 text-[12.5px] font-medium text-danger-ink" role="alert">
                {show('rates')}
              </p>
            ) : null}
            <div className="mt-3">
              <PriceAssistant category={d.category} condition={d.condition} kind="rent" price={toNum(d.rates.day)} onPick={(n) => set({ rates: { ...d.rates, day: String(n) } })} />
            </div>
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[1fr_160px]">
              <Field label={t(`Refundable deposit: ${sar(d.deposit, lang)}`, `التأمين المسترد: ${sar(d.deposit, lang)}`)} hint={t('Collected at pickup, handed back on return.', 'يُستلم عند التسليم ويرجع عند الإرجاع.')}>
                {({ id, describedBy }) => <input id={id} type="range" min={0} max={1000} step={10} value={d.deposit} onChange={(e) => set({ deposit: Number(e.target.value) })} aria-describedby={describedBy} className="h-11 w-full accent-turquoise" />}
              </Field>
              <Field label={t('Late fee per hour', 'غرامة التأخير للساعة')}>
                {({ id }) => <input id={id} className="field tabular" type="number" inputMode="numeric" min={0} value={d.lateFee} onChange={(e) => set({ lateFee: e.target.value })} />}
              </Field>
            </div>
          </fieldset>
        ) : null}

        {mode === 'bundle' ? (
          <fieldset>
            <legend className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Items in the bundle', 'محتويات الباقة')}</legend>
            <ul className="flex flex-col gap-2">
              {d.items.map((it, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input className="field min-w-0 flex-1" value={it.name} maxLength={60} placeholder={t(`Item ${i + 1}`, `القطعة ${i + 1}`)} aria-label={t(`Item ${i + 1} name`, `اسم القطعة ${i + 1}`)} onChange={(e) => set({ items: d.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                  <input className="field tabular !w-24 shrink-0" type="number" inputMode="numeric" min={0} value={it.price} placeholder={t('SAR', 'ر.س')} aria-label={t(`Item ${i + 1} price in SAR`, `سعر القطعة ${i + 1} بالريال`)} onChange={(e) => set({ items: d.items.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })} />
                  <IconButton label={t(`Remove item ${i + 1}`, `احذف القطعة ${i + 1}`)} disabled={d.items.length <= 2} onClick={() => set({ items: d.items.filter((_, j) => j !== i) })} className="text-turquoise hover:bg-wash-strong disabled:opacity-30">
                    <Trash2 className="size-4" aria-hidden="true" />
                  </IconButton>
                </li>
              ))}
            </ul>
            {show('items') ? (
              <p className="mt-1.5 text-[12.5px] font-medium text-danger-ink" role="alert">
                {show('items')}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" size="sm" disabled={d.items.length >= 12} onClick={() => set({ items: [...d.items, { name: '', price: '' }] })}>
                <Plus className="size-4" aria-hidden="true" />
                {t('Add item', 'أضف قطعة')}
              </Button>
              <p className="tabular text-[13.5px] text-muted">
                {t(`Items add up to ${sar(itemsSum, lang)}`, `مجموع القطع ${sar(itemsSum, lang)}`)}
                {Number.isFinite(price) && itemsSum > price && price > 0 ? <strong className="ms-2 font-semibold text-turquoise">{t(`Buyer saves ${Math.round((1 - price / itemsSum) * 100)}%`, `المشتري يوفّر ${Math.round((1 - price / itemsSum) * 100)}%`)}</strong> : null}
              </p>
            </div>
          </fieldset>
        ) : null}

        {mode !== 'rent' && mode !== 'free' ? (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            <Field label={priceLabel} error={show('price')} hint={mode === 'request' ? t('Leave empty if you are asking for a favor.', 'اتركه فاضي لو تبيها فزعة.') : undefined} className={mode === 'sale' ? 'sm:col-span-2' : ''}>
              {({ id, describedBy, invalid }) => <input id={id} className="field tabular" type="number" inputMode="numeric" min={0} value={d.price} onChange={(e) => set({ price: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} placeholder={mode === 'bundle' && itemsSum > 0 ? String(Math.round((itemsSum * 0.85) / 5) * 5) : '0'} />}
            </Field>
            {mode === 'service' ? (
              <>
                <div>
                  <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('Charged', 'الحساب')}</p>
                  <Segmented label={t('Charged', 'الحساب')} value={d.serviceUnit} onChange={(serviceUnit) => set({ serviceUnit })} options={(['hour', 'session', 'job'] as const).map((u) => ({ value: u, label: L(SERVICE_UNITS[u]) }))} />
                </div>
                <Field label={t('Would swap for', 'أقايض مقابل')} hint={t('Optional. A skill you would take instead of money.', 'اختياري. مهارة تقبلها بدل الفلوس.')} className="sm:col-span-2">
                  {({ id, describedBy }) => <input id={id} className="field" value={d.barterFor} maxLength={60} onChange={(e) => set({ barterFor: e.target.value })} aria-describedby={describedBy} placeholder={t('MATH 202 tutoring', 'شرح MATH 202')} />}
                </Field>
              </>
            ) : null}
            {mode === 'groupbuy' ? (
              <>
                <Field label={t('Price if bought alone, SAR', 'السعر لو تشتريه لحالك')}>{({ id }) => <input id={id} className="field tabular" type="number" inputMode="numeric" min={0} value={d.retail} onChange={(e) => set({ retail: e.target.value })} />}</Field>
                <Field label={t('Units needed to order', 'عدد الحبات المطلوب')} error={show('target')}>
                  {({ id, describedBy, invalid }) => <input id={id} className="field tabular" type="number" inputMode="numeric" min={2} value={d.target} onChange={(e) => set({ target: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
                </Field>
                <Field label={t('Order closes in, days', 'تقفل الطلبية بعد كم يوم')}>{({ id }) => <input id={id} className="field tabular" type="number" inputMode="numeric" min={1} max={30} value={d.days} onChange={(e) => set({ days: e.target.value })} />}</Field>
                <Field label={t('Supplier', 'المورّد')} className="sm:col-span-2">
                  {({ id }) => <input id={id} className="field" dir="ltr" value={d.supplier} maxLength={40} onChange={(e) => set({ supplier: e.target.value })} placeholder="AliExpress, JLCPCB, Digi-Key" />}
                </Field>
              </>
            ) : null}
            {mode === 'request' ? (
              <div>
                <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('You want to', 'تبي')}</p>
                <Segmented
                  label={t('You want to', 'تبي')}
                  value={d.bounty}
                  onChange={(bounty) => set({ bounty })}
                  options={[
                    { value: 'rent', label: t('Rent it', 'تستأجره') },
                    { value: 'buy', label: t('Buy it', 'تشتريه') },
                    { value: 'favor', label: t('Ask a favor', 'فزعة') },
                  ]}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === 'sale' || mode === 'bundle' ? <PriceAssistant category={d.category} condition={d.condition} kind={kind} price={price} onPick={(n) => set({ price: String(n) })} /> : null}

        {mode === 'request' ? (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('How urgent is it?', 'كم هو مستعجل؟')}</p>
              <Segmented
                label={t('Urgency', 'الاستعجال')}
                value={d.urgency}
                onChange={(urgency) => set({ urgency, neededBy: toLocalInput(Date.now() + (urgency === 'emergency' ? 3 : urgency === 'week' ? 72 : 168) * HOUR) })}
                options={(Object.keys(URGENCY) as Urgency[]).map((u) => ({ value: u, label: L(URGENCY[u]) }))}
              />
            </div>
            <Field label={t('Needed by', 'مطلوب قبل')} error={show('neededBy')} className="sm:col-span-2">
              {({ id, describedBy, invalid }) => <input id={id} className="field" type="datetime-local" value={d.neededBy} onChange={(e) => set({ neededBy: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
            </Field>
          </div>
        ) : null}

        <Field label={isRequest ? t('Where can you meet?', 'وين تقدر تقابل؟') : t('Meetup spot', 'مكان التسليم')}>
          {({ id }) => (
            <select id={id} className="field" value={d.zone} onChange={(e) => set({ zone: e.target.value as ZoneId })}>
              {(['academic', 'housing', 'hubs'] as const).map((belt) => (
                <optgroup key={belt} label={L(BELTS[belt])}>
                  {ZONES.filter((z) => z.belt === belt).map((z) => (
                    <option key={z.id} value={z.id}>
                      {L(z.name)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </Field>

        {!isRequest && mode !== 'free' ? (
          <fieldset>
            <legend className="mb-1.5 text-[13.5px] font-semibold text-turquoise">{t('How buyers can settle at the meetup', 'طرق الدفع عند التسليم')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {(['stc', 'bank', 'cash', 'barter'] as Payment[]).map((p) => {
                const on = d.payment.includes(p)
                return (
                  <Chip key={p} on={on} onClick={() => set({ payment: on ? d.payment.filter((x) => x !== p) : [...d.payment, p] })}>
                    {L(PAYMENTS[p])}
                  </Chip>
                )
              })}
            </div>
            {show('payment') ? (
              <p className="mt-1.5 text-[12.5px] font-medium text-danger-ink" role="alert">
                {show('payment')}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        <Field label={t('Details', 'التفاصيل')} hint={t('Optional. Condition notes, what is included, when you are free.', 'اختياري. ملاحظات الحالة، وش معه، ومتى تكون فاضي.')}>
          {({ id, describedBy }) => <textarea id={id} className="field min-h-20 resize-y" maxLength={400} value={d.desc} onChange={(e) => set({ desc: e.target.value })} aria-describedby={describedBy} />}
        </Field>

        {!isRequest ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex min-h-11 items-center gap-3 text-[14.5px]">
              <input type="checkbox" className="size-5 accent-turquoise" checked={d.instant} onChange={(e) => set({ instant: e.target.checked })} />
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-4 text-turquoise" aria-hidden="true" />
                {t('I can hand it over within 15 minutes', 'أقدر أسلّمه خلال 15 دقيقة')}
              </span>
            </label>
            {mode === 'free' ? (
              <label className="flex min-h-11 items-center gap-3 text-[14.5px]">
                <input type="checkbox" className="size-5 accent-turquoise" checked={d.passItOn} onChange={(e) => set({ passItOn: e.target.checked })} />
                {t('Put it in the Pass-It-On box', 'حطه في صندوق الخريجين')}
              </label>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label={t('Add a photo', 'أضف صورة')}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  try {
                    set({ photo: await shrink(file) })
                  } catch {
                    toast.error(t('That file is not an image we can read. Try a JPG or PNG.', 'ما قدرنا نقرأ الملف كصورة. جرّب JPG أو PNG.'))
                  }
                }}
              />
              {d.photo ? <img src={d.photo} alt={t('Your photo', 'صورتك')} className="size-11 rounded-control object-cover" /> : null}
              <Button variant="secondary" size="sm" className="!min-h-11" onClick={() => (d.photo ? set({ photo: '' }) : fileRef.current?.click())}>
                <ImagePlus className="size-4" aria-hidden="true" />
                {d.photo ? t('Remove photo', 'احذف الصورة') : t('Add a photo', 'أضف صورة')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className={cn('sticky bottom-0 flex items-center gap-3 border-t border-line bg-white px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6')}>
        <p className="hidden min-w-0 flex-1 text-[12.5px] text-muted sm:block">
          {t(`Posting as ${L(me.name)}. No payment happens in the app.`, `النشر باسم ${L(me.name)}. ما فيه دفع داخل التطبيق.`)}
        </p>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          {isRequest ? t('Post request', 'انشر الطلب') : mode === 'free' ? t('Give it away', 'اعرضه لوجه الله') : mode === 'groupbuy' ? t('Start group buy', 'ابدأ الطلبية') : t('Publish listing', 'انشر الإعلان')}
        </Button>
      </div>
    </form>
  )
}

export function QuickList() {
  const t = useT()
  const studio = useUi((s) => s.studio)
  const close = useUi((s) => s.closeStudio)
  const [nonce, setNonce] = useState(0)
  const [wasOpen, setWasOpen] = useState(false)
  // A fresh form each time the studio opens.
  if (studio.open !== wasOpen) {
    setWasOpen(studio.open)
    if (studio.open) setNonce((n) => n + 1)
  }
  return (
    <Modal open={studio.open} onOpenChange={(o) => !o && close()} wide title={t('Quick List', 'نشر سريع')} description={t('Most listings take under 30 seconds. Start from a preset and adjust.', 'أغلب الإعلانات تخلص في أقل من 30 ثانية. ابدأ من غرض جاهز وعدّل عليه.')}>
      <Form key={nonce} initial={studio.mode} onDone={close} />
    </Modal>
  )
}

