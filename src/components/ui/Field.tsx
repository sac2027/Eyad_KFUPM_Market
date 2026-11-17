import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Label, control and message wired together. `children` receives the ids to apply. */
export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string
  hint?: ReactNode
  error?: ReactNode
  className?: string
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}) {
  const id = useId()
  const msgId = `${id}-msg`
  const has = Boolean(error || hint)
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-semibold text-turquoise">
        {label}
      </label>
      {children({ id, describedBy: has ? msgId : undefined, invalid: Boolean(error) })}
      {has ? (
        <p id={msgId} className={cn('mt-1.5 text-[12.5px]', error ? 'font-medium text-danger-ink' : 'text-muted')} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      ) : null}
    </div>
  )
}
