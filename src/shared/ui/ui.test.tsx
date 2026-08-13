import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { render, screen, userEvent } from '@/test/test-utils'

describe('UI components', () => {
  it('renders Button and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Salvar</Button>)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows Input error message', () => {
    render(<Input label="Título" error="Informe um título" />)
    expect(screen.getByText('Informe um título')).toBeInTheDocument()
  })

  it('closes Modal with Escape and close button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal open title="Editar" onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()

    onClose.mockClear()
    rerender(
      <Modal open title="Editar" onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>,
    )
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
