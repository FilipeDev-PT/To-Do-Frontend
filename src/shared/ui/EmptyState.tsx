import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--line)] bg-white/40 px-6 py-12 text-center">
      <h3 className="font-display text-xl text-[var(--ink)]">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-[var(--ink-muted)]">{description}</p> : null}
      {action}
    </div>
  )
}
