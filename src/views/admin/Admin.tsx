import { Tabs } from '@base-ui/react/tabs'
import { ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '../../components/ui/Button'
import { CATEGORIES } from '../../data/categories'
import { ADMIN_ID } from '../../data/users'
import { cn } from '../../lib/cn'
import { duration } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { useL, useLang, useT } from '../../lib/i18n'
import { usePersona, useStore } from '../../store/useStore'
import { PageHeader } from '../shared'
import { Activity, AnnouncementTab, ListingsTab, RentalsTab, ReportsTab, StudentsTab } from './tabs'


/** One figure with its label. Sits in a row split by dividers, not in its own card. */
function Kpi({ label, value, note, alert }: { label: string; value: string | number; note?: string; alert?: boolean }) {
  return (
    <div className="min-w-0 lg:px-4 lg:first:ps-0 lg:last:pe-0">
      <dt className="truncate text-[13px] text-muted">{label}</dt>
      <dd className="tabular mt-0.5 font-display text-[26px] leading-tight font-bold text-turquoise">{value}</dd>
      {note ? <p className={cn('text-[12.5px]', alert ? 'font-semibold text-danger-ink' : 'text-muted')}>{note}</p> : null}
    </div>
  )
}

/** Ranked horizontal bars, one hue, value at the tip. */
function CategoryBars({ rows }: { rows: { label: string; value: number }[] }) {
  const t = useT()
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <table className="w-full border-separate border-spacing-y-2 text-[13.5px]">
      <caption className="sr-only">{t('Listings that are live now, by category', 'الإعلانات الظاهرة الآن حسب التصنيف')}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">{t('Category', 'التصنيف')}</th>
          <th scope="col">{t('Listings', 'الإعلانات')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="group" title={`${r.label}: ${r.value}`}>
            <th scope="row" className="w-[34%] max-w-0 truncate pe-3 text-start font-normal text-black/80">
              {r.label}
            </th>
            <td>
              <div className="flex items-center gap-2">
                <div className="h-3.5 rounded-e-[4px] bg-turquoise transition-opacity group-hover:opacity-80" style={{ width: `${(r.value / max) * 82}%`, minWidth: r.value > 0 ? 3 : 0 }} />
                <span className="tabular shrink-0 font-semibold text-black">{r.value}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Overview({ goTab }: { goTab: (tab: string) => void }) {
  const t = useT()
  const L = useL()
  const lang = useLang()
  const now = useNow()
  const listings = useStore((s) => s.listings)
  const requests = useStore((s) => s.requests)
  const deals = useStore((s) => s.deals)
  const reports = useStore((s) => s.reports)
  const users = useStore((s) => s.users)

  const students = users.filter((u) => u.role !== 'admin')
  const live = listings.filter((l) => !l.hidden && l.status !== 'completed')
  const hidden = listings.filter((l) => l.hidden).length
  const rented = deals.filter((d) => d.status === 'rented')
  const overdue = rented.filter((d) => d.returnAt != null && d.returnAt < now)
  const pending = deals.filter((d) => d.status === 'reserved').length
  const openReports = reports.filter((r) => r.status === 'open')
  const urgent = requests.filter((r) => r.status === 'open' && r.urgency === 'emergency').length
  const suspended = students.filter((u) => u.suspended).length

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({ label: L(c.name), value: live.filter((l) => l.category === c.id).length }))
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value),
    [live, L],
  )
  const worstOverdue = overdue.reduce((m, d) => Math.max(m, now - (d.returnAt ?? now)), 0)

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 divide-line rounded-card bg-wash p-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0 lg:divide-x rtl:lg:divide-x-reverse">
        <Kpi label={t('Open reports', 'بلاغات مفتوحة')} value={openReports.length} note={openReports.length ? t('Need a decision', 'تحتاج قرار') : t('Queue is clear', 'ما فيه بلاغات')} alert={openReports.length > 0} />
        <Kpi label={t('Overdue rentals', 'إيجارات متأخرة')} value={overdue.length} note={overdue.length ? t(`Longest: ${duration(worstOverdue, lang)}`, `الأطول: ${duration(worstOverdue, lang)}`) : t(`${rented.length} out on rent`, `${rented.length} مؤجَّر حاليًا`)} alert={overdue.length > 0} />
        <Kpi label={t('Live listings', 'إعلانات ظاهرة')} value={live.length} note={hidden ? t(`${hidden} hidden`, `${hidden} مخفي`) : t('None hidden', 'ما فيه مخفي')} />
        <Kpi label={t('Open requests', 'طلبات مفتوحة')} value={requests.filter((r) => r.status === 'open').length} note={t(`${urgent} for an exam today`, `${urgent} لاختبار اليوم`)} />
        <Kpi label={t('Meetups pending', 'مواعيد معلقة')} value={pending} note={t('Reserved, not handed over', 'محجوز ولم يُسلَّم')} />
        <Kpi
          label={t('Verified students', 'طلاب موثّقين')}
          value={`${students.filter((u) => u.verified).length}/${students.length}`}
          note={suspended ? t(`${suspended} suspended`, `${suspended} موقوف`) : t('None suspended', 'ما فيه موقوف')}
        />
      </dl>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="attn">
          <h2 id="attn" className="mb-3 text-[18px] font-bold text-turquoise">
            {t('Needs a decision', 'يحتاج قرار')}
          </h2>
          {openReports.length === 0 && overdue.length === 0 ? (
            <p className="rounded-card bg-wash p-4 text-[14.5px] text-muted">{t('Nothing is waiting on you. New reports and overdue rentals show up here.', 'ما فيه شي ينتظرك. البلاغات الجديدة والإيجارات المتأخرة تطلع هنا.')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {openReports.length > 0 ? (
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-wash p-4">
                  <p className="min-w-0 text-[14.5px]">
                    <strong className="font-semibold text-turquoise">{t(`${openReports.length} open ${openReports.length === 1 ? 'report' : 'reports'}`, `${openReports.length} بلاغ مفتوح`)}</strong>
                    <span className="block text-muted">{t('Oldest first. Hide the listing, suspend the student, or dismiss.', 'الأقدم أول. أخفِ الإعلان أو أوقف الطالب أو ارفض البلاغ.')}</span>
                  </p>
                  <Button size="sm" className="!min-h-11" onClick={() => goTab('reports')}>
                    {t('Review reports', 'راجع البلاغات')}
                  </Button>
                </li>
              ) : null}
              {overdue.length > 0 ? (
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-wash p-4">
                  <p className="min-w-0 text-[14.5px]">
                    <strong className="font-semibold text-turquoise">{t(`${overdue.length} overdue ${overdue.length === 1 ? 'rental' : 'rentals'}`, `${overdue.length} إيجار متأخر`)}</strong>
                    <span className="block text-muted">{t('Send the borrower a reminder before the owner files a report.', 'أرسل تذكير للمستأجر قبل ما يرفع المالك بلاغ.')}</span>
                  </p>
                  <Button size="sm" variant="secondary" className="!min-h-11" onClick={() => goTab('rentals')}>
                    {t('See rentals', 'شوف الإيجارات')}
                  </Button>
                </li>
              ) : null}
            </ul>
          )}
        </section>

        <section aria-labelledby="bycat">
          <h2 id="bycat" className="mb-1 text-[18px] font-bold text-turquoise">
            {t('Live listings by category', 'الإعلانات الظاهرة حسب التصنيف')}
          </h2>
          <p className="mb-2 text-[13px] text-muted">{t('Counts exclude hidden and completed listings.', 'العدد ما يشمل المخفي والمنتهي.')}</p>
          {byCategory.length === 0 ? <p className="text-[14.5px] text-muted">{t('No live listings.', 'ما فيه إعلانات ظاهرة.')}</p> : <CategoryBars rows={byCategory} />}
        </section>
      </div>
    </div>
  )
}

function Gate() {
  const t = useT()
  const setPersona = useStore((s) => s.setPersona)
  return (
    <div className="mx-auto max-w-[520px] py-10 text-center">
      <ShieldCheck className="mx-auto size-12 text-turquoise" aria-hidden="true" />
      <h1 className="mt-3 text-[26px] font-black text-turquoise">{t('Admins only', 'للمشرفين فقط')}</h1>
      <p className="mt-2 text-[15px] text-muted">
        {t(
          'This page is for the students who moderate the market. In this demo, access is simulated: switch to the Market Admin persona to open it.',
          'هذي الصفحة للطلاب المشرفين على السوق. في النسخة التجريبية الدخول محاكاة: بدّل لشخصية مشرف السوق عشان تفتحها.',
        )}
      </p>
      <Button className="mt-5" size="lg" onClick={() => setPersona(ADMIN_ID)}>
        {t('Switch to Market Admin', 'بدّل لمشرف السوق')}
      </Button>
    </div>
  )
}

const tabClass =
  'press relative inline-flex min-h-11 shrink-0 items-center gap-2 px-3 text-[14.5px] font-medium whitespace-nowrap text-muted outline-none hover:text-turquoise data-[active]:font-semibold data-[active]:text-turquoise focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-green'

export function Admin() {
  const t = useT()
  const me = usePersona()
  const tab = useStore((s) => s.adminTab)
  const setTab = useStore((s) => s.setAdminTab)
  const openReports = useStore((s) => s.reports.filter((r) => r.status === 'open').length)
  const now = useNow()
  const overdue = useStore((s) => s.deals.filter((d) => d.status === 'rented' && d.returnAt != null && d.returnAt < now).length)

  if (me.role !== 'admin') return <Gate />

  const count = (n: number) => (n > 0 ? <span className="tabular inline-grid min-w-5 place-items-center rounded-full bg-yellow px-1.5 text-[12px] leading-5 font-bold text-black">{n}</span> : null)

  return (
    <>
      <PageHeader
        title={t('Administration', 'الإدارة')}
        lead={t('Review reports, take down listings, manage student accounts and post notices. Every action is logged.', 'راجع البلاغات وأخفِ الإعلانات وأدر حسابات الطلاب وانشر التنبيهات. كل إجراء يتسجل.')}
      />
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as string)}>
        <Tabs.List className="no-scrollbar relative mb-6 flex gap-1 overflow-x-auto border-b border-line" aria-label={t('Admin sections', 'أقسام الإدارة')}>
          <Tabs.Tab value="overview" className={tabClass}>
            {t('Overview', 'نظرة عامة')}
          </Tabs.Tab>
          <Tabs.Tab value="reports" className={tabClass}>
            {t('Reports', 'البلاغات')}
            {count(openReports)}
          </Tabs.Tab>
          <Tabs.Tab value="listings" className={tabClass}>
            {t('Listings', 'الإعلانات')}
          </Tabs.Tab>
          <Tabs.Tab value="students" className={tabClass}>
            {t('Students', 'الطلاب')}
          </Tabs.Tab>
          <Tabs.Tab value="rentals" className={tabClass}>
            {t('Deals and rentals', 'الصفقات والإيجارات')}
            {count(overdue)}
          </Tabs.Tab>
          <Tabs.Tab value="announcement" className={tabClass}>
            {t('Announcement', 'التنبيه العام')}
          </Tabs.Tab>
          <Tabs.Tab value="activity" className={tabClass}>
            {t('Activity log', 'سجل الإجراءات')}
          </Tabs.Tab>
          <Tabs.Indicator className="absolute bottom-0 h-0.5 rounded-full bg-turquoise transition-[left,right,width] duration-200 ease-out" style={{ left: 'var(--active-tab-left)', width: 'var(--active-tab-width)' }} />
        </Tabs.List>
        <Tabs.Panel value="overview" className="outline-none">
          <Overview goTab={setTab} />
        </Tabs.Panel>
        <Tabs.Panel value="reports" className="outline-none">
          <ReportsTab />
        </Tabs.Panel>
        <Tabs.Panel value="listings" className="outline-none">
          <ListingsTab />
        </Tabs.Panel>
        <Tabs.Panel value="students" className="outline-none">
          <StudentsTab />
        </Tabs.Panel>
        <Tabs.Panel value="rentals" className="outline-none">
          <RentalsTab />
        </Tabs.Panel>
        <Tabs.Panel value="announcement" className="outline-none">
          <AnnouncementTab />
        </Tabs.Panel>
        <Tabs.Panel value="activity" className="outline-none">
          <Activity />
        </Tabs.Panel>
      </Tabs.Root>
    </>
  )
}

