import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'yellow' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-turquoise text-white hover:bg-[#0d4d53] disabled:bg-gray disabled:text-black/70',
  secondary: 'border border-turquoise/40 text-turquoise bg-white hover:bg-wash-strong disabled:opacity-50',
  ghost: 'text-turquoise hover:bg-wash-strong disabled:opacity-50',
  danger: 'border border-error text-danger-ink bg-white hover:bg-error/10 disabled:opacity-50',
  yellow: 'bg-yellow text-black hover:bg-[#e9ad37] disabled:opacity-50',
  whatsapp: 'border-2 border-green bg-white text-turquoise hover:bg-success/10 disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-[13px] gap-1.5',
  md: 'min-h-11 px-4 text-[15px] gap-2',
  lg: 'min-h-12 px-5 text-[16px] gap-2',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'press inline-flex items-center justify-center rounded-control font-semibold whitespace-nowrap select-none',
    variants[variant],
    sizes[size],
    className,
  )
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant, size, className, type = 'button', ...props }: Props) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

export function IconButton({
  label,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn('press inline-grid size-11 shrink-0 place-items-center rounded-control', className)}
      {...props}
    />
  )
}
