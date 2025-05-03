import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner Component', () => {
  test('renderiza o spinner corretamente com configurações padrão', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-8 w-8') // tamanho médio padrão
    expect(spinner).toHaveClass('text-celebra-blue') // cor primária padrão
  })

  test('aplica a classe de tamanho correto com base na prop size', () => {
    const { rerender } = render(<LoadingSpinner size="small" />)

    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-4 w-4')

    rerender(<LoadingSpinner size="medium" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-8 w-8')

    rerender(<LoadingSpinner size="large" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-12 w-12')
  })

  test('aplica a classe de cor correta com base na prop color', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />)

    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'text-celebra-blue'
    )

    rerender(<LoadingSpinner color="white" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-white')

    rerender(<LoadingSpinner color="gray" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-gray-500')
  })

  test('aplica classes adicionais passadas via prop className', () => {
    render(<LoadingSpinner className="mt-4 custom-class" />)

    const container = screen.getByTestId('loading-spinner').parentElement
    expect(container).toHaveClass('mt-4')
    expect(container).toHaveClass('custom-class')
  })

  test('exibe o texto quando a prop text é fornecida', () => {
    render(<LoadingSpinner text="Carregando..." />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  test('não exibe texto quando a prop text não é fornecida', () => {
    render(<LoadingSpinner />)

    const container = screen.getByTestId('loading-spinner').parentElement
    expect(container?.textContent).toBe('')
  })
})
