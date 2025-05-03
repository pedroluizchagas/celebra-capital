import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  test('renderiza corretamente com o texto do botão', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByText('Clique aqui')).toBeInTheDocument()
  })

  test('aplica a variante primária por padrão', () => {
    render(<Button>Botão Primário</Button>)
    const button = screen.getByText('Botão Primário')
    expect(button).toHaveClass('bg-primary-600')
  })

  test('aplica a variante secundária quando especificada', () => {
    render(<Button variant="secondary">Botão Secundário</Button>)
    const button = screen.getByText('Botão Secundário')
    expect(button).toHaveClass('bg-secondary-600')
  })

  test('aplica a variante outline quando especificada', () => {
    render(<Button variant="outline">Botão Outline</Button>)
    const button = screen.getByText('Botão Outline')
    expect(button).toHaveClass('border-gray-300')
    expect(button).toHaveClass('bg-white')
  })

  test('aplica o tamanho médio por padrão', () => {
    render(<Button>Botão Médio</Button>)
    const button = screen.getByText('Botão Médio')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  test('aplica o tamanho pequeno quando especificado', () => {
    render(<Button size="sm">Botão Pequeno</Button>)
    const button = screen.getByText('Botão Pequeno')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-1.5')
  })

  test('aplica o tamanho grande quando especificado', () => {
    render(<Button size="lg">Botão Grande</Button>)
    const button = screen.getByText('Botão Grande')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  test('fica desabilitado quando a prop disabled é true', () => {
    render(<Button disabled>Botão Desabilitado</Button>)
    const button = screen.getByText('Botão Desabilitado')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-60')
  })

  test('fica desabilitado quando isLoading é true e mostra o indicador de carregamento', () => {
    render(<Button isLoading>Botão Carregando</Button>)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.queryByText('Botão Carregando')).not.toBeInTheDocument()
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-60')
  })

  test('chama o onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Botão Clicável</Button>)
    fireEvent.click(screen.getByText('Botão Clicável'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('não chama o onClick quando desabilitado', () => {
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        Botão Desabilitado
      </Button>
    )
    fireEvent.click(screen.getByText('Botão Desabilitado'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('não chama o onClick quando está carregando', () => {
    const handleClick = jest.fn()
    render(
      <Button isLoading onClick={handleClick}>
        Botão Carregando
      </Button>
    )
    fireEvent.click(screen.getByText('Carregando...'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
