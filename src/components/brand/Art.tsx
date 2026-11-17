import { cn } from '../../lib/cn'
import type { Tone } from '../../lib/types'
import { NamedIcon } from '../ui/Icon'

/** Field and bar colors. Each pair is an approved brand combination (DESIGN_SYSTEM.md §1.7, §4). */
const TONE: Record<Tone, { bg: string; bar: string; ink: string }> = {
  turquoise: { bg: '#115F66', bar: '#009767', ink: '#ECE0C7' },
  green: { bg: '#009767', bar: '#115F66', ink: '#FFFFFF' },
  beige: { bg: '#ECE0C7', bar: '#AA8C6D', ink: '#115F66' },
  sand: { bg: '#AA8C6D', bar: '#ECE0C7', ink: '#FFFFFF' },
  yellow: { bg: '#F0BA4F', bar: '#115F66', ink: '#115F66' },
  blue: { bg: '#71B8D4', bar: '#115F66', ink: '#115F66' },
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Matrix bars: rows of parallelograms on a 5° skew, widths drawn from three units. */
export function MatrixBars({ seed, color, rows = 4, opacity = 0.5 }: { seed: string; color: string; rows?: number; opacity?: number }) {
  const W = 160
  const H = 120
  const rowH = H / rows
  const skew = rowH * Math.tan((5 * Math.PI) / 180)
  let h = hash(seed)
  const rnd = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0
    return h / 4294967296
  }
  const paths: string[] = []
  for (let r = 0; r < rows; r++) {
    const y = r * rowH
    let x = -10 + rnd() * 30
    const dense = rnd()
    while (x < W + 10) {
      const unit = [1.2, 2.4, 4.6][Math.floor(rnd() * 3)]
      const gap = 5.5 - unit * 0.5
      if (rnd() < 0.35 + dense * 0.5) {
        paths.push(`M${x + skew} ${y}h${unit}l${-skew} ${rowH}h${-unit}z`)
      }
      x += unit + gap
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <path d={paths.join('')} fill={color} opacity={opacity} />
    </svg>
  )
}

/**
 * Tile shown when a listing has no photo: brand field, matrix bars and the item's pictogram.
 * It is a placeholder, not a picture of the item.
 */
export function Art({
  id,
  icon,
  tone,
  photo,
  alt,
  className,
  iconClassName,
}: {
  id: string
  icon: string
  tone: Tone
  photo?: string
  alt: string
  className?: string
  iconClassName?: string
}) {
  const c = TONE[tone] ?? TONE.beige
  if (photo) {
    return (
      <div className={cn('relative overflow-hidden bg-beige', className)}>
        <img src={photo} alt={alt} loading="lazy" className="lift absolute inset-0 size-full object-cover" />
      </div>
    )
  }
  return (
    <div className={cn('relative grid place-items-center overflow-hidden', className)} style={{ background: c.bg }} role="img" aria-label={alt}>
      <MatrixBars seed={id} color={c.bar} opacity={tone === 'beige' || tone === 'turquoise' ? 0.55 : 0.32} />
      <NamedIcon name={icon} className={cn('lift relative size-14', iconClassName)} strokeWidth={1.5} style={{ color: c.ink }} />
    </div>
  )
}
