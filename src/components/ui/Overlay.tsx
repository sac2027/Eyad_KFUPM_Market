import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/cn'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Extra controls beside the close button. */
  headerExtra?: ReactNode
  wide?: boolean
}

function Header({ title, description, headerExtra }: Pick<Props, 'title' | 'description' | 'headerExtra'>) {
  const t = useT()
  return (
    <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <Dialog.Title className="line-clamp-3 font-display text-[20px] font-bold text-turquoise [overflow-wrap:anywhere]" title={typeof title === 'string' ? title : undefined}>
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 text-[13.5px] text-muted [overflow-wrap:anywhere]">{description}</Dialog.Description>
        ) : null}
      </div>
      {headerExtra}
      <Dialog.Close
        aria-label={t('Close', 'إغلاق')}
        className="press -me-2 -mt-1 inline-grid size-11 shrink-0 place-items-center rounded-control text-turquoise hover:bg-wash-strong"
      >
        <X className="size-5" aria-hidden="true" />
      </Dialog.Close>
    </div>
  )
}

/** Side sheet on desktop (from the inline end), bottom sheet on phones. */
export function Sheet({ open, onOpenChange, title, description, children, footer, headerExtra, wide }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="overlay-backdrop z-40" />
        <Dialog.Popup
          ref={ref}
          initialFocus={ref}
          className={cn(
            'sheet-popup fixed z-50 flex flex-col bg-white shadow-float outline-none',
            'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-sheet',
            'md:inset-y-0 md:start-auto md:end-0 md:max-h-none md:w-full md:rounded-none md:rounded-s-sheet',
            wide ? 'md:max-w-[640px]' : 'md:max-w-[520px]',
          )}
        >
          <Header title={title} description={description} headerExtra={headerExtra} />
          <div className="scroll-thin min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">{children}</div>
          {footer ? (
            <div className="border-t border-line bg-white px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Modal({ open, onOpenChange, title, description, children, footer, wide }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="overlay-backdrop z-40" />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <Dialog.Popup
            ref={ref}
            initialFocus={ref}
            className={cn(
              'modal-popup pointer-events-auto flex max-h-[92dvh] w-full min-w-0 flex-col rounded-t-sheet bg-white shadow-float outline-none sm:rounded-sheet',
              wide ? 'sm:max-w-[720px]' : 'sm:max-w-[480px]',
            )}
          >
            <Header title={title} description={description} />
            <div className="scroll-thin min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">{children}</div>
            {footer ? (
              <div className="border-t border-line px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>
            ) : null}
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
