import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-sm',
  secondary:
    'bg-white/80 text-[var(--ink)] border border-[var(--line)] hover:bg-white',
  ghost: 'bg-transparent text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)]',
  danger: 'bg-[var(--danger)] text-white hover:opacity-90',
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
