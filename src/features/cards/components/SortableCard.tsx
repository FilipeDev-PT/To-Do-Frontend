import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '@/entities/board'
import { cn } from '@/shared/lib/cn'

type SortableCardProps = {
  card: Card
  onOpen: (card: Card) => void
}

export function SortableCard({ card, onOpen }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  })

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'w-full rounded-xl border border-[var(--line)] bg-white p-3 text-left shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md',
        isDragging && 'opacity-40 shadow-none',
      )}
      onClick={() => onOpen(card)}
      {...attributes}
      {...listeners}
    >
      <p className="text-sm font-medium text-[var(--ink)]">{card.title}</p>
      {card.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-muted)]">{card.description}</p>
      ) : null}
    </button>
  )
}

export function CardPreview({ card }: { card: Card }) {
  return (
    <div className="w-72 rounded-xl border border-[var(--accent)]/40 bg-white p-3 shadow-xl rotate-1">
      <p className="text-sm font-medium text-[var(--ink)]">{card.title}</p>
      {card.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-muted)]">{card.description}</p>
      ) : null}
    </div>
  )
}
