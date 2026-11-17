import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'neutral' | 'turquoise' | 'green' | 'yellow' | 'error' | 'outline' | 'blue' | 'beige'

const tones: Record<Tone, string> = {
  neutral: 'bg-black/[0.06] text-black',
  turquoise: 'bg-turquoise text-white',
  green: 'bg-success/20 text-turquoise',
  yellow: 'bg-yellow text-black',
  error: 'bg-error/20 text-danger-ink',
  outline: 'border border-turquoise/30 text-turquoise',
  blue: 'bg-info/35 text-black',
  beige: 'bg-beige text-turquoise',
}

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 max-w-full items-center gap-1 rounded-full px-2.5 text-[12.5px] font-medium leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
