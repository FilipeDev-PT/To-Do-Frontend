import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export function Textarea({ className, label, error, id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-[var(--ink)]">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-28 w-full resize-y rounded-lg border border-[var(--line)] bg-white/90 px-3 py-2 text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]',
          error && 'border-[var(--danger)]',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--danger)]">{error}</span> : null}
    </label>
  )
}
