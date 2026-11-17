import type { RateUnit, Rent } from './types'

const HOUR = 3_600_000

export interface Quote {
  ok: boolean
  error?: 'order' | 'short'
  hours: number
  fee: number
  /** How the fee was reached, e.g. [{ unit: 'day', qty: 2, rate: 20 }]. */
  lines: { unit: RateUnit; qty: number; rate: number }[]
  deposit: number
  total: number
}

/** An exam slot covers a sitting plus buffer. */
export const EXAM_HOURS = 4

/**
 * Cheapest way to cover [start, end] with the rates the owner offers.
 * Partial units round up: 25 hours on a daily rate is 2 days.
 */
export function quoteRental(rent: Rent, start: number, end: number): Quote {
  const base = { hours: 0, fee: 0, lines: [], deposit: rent.deposit, total: rent.deposit }
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return { ok: false, error: 'order', ...base }
  const hours = (end - start) / HOUR
  if (hours < 0.5) return { ok: false, error: 'short', ...base, hours }

  const r = rent.rates
  const options: Quote['lines'][] = []
  const days = Math.ceil(hours / 24)

  if (r.exam != null && hours <= EXAM_HOURS) options.push([{ unit: 'exam', qty: 1, rate: r.exam }])
  if (r.hour != null) options.push([{ unit: 'hour', qty: Math.ceil(hours), rate: r.hour }])
  if (r.day != null) options.push([{ unit: 'day', qty: days, rate: r.day }])
  if (r.weekend != null && hours <= 72 && coversWeekend(start, end)) options.push([{ unit: 'weekend', qty: 1, rate: r.weekend }])
  if (r.week != null) {
    const weeks = Math.ceil(days / 7)
    options.push([{ unit: 'week', qty: weeks, rate: r.week }])
    if (r.day != null && days > 7) {
      const full = Math.floor(days / 7)
      const rest = days - full * 7
      const lines: Quote['lines'] = [{ unit: 'week', qty: full, rate: r.week }]
      if (rest > 0) lines.push({ unit: 'day', qty: rest, rate: r.day })
      options.push(lines)
    }
  }
  // Longer than an exam slot with only an exam rate: charge per slot.
  if (options.length === 0 && r.exam != null) options.push([{ unit: 'exam', qty: Math.ceil(hours / EXAM_HOURS), rate: r.exam }])
  if (options.length === 0) return { ok: false, error: 'short', ...base, hours }

  const cost = (l: Quote['lines']) => l.reduce((s, x) => s + x.qty * x.rate, 0)
  const best = options.reduce((a, b) => (cost(b) < cost(a) ? b : a))
  const fee = cost(best)
  return { ok: true, hours, fee, lines: best, deposit: rent.deposit, total: fee + rent.deposit }
}

/** Saudi weekend: the window touches Friday or Saturday. */
function coversWeekend(start: number, end: number): boolean {
  for (let t = start; t <= end; t += 6 * HOUR) {
    const d = new Date(t).getDay()
    if (d === 5 || d === 6) return true
  }
  const d = new Date(end).getDay()
  return d === 5 || d === 6
}

export function lowestRate(rent: Rent): { unit: RateUnit; rate: number } {
  const order: RateUnit[] = ['exam', 'hour', 'day', 'weekend', 'week']
  let best: { unit: RateUnit; rate: number } | null = null
  for (const unit of order) {
    const rate = rent.rates[unit]
    if (rate != null && (best == null || rate < best.rate)) best = { unit, rate }
  }
  return best ?? { unit: 'day', rate: 0 }
}
