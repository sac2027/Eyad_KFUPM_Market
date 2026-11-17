import type { CategoryId, Condition, Kind, Listing } from './types'

/** Typical asking prices on campus for a like-new item, in SAR. Hand-set starting points. */
const BASE: Record<CategoryId, [number, number]> = {
  academic: [40, 160],
  hardware: [60, 320],
  dorm: [100, 420],
  mobility: [250, 900],
  gaming: [150, 1400],
  sports: [80, 450],
  camping: [90, 500],
  services: [20, 120],
}

const CONDITION: Record<Condition, number> = { new: 1.15, likeNew: 1, good: 0.78, battle: 0.55 }

export interface Suggestion {
  low: number
  high: number
  /** Number of comparable listings on the market that shaped the range. */
  comparables: number
}

const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5)

export function suggestPrice(category: CategoryId, condition: Condition, kind: Kind, listings: Listing[]): Suggestion {
  let [low, high] = BASE[category]
  const similar = listings.filter(
    (l) => l.category === category && (l.kind === 'sale' || l.kind === 'bundle') && l.price > 0 && l.status !== 'completed',
  )
  if (similar.length >= 3) {
    const sorted = similar.map((l) => l.price).sort((a, b) => a - b)
    const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
    // Blend the hand-set range with what is listed right now.
    low = low * 0.7 + q(0.25) * 0.3
    high = high * 0.7 + Math.min(q(0.75), high * 1.6) * 0.3
  }
  const k = CONDITION[condition]
  low *= k
  high *= k
  if (kind === 'rent') {
    // A day's rent sits around 4-8% of resale value.
    low *= 0.04
    high *= 0.08
  }
  if (kind === 'bundle') {
    low *= 1.8
    high *= 2.4
  }
  low = round5(low)
  high = Math.max(low + 5, round5(high))
  return { low, high, comparables: similar.length }
}

export function verdict(price: number, s: Suggestion): 'low' | 'fair' | 'high' {
  if (price < s.low * 0.85) return 'low'
  if (price > s.high * 1.15) return 'high'
  return 'fair'
}
