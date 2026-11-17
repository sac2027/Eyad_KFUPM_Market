import { cn } from '../../lib/cn'
import { useLang } from '../../lib/i18n'

/**
 * FAST Matrix emblem: bold, medium and light bars on a 5° skew.
 * Built from the matrix units only. It does not use the KFUPM octagon or tower.
 */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('shrink-0', className)} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--color-turquoise)" />
      <g fill="var(--color-beige)">
        <path d="M7.6 6h2.2l-.9 10H6.7z" />
        <path d="M12.2 6h3.4l-.9 10h-3.4z" />
        <path d="M18 6h4.6l-.9 10h-4.6z" />
      </g>
      <g fill="var(--color-green)">
        <path d="M9.5 16h4.6l-.9 10H8.6z" />
        <path d="M16.5 16h3.4l-.9 10h-3.4z" />
        <path d="M22.3 16h2.2l-.9 10h-2.2z" />
      </g>
    </svg>
  )
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  const lang = useLang()
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} translate="no">
      <Emblem className="size-9" />
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[19px] font-black tracking-tight text-frame-ink">
            {lang === 'ar' ? 'سوق البترول' : 'KFUPM Market'}
          </span>
          <span className="mt-1 text-[11.5px] font-medium text-frame-ink/75">{lang === 'ar' ? 'KFUPM Market' : 'سوق البترول'}</span>
        </span>
      )}
    </span>
  )
}
