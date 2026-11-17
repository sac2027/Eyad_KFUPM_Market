import type { Lang } from './types'

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** Western digits in both languages so prices read the same everywhere. */
export function num(n: number): string {
  return nf.format(Math.round(n))
}

export function sar(n: number, lang: Lang): string {
  return lang === 'ar' ? `${num(n)} ر.س` : `SAR ${num(n)}`
}

const locale = (lang: Lang) => (lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB')

export function dayTime(ts: number, lang: Lang, now = Date.now()): string {
  const d = new Date(ts)
  const time = new Intl.DateTimeFormat(locale(lang), { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((new Date(ts).setHours(0, 0, 0, 0) - start.getTime()) / 86_400_000)
  let day: string
  if (diffDays === 0) day = lang === 'ar' ? 'اليوم' : 'Today'
  else if (diffDays === 1) day = lang === 'ar' ? 'بكرة' : 'Tomorrow'
  else if (diffDays === -1) day = lang === 'ar' ? 'أمس' : 'Yesterday'
  else day = new Intl.DateTimeFormat(locale(lang), { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
  return lang === 'ar' ? `${day}، ${time}` : `${day}, ${time}`
}

export function ago(ts: number, lang: Lang, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - ts) / 60_000))
  if (m < 1) return lang === 'ar' ? 'الآن' : 'just now'
  if (m < 60) return lang === 'ar' ? `قبل ${m} د` : `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return lang === 'ar' ? `قبل ${h} س` : `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return lang === 'ar' ? `قبل ${d} يوم` : `${d}d ago`
  const mo = Math.round(d / 30)
  return lang === 'ar' ? `قبل ${mo} شهر` : `${mo}mo ago`
}

/** "2h 05m" style duration; negative input is clamped to zero. */
export function duration(ms: number, lang: Lang): string {
  const total = Math.max(0, Math.floor(ms / 60_000))
  const d = Math.floor(total / 1440)
  const h = Math.floor((total % 1440) / 60)
  const m = total % 60
  if (lang === 'ar') {
    if (d > 0) return `${d} يوم ${h} س`
    if (h > 0) return `${h} س ${String(m).padStart(2, '0')} د`
    return `${m} د`
  }
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m`
}

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInput(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function fromLocalInput(v: string): number {
  const t = new Date(v).getTime()
  return Number.isFinite(t) ? t : NaN
}
