import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Option<T extends string> {
  value: T
  label: ReactNode
}

interface Props<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (v: T) => void
  className?: string
  /** Stretch options to fill the row. */
  fill?: boolean
}

/** Single-choice control. Radio semantics so arrow keys and screen readers work. */
export function Segmented<T extends string>({ label, value, options, onChange, className, fill }: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-[10px] bg-wash-strong p-1', !fill && 'w-fit', className)}
      onKeyDown={(e) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
        e.preventDefault()
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
        const forward = e.key === 'ArrowDown' || (e.key === 'ArrowRight') !== rtl
        const i = options.findIndex((o) => o.value === value)
        const next = options[(i + (forward ? 1 : -1) + options.length) % options.length]
        onChange(next.value)
        requestAnimationFrame(() => e.currentTarget.querySelector<HTMLElement>('[aria-checked="true"]')?.focus())
      }}
    >
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              'press inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-[7px] px-3 text-[13.5px] font-medium whitespace-nowrap',
              fill && 'flex-1',
              on ? 'bg-turquoise text-white' : 'text-turquoise hover:bg-white/70',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Multi-select filter chip. */
export function Chip({
  on,
  onClick,
  children,
  className,
}: {
  on: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-medium whitespace-nowrap',
        on ? 'border-turquoise bg-turquoise text-white' : 'border-turquoise/25 bg-white text-turquoise hover:border-turquoise/60',
        className,
      )}
    >
      {children}
    </button>
  )
}
