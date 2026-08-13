import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Button } from '@/shared/ui/Button'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-[var(--ink)]/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="modal-title" className="font-display text-xl text-[var(--ink)]">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Fechar">
            ✕
          </Button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}
