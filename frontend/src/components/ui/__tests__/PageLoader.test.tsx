import React from 'react'
import { render, screen } from '@testing-library/react'
import PageLoader from '../PageLoader'

// Mock do componente LoadingSpinner para isolar o teste
jest.mock('../LoadingSpinner', () => {
  return function MockLoadingSpinner(props: any) {
    return <div data-testid="mock-loading-spinner" {...props} />
  }
})

describe('PageLoader Component', () => {
  test('renderiza o componente corretamente com mensagem padrão', () => {
    render(<PageLoader />)

    // Verificar se o LoadingSpinner está sendo renderizado
    expect(screen.getByTestId('mock-loading-spinner')).toBeInTheDocument()

    // Verificar se a mensagem padrão está correta
    expect(screen.getByText('Carregando dados...')).toBeInTheDocument()
  })

  test('renderiza com a mensagem personalizada quando fornecida', () => {
    const customMessage = 'Processando sua solicitação...'
    render(<PageLoader message={customMessage} />)

    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  test('passa as props corretas para o LoadingSpinner', () => {
    render(<PageLoader />)

    const spinner = screen.getByTestId('mock-loading-spinner')
    expect(spinner).toHaveAttribute('size', 'large')
    expect(spinner).toHaveAttribute('color', 'primary')
  })

  test('tem a classe de altura mínima para centralizar o conteúdo', () => {
    render(<PageLoader />)

    // O contêiner do PageLoader deve ter uma classe de altura mínima
    const container = screen.getByTestId('mock-loading-spinner').parentElement
    expect(container).toHaveClass('min-h-[300px]')
  })
})
