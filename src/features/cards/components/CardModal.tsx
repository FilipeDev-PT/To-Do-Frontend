import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Card } from '@/entities/board'
import { useDeleteCard, useUpdateCard } from '@/features/cards'
import { Button, Input, Modal, Textarea } from '@/shared/ui'

const formSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título'),
  description: z.string(),
})

type FormValues = z.infer<typeof formSchema>

type CardModalProps = {
  boardId: string
  card: Card | null
  onClose: () => void
}

export function CardModal({ boardId, card, onClose }: CardModalProps) {
  const updateCard = useUpdateCard(boardId)
  const deleteCard = useDeleteCard(boardId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' },
  })

  useEffect(() => {
    if (card) {
      reset({ title: card.title, description: card.description ?? '' })
    }
  }, [card, reset])

  async function onSubmit(values: FormValues) {
    if (!card) return
    await updateCard.mutateAsync({
      cardId: card.id,
      input: { title: values.title, description: values.description },
    })
    onClose()
  }

  return (
    <Modal
      open={Boolean(card)}
      title="Editar card"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="danger"
            disabled={deleteCard.isPending}
            onClick={async () => {
              if (!card) return
              if (!window.confirm('Apagar este card?')) return
              await deleteCard.mutateAsync(card.id)
              onClose()
            }}
          >
            Apagar
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="card-edit-form" type="submit" disabled={isSubmitting || updateCard.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="card-edit-form" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Título" error={errors.title?.message} {...register('title')} />
        <Textarea
          label="Descrição"
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </Modal>
  )
}
