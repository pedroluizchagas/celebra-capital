import React from 'react'
import { render, screen } from '@testing-library/react'
import Button from './Button'
import { checkA11y, axeConfig } from '../utils/axeHelper'

describe('Button - Testes de Acessibilidade', () => {
  it('não deve ter violações de acessibilidade (botão padrão)', async () => {
    await checkA11y(
      <Button onClick={() => {}}>Botão de Teste</Button>,
      axeConfig
    )
  })

  it('não deve ter violações de acessibilidade (botão desabilitado)', async () => {
    await checkA11y(
      <Button disabled onClick={() => {}}>
        Botão Desabilitado
      </Button>,
      axeConfig
    )
  })

  it('não deve ter violações de acessibilidade (botão com ícone)', async () => {
    const IconElement = () => <span aria-hidden="true">★</span>

    await checkA11y(
      <Button onClick={() => {}} className="flex items-center gap-2">
        <IconElement />
        Botão com Ícone
      </Button>,
      axeConfig
    )
  })

  it('não deve ter violações de acessibilidade (botão de carregamento)', async () => {
    await checkA11y(
      <Button isLoading onClick={() => {}}>
        Carregando
      </Button>,
      axeConfig
    )
  })

  it('não deve ter violações de acessibilidade (botão secundário)', async () => {
    await checkA11y(
      <Button variant="secondary" onClick={() => {}}>
        Secundário
      </Button>,
      axeConfig
    )
  })

  it('deve ter um papel apropriado para acessibilidade', () => {
    render(<Button onClick={() => {}}>Botão de Teste</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('deve suportar navegação por teclado quando focado', () => {
    render(<Button onClick={() => {}}>Botão de Teste</Button>)
    const button = screen.getByRole('button')

    // Verifica se o elemento pode receber foco
    button.focus()
    expect(document.activeElement).toBe(button)

    // Verifica se o botão é naturalmente focável (não precisa verificar tabindex)
    expect(button).not.toHaveAttribute('tabindex')
  })
})
